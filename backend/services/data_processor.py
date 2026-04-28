import os
import pandas as pd
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

DATA_PATH = os.getenv("DATA_PATH", "./data/education_ea_clean.csv")

FOCUS_COUNTRIES = {
    "Uganda",
    "Kenya",
    "Tanzania",
    "Rwanda",
    "Burundi",
    "Ethiopia",
    "South Sudan",
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

_df = None
_last_loaded = None


def load_data():
    global _df, _last_loaded
    df = pd.read_csv(DATA_PATH)
    df = df[df["country"].isin(FOCUS_COUNTRIES)].copy()
    df = df.sort_values(["country", "year"])

    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = df.groupby("country")[col].transform(
                lambda x: x.interpolate(method="linear", limit_direction="both")
            )

    df["gender_literacy_gap"] = df["literacy_rate_youth_male"] - df["literacy_rate_youth_female"]
    df["enrollment_drop_off"] = df["primary_enrollment_rate"] - df["secondary_enrollment_rate"]
    df["female_oos_pct"] = (df["out_of_school_female"] / df["out_of_school_primary"]) * 100

    _df = df
    _last_loaded = pd.Timestamp.now()
    return _df


def get_df():
    global _df
    if _df is None:
        return load_data()
    return _df


def set_df(df):
    global _df
    _df = df


def get_last_loaded():
    global _last_loaded
    return _last_loaded


def get_focus_countries():
    return sorted(FOCUS_COUNTRIES)


load_data()


# --- ADDED PROCESSOR FUNCTION ---
def processor():
    """
    Retrieves the dataframe and formats it as a list of dictionaries 
    so FastAPI can easily convert it to JSON for your frontend.
    """
    df = get_df()
    
    # We replace any NaN (Not a Number) values with None because 
    # standard JSON does not support NaN values.
    clean_df = df.where(pd.notnull(df), None)
    
    return clean_df.to_dict(orient="records")