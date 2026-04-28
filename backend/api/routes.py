from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
# Import the processor function directly
from services.data_processor import processor, get_df 
from .dependencies import get_api_key

# 1. FIX: Initialize the router
router = APIRouter()

# ── TREND ──────────────────────────────────────────────────
@router.get("/trend")
def get_trend(
    countries: Optional[str] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    # 2. FIX: We use get_df() directly here to get the DataFrame
    df = get_df() 
    if df is None or df.empty:
        raise HTTPException(status_code=500, detail="No data loaded")
    
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        missing = [c for c in selected if c not in df["country"].unique()]
        if missing:
            raise HTTPException(status_code=404, detail=f"Countries not found: {missing}")
        filtered = df[df["country"].isin(selected)]
    
    return filtered.fillna(0).to_dict(orient="records")


# ── ENROLLMENT ─────────────────────────────────────────────
@router.get("/enrollment")
def get_enrollment(
    countries: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    df = get_df()
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        filtered = df[df["country"].isin(selected)]
    
    if year:
        filtered = filtered[filtered["year"] == year]
    
    cols = ["country", "year", "primary_enrollment_rate",
            "secondary_enrollment_rate", "tertiary_enrollment_rate",
            "enrollment_drop_off"]
    cols = [c for c in cols if c in filtered.columns]
    return filtered[cols].fillna(0).to_dict(orient="records")


# ── LITERACY ───────────────────────────────────────────────
@router.get("/literacy")
def get_literacy(
    countries: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    df = get_df()
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        filtered = df[df["country"].isin(selected)]
    
    if year:
        filtered = filtered[filtered["year"] == year]
    
    cols = ["country", "year", "literacy_rate_adult",
            "literacy_rate_youth_male", "literacy_rate_youth_female",
            "gender_literacy_gap"]
    cols = [c for c in cols if c in filtered.columns]
    return filtered[cols].fillna(0).to_dict(orient="records")


# ── GENDER GAP ─────────────────────────────────────────────
@router.get("/gender-gap")
def get_gender_gap(
    countries: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    df = get_df()
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        filtered = df[df["country"].isin(selected)]
    
    if year:
        filtered = filtered[filtered["year"] == year]
    
    cols = ["country", "year", "literacy_rate_youth_male",
            "literacy_rate_youth_female", "gender_literacy_gap"]
    cols = [c for c in cols if c in filtered.columns]
    return filtered[cols].fillna(0).sort_values(
        "gender_literacy_gap", ascending=False
    ).to_dict(orient="records")


# ── OUT OF SCHOOL ──────────────────────────────────────────
@router.get("/out-of-school")
def get_out_of_school(
    countries: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    df = get_df()
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        filtered = df[df["country"].isin(selected)]
    
    if year:
        filtered = filtered[filtered["year"] == year]
    
    cols = ["country", "year", "out_of_school_primary",
            "out_of_school_female", "female_oos_pct"]
    cols = [c for c in cols if c in filtered.columns]
    return filtered[cols].fillna(0).sort_values(
        "out_of_school_primary", ascending=False
    ).to_dict(orient="records")


# ── COMPLETION ─────────────────────────────────────────────
@router.get("/completion")
def get_completion(
    countries: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    df = get_df()
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        filtered = df[df["country"].isin(selected)]
    
    if year:
        filtered = filtered[filtered["year"] == year]
    
    cols = ["country", "year", "primary_completion_rate",
            "lower_secondary_completion"]
    cols = [c for c in cols if c in filtered.columns]
    return filtered[cols].fillna(0).to_dict(orient="records")


# ── EXPENDITURE ────────────────────────────────────────────
@router.get("/expenditure")
def get_expenditure(
    countries: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    dependencies=[Depends(get_api_key)]
):
    df = get_df()
    if not countries or countries.strip().lower() == "all":
        filtered = df
    else:
        selected = [c.strip() for c in countries.split(",")]
        filtered = df[df["country"].isin(selected)]
    
    if year:
        filtered = filtered[filtered["year"] == year]
    
    cols = ["country", "year", "govt_education_expenditure"]
    cols = [c for c in cols if c in filtered.columns]
    return filtered[cols].fillna(0).to_dict(orient="records")