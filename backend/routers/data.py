"""Data endpoints for education analytics"""
from typing import Optional, List
import pandas as pd
from fastapi import APIRouter, Query, HTTPException
from utils.data_loader import (
    get_cached_data,
    COUNTRY_INFO,
    NUMERIC_COLUMNS,
    dataframe_to_records,
)

router = APIRouter(prefix="/api", tags=["data"])


@router.get("/health")
def health_check():
    """Health check endpoint with dataset metadata"""
    df = get_cached_data()
    years_min = int(df["year"].min())
    years_max = int(df["year"].max())
    
    return {
        "status": "ok",
        "countries": len(df["country"].unique()),
        "years": f"{years_min}-{years_max}",
    }


@router.get("/countries")
def list_countries() -> List[dict]:
    """Return all 7 countries with ISO3 codes, flag emojis, and coordinates"""
    countries = []
    for country_name in sorted(COUNTRY_INFO.keys()):
        info = COUNTRY_INFO[country_name]
        countries.append({
            "name": country_name,
            "iso3": info["iso3"],
            "flag": info["flag"],
            "lat": info["lat"],
            "lng": info["lng"],
        })
    return countries


@router.get("/map-data")
def get_map_data(
    indicator: str = Query(..., description="Indicator to display on map"),
    year: int = Query(..., description="Year for the map data"),
) -> List[dict]:
    """
    Return one value per country per indicator for a given year
    
    Powers choropleth map visualization
    Returns: [{ iso3, country, value, lat, lng }]
    
    Example: GET /api/map-data?indicator=primary_enrollment_rate&year=2020
    """
    df = get_cached_data()
    
    # Validate indicator
    if indicator not in NUMERIC_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"Indicator '{indicator}' not found. Valid indicators: {', '.join(NUMERIC_COLUMNS)}"
        )
    
    # Get data for the specified year
    year_data = df[df["year"] == year].copy()
    
    if year_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for year {year}"
        )
    
    # Build map response
    map_data = []
    for country_name in sorted(COUNTRY_INFO.keys()):
        country_row = year_data[year_data["country"] == country_name]
        
        if country_row.empty:
            continue
        
        value = country_row[indicator].iloc[0]
        
        # Skip if value is NaN
        if pd.isna(value):
            continue
        
        info = COUNTRY_INFO[country_name]
        map_data.append({
            "iso3": info["iso3"],
            "country": country_name,
            "value": float(value),
            "lat": info["lat"],
            "lng": info["lng"],
        })
    
    return map_data


@router.get("/data")
def get_data(
    country: Optional[str] = Query(None, description="Filter by country name"),
    year_from: Optional[int] = Query(None, description="Min year (inclusive)"),
    year_to: Optional[int] = Query(None, description="Max year (inclusive)"),
    indicator: Optional[str] = Query(None, description="Specific numeric indicator column"),
) -> List[dict]:
    """
    Return full dataset as JSON with optional filters
    
    Examples:
    - GET /api/data — all data
    - GET /api/data?country=Kenya — single country
    - GET /api/data?year_from=2015&year_to=2023 — year range
    - GET /api/data?indicator=primary_enrollment_rate — specific indicator
    """
    df = get_cached_data().copy()
    
    # Filter by country
    if country:
        if country not in COUNTRY_INFO:
            raise HTTPException(
                status_code=400,
                detail=f"Country '{country}' not found. Must be one of: {', '.join(COUNTRY_INFO.keys())}"
            )
        df = df[df["country"] == country]
    
    # Filter by year range
    if year_from is not None:
        df = df[df["year"] >= year_from]
    if year_to is not None:
        df = df[df["year"] <= year_to]
    
    # Select specific indicator
    if indicator:
        if indicator not in NUMERIC_COLUMNS and indicator != "year" and indicator != "country":
            raise HTTPException(
                status_code=400,
                detail=f"Indicator '{indicator}' not found in numeric columns"
            )
        cols_to_keep = ["country", "year", indicator]
        cols_to_keep = [c for c in cols_to_keep if c in df.columns]
        df = df[cols_to_keep]
    
    if df.empty:
        return []
    
    return dataframe_to_records(df)


@router.get("/summary")
def summary_stats() -> dict:
    """
    Return computed summary statistics per country
    
    For each numeric indicator, return: mean, min, max
    """
    df = get_cached_data()
    
    summary = {}
    for country in sorted(df["country"].unique()):
        country_data = df[df["country"] == country]
        
        country_summary = {}
        for col in NUMERIC_COLUMNS:
            if col in country_data.columns:
                country_data_clean = country_data[col].dropna()
                if len(country_data_clean) > 0:
                    country_summary[col] = {
                        "mean": float(country_data_clean.mean()),
                        "min": float(country_data_clean.min()),
                        "max": float(country_data_clean.max()),
                    }
        
        summary[country] = country_summary
    
    return summary


