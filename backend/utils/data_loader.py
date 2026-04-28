"""Data loading and processing utilities"""
import os
import pandas as pd
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

DATA_PATH = os.getenv("DATA_PATH", "./data/education_ea_clean.csv")

# 7 East African countries from World Bank data
FOCUS_COUNTRIES = {
    "Uganda",
    "Kenya",
    "Tanzania",
    "Rwanda",
    "Burundi",
    "Ethiopia",
    "South Sudan",
}

# Country ISO3 codes, flag emojis, and geographic coordinates (centroid)
COUNTRY_INFO = {
    "Uganda": {"iso3": "UGA", "flag": "🇺🇬", "lat": 1.3733, "lng": 32.2903},
    "Kenya": {"iso3": "KEN", "flag": "🇰🇪", "lat": -0.0236, "lng": 37.9062},
    "Tanzania": {"iso3": "TZA", "flag": "🇹🇿", "lat": -6.3690, "lng": 34.8888},
    "Rwanda": {"iso3": "RWA", "flag": "🇷🇼", "lat": -1.9429, "lng": 29.8739},
    "Burundi": {"iso3": "BDI", "flag": "🇧🇮", "lat": -3.3731, "lng": 29.9189},
    "Ethiopia": {"iso3": "ETH", "flag": "🇪🇹", "lat": 9.1450, "lng": 40.4897},
    "South Sudan": {"iso3": "SSD", "flag": "🇸🇸", "lat": 6.8770, "lng": 31.3070},
}

NUMERIC_COLUMNS = [
    "primary_enrollment_rate",
    "secondary_enrollment_rate",
    "tertiary_enrollment_rate",
    "literacy_rate_adult",
    "literacy_rate_youth_male",
    "literacy_rate_youth_female",
    "out_of_school_primary",
    "out_of_school_female",
    "pupil_teacher_ratio_primary",
    "govt_education_expenditure",
    "primary_completion_rate",
    "lower_secondary_completion",
]

_df_cache = None


def load_data() -> pd.DataFrame:
    """Load and clean CSV data with forward fill for missing values"""
    global _df_cache
    
    df = pd.read_csv(DATA_PATH)
    
    # Filter to 7 focus countries
    df = df[df["country"].isin(FOCUS_COUNTRIES)].copy()
    df = df.sort_values(["country", "year"])
    
    # Forward fill missing values per country, then drop remaining
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = df.groupby("country")[col].transform(
                lambda x: x.ffill().bfill()
            )
    
    # Compute derived indicators
    df["gender_literacy_gap"] = (
        df["literacy_rate_youth_male"] - df["literacy_rate_youth_female"]
    )
    df["enrollment_drop_off"] = (
        df["primary_enrollment_rate"] - df["secondary_enrollment_rate"]
    )
    df["female_oos_pct"] = (
        (df["out_of_school_female"] / df["out_of_school_primary"]) * 100
    )
    
    _df_cache = df
    return df


def get_cached_data() -> pd.DataFrame:
    """Get cached DataFrame or load if not cached"""
    global _df_cache
    if _df_cache is None:
        return load_data()
    return _df_cache


def replace_nan_with_null(obj):
    """Recursively replace NaN and inf with None for JSON serialization"""
    import math
    import numpy as np
    
    if isinstance(obj, dict):
        return {k: replace_nan_with_null(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [replace_nan_with_null(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, (np.floating, np.integer)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj) if isinstance(obj, np.floating) else int(obj)
    return obj


def dataframe_to_records(df: pd.DataFrame, replace_nan=True) -> list:
    """Convert DataFrame to list of dicts, optionally replacing NaN with None"""
    records = df.where(pd.notnull(df), None).to_dict(orient="records")
    if replace_nan:
        records = replace_nan_with_null(records)
    return records