@router.get("/trends/{iso3}")
def get_trends(iso3: str) -> List[dict]:
    """
    Return all years of data for one country sorted by year
    
    iso3 must be a 3-letter country code (e.g., KEN, TZA, UGA)
    """
    # Find country by ISO3 code
    country_name = None
    for name, info in COUNTRY_INFO.items():
        if info["iso3"] == iso3.upper():
            country_name = name
            break
    
    if not country_name:
        raise HTTPException(
            status_code=404,
            detail=f"ISO3 code '{iso3}' not found. Valid codes: {', '.join(info['iso3'] for info in COUNTRY_INFO.values())}"
        )

@router.get("/public-info")
def get_public_info():
    return {
        "title": "East Africa Education Dashboard",
        "subtitle": "Analyze trends in education across 7 countries",
        "source": "World Bank Open Data",
        "years": "2010-2023",
        "countries_count": 7,
    }

@router.get("/trend")
def get_trend(countries: Optional[str] = Query("all")):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    df = df.dropna(subset=["primary_enrollment_rate"])
    result = dataframe_to_records(df.groupby(["country", "year"])["primary_enrollment_rate"].mean().reset_index())
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/enrollment")
def get_enrollment(countries: Optional[str] = Query("all"), year: Optional[int] = Query(2023)):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    df = df[df["year"] == year]
    df = df.dropna(subset=["primary_enrollment_rate", "secondary_enrollment_rate"])
    result = dataframe_to_records(df[["country", "primary_enrollment_rate", "secondary_enrollment_rate"]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/literacy")
def get_literacy(countries: Optional[str] = Query("all"), year: Optional[int] = Query(2023)):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    df = df[df["year"] == year]
    df = df.dropna(subset=["literacy_rate_adult", "literacy_rate_youth_male", "literacy_rate_youth_female"])
    result = dataframe_to_records(df[["country", "literacy_rate_adult", "literacy_rate_youth_male", "literacy_rate_youth_female"]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/completion")
def get_completion(countries: Optional[str] = Query("all"), year: Optional[int] = Query(None)):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    if year:
        df = df[df["year"] == year]
        
    df = df.dropna(subset=["primary_completion_rate", "lower_secondary_completion"])
    result = dataframe_to_records(df[["country", "year", "primary_completion_rate", "lower_secondary_completion"]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/gender-gap")
def get_gender_gap(countries: Optional[str] = Query("all"), year: Optional[int] = Query(2023)):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    df = df[df["year"] == year]
    df = df.dropna(subset=["literacy_rate_youth_male", "literacy_rate_youth_female"])
    df["gap"] = df["literacy_rate_youth_male"] - df["literacy_rate_youth_female"]
    result = dataframe_to_records(df[["country", "literacy_rate_youth_male", "literacy_rate_youth_female", "gap"]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/out-of-school")
def get_out_of_school(countries: Optional[str] = Query("all"), year: Optional[int] = Query(2023)):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    df = df[df["year"] == year]
    df = df.dropna(subset=["out_of_school_primary", "out_of_school_female"])
    result = dataframe_to_records(df[["country", "out_of_school_primary", "out_of_school_female"]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/expenditure")
def get_expenditure(countries: Optional[str] = Query("all")):
    df = get_cached_data()
    if countries != "all":
        iso_codes = [c.strip() for c in countries.split(",")]
        country_names = [name for name, info in COUNTRY_INFO.items() if info["iso3"] in iso_codes]
        df = df[df["country"].isin(country_names)]
    
    df = df.dropna(subset=["govt_education_expenditure"])
    result = dataframe_to_records(df[["country", "year", "govt_education_expenditure"]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/ranking")
def get_ranking(metric: str = Query("primary_enrollment_rate"), year: int = Query(2023)):
    df = get_cached_data()
    df = df[df["year"] == year]
    df = df.dropna(subset=[metric])
    df = df.sort_values(by=metric, ascending=False)
    result = dataframe_to_records(df[["country", metric]])
    
    # Add iso3, lat, lng to each record
    for record in result:
        info = COUNTRY_INFO.get(record["country"], {})
        record["iso3"] = info.get("iso3")
        record["lat"] = info.get("lat")
        record["lng"] = info.get("lng")
    
    return result

@router.get("/correlation")
def get_correlation():
    df = get_cached_data()
    cols = ["primary_enrollment_rate", "literacy_rate_adult", "govt_education_expenditure", "primary_completion_rate", "pupil_teacher_ratio_primary"]
    corr = df[cols].corr()
    return dataframe_to_records(corr.reset_index())

