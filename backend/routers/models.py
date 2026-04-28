"""Machine learning model endpoints"""
from typing import List, Dict
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from utils.data_loader import (
    get_cached_data,
    COUNTRY_INFO,
    NUMERIC_COLUMNS,
    dataframe_to_records,
    replace_nan_with_null,
)

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/clustering")
def clustering_analysis() -> List[dict]:
    """
    K-Means clustering (k=3) on countries using avg enrollment and literacy rates
    
    Uses: primary_enrollment_rate, secondary_enrollment_rate, literacy_rate_adult, govt_education_expenditure
    
    Returns cluster assignments with feature values and cluster labels:
    "High Performer", "Mid Tier", "Needs Attention"
    """
    df = get_cached_data()
    
    # Features for clustering
    features = [
        "primary_enrollment_rate",
        "secondary_enrollment_rate",
        "literacy_rate_adult",
        "govt_education_expenditure",
    ]
    
    # Aggregate by country (average across years)
    country_avgs = df.groupby("country")[features].mean()
    country_avgs = country_avgs.dropna()
    
    if len(country_avgs) < 3:
        raise HTTPException(
            status_code=400,
            detail="Not enough countries with complete feature data for clustering"
        )
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(country_avgs)
    
    # K-Means clustering
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    # Sort clusters by average primary enrollment to create meaningful labels
    cluster_means = {}
    for cluster_id in range(3):
        cluster_mask = clusters == cluster_id
        if cluster_mask.any():
            cluster_means[cluster_id] = country_avgs[cluster_mask]["primary_enrollment_rate"].mean()
    
    # Assign labels based on performance
    sorted_clusters = sorted(cluster_means.items(), key=lambda x: x[1], reverse=True)
    cluster_labels = {
        sorted_clusters[0][0]: "High Performer",
        sorted_clusters[1][0]: "Mid Tier",
        sorted_clusters[2][0]: "Needs Attention",
    }
    
    # Build response
    result = {
        "model": "K-Means",
        "k": 3,
        "features": features,
        "clusters": []
    }
    
    for country_name, idx in zip(country_avgs.index, range(len(clusters))):
        cluster_id = clusters[idx]
        info = COUNTRY_INFO[country_name]
        result["clusters"].append({
            "country": country_name,
            "iso3": info["iso3"],
            "lat": info.get("lat"),
            "lng": info.get("lng"),
            "cluster_id": int(cluster_id),
            "cluster_label": cluster_labels[cluster_id],
            "feature_values": {
                feat: float(country_avgs.loc[country_name, feat]) 
                for feat in features
            }
        })
    
    return result["clusters"]


@router.get("/regression")
def regression_analysis() -> dict:
    """
    Linear regression: predict primary_completion_rate from govt_education_expenditure,
    pupil_teacher_ratio_primary, and primary_enrollment_rate
    
    Returns: R² score, coefficients with feature names, and predictions vs actuals
    """
    df = get_cached_data()
    
    features = [
        "govt_education_expenditure",
        "pupil_teacher_ratio_primary",
        "primary_enrollment_rate",
    ]
    target = "primary_completion_rate"
    
    # Drop rows with NaN in any required column
    df_clean = df[features + [target]].dropna()
    
    if len(df_clean) < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough complete data points for regression (found {len(df_clean)}, need at least 10)"
        )
    
    X = df_clean[features].values
    y = df_clean[target].values
    
    # Fit linear regression
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate R² score
    r2_score = model.score(X, y)
    
    # Make predictions
    y_pred = model.predict(X)
    
    # Build response with coefficients
    result = {
        "model": "Linear Regression",
        "target": target,
        "features": features,
        "r2_score": float(r2_score),
        "coefficients": {feat: float(coef) for feat, coef in zip(features, model.coef_)},
        "intercept": float(model.intercept_),
        "predictions": []
    }
    
    # Add country-year predictions with actuals
    df_clean_reset = df_clean.reset_index(drop=True)
    for idx in range(len(df_clean_reset)):
        row = df_clean_reset.iloc[idx]
        pred_idx = idx
        result["predictions"].append({
            "country": row.get("country", "Unknown"),
            "year": int(row.get("year", 0)) if "year" in row else 0,
            "actual": float(y[pred_idx]),
            "predicted": float(y_pred[pred_idx]),
            "residual": float(y[pred_idx] - y_pred[pred_idx]),
        })
    
    return result


@router.get("/gender-gap")
def gender_gap_analysis() -> dict:
    """
    Year-by-year comparison of literacy_rate_youth_male vs literacy_rate_youth_female per country
    
    Returns gap value (male minus female) and flags countries where gap is narrowing vs widening
    """
    df = get_cached_data()
    
    result = {
        "indicator": "Youth Literacy Gender Gap",
        "metric": "Male - Female",
        "countries": []
    }
    
    for country in sorted(df["country"].unique()):
        country_data = df[df["country"] == country].sort_values("year").copy()
        
        # Calculate gender gap
        country_data["gap"] = (
            country_data["literacy_rate_youth_male"] - country_data["literacy_rate_youth_female"]
        )
        
        # Drop rows with NaN gaps
        country_data = country_data.dropna(subset=["gap"])
        
        if len(country_data) < 2:
            continue
        
        # Determine trend (narrowing vs widening)
        gap_values = country_data["gap"].values
        if gap_values[-1] < gap_values[0]:
            trend = "narrowing"
        elif gap_values[-1] > gap_values[0]:
            trend = "widening"
        else:
            trend = "stable"
        
        # Build year-by-year data
        year_data = []
        for _, row in country_data.iterrows():
            year_data.append({
                "year": int(row["year"]),
                "male_literacy": float(row["literacy_rate_youth_male"]) if pd.notna(row["literacy_rate_youth_male"]) else None,
                "female_literacy": float(row["literacy_rate_youth_female"]) if pd.notna(row["literacy_rate_youth_female"]) else None,
                "gap": float(row["gap"]) if pd.notna(row["gap"]) else None,
            })
        
        info = COUNTRY_INFO[country]
        result["countries"].append({
            "country": country,
            "iso3": info["iso3"],
            "lat": info["lat"],
            "lng": info["lng"],
            "trend": trend,
            "gap_start": float(gap_values[0]),
            "gap_end": float(gap_values[-1]),
            "year_data": year_data,
        })
    
    return result


@router.get("/forecast")
def forecast_primary_enrollment() -> List[dict]:
    """
    Linear regression on primary_enrollment_rate over 2010–2023 to project 2024, 2025, 2026, 2027, 2030
    
    Returns historical + projected points per country
    """
    df = get_cached_data()
    
    result = {
        "model": "Linear Trend Regression",
        "indicator": "primary_enrollment_rate",
        "historical_years": "2010-2023",
        "forecast_years": [2024, 2025, 2026, 2027, 2030],
        "countries": []
    }
    
    for country in sorted(df["country"].unique()):
        country_data = df[df["country"] == country].sort_values("year").copy()
        country_data = country_data[["year", "primary_enrollment_rate"]].dropna()
        
        if len(country_data) < 2:
            continue
        
        X = country_data["year"].values.reshape(-1, 1)
        y = country_data["primary_enrollment_rate"].values
        
        # Fit linear regression
        model = LinearRegression()
        model.fit(X, y)
        
        # Historical data points
        historical = []
        for _, row in country_data.iterrows():
            historical.append({
                "year": int(row["year"]),
                "value": float(row["primary_enrollment_rate"]),
                "type": "historical"
            })
        
        # Forecast future years
        future_years = np.array([2024, 2025, 2026, 2027, 2030]).reshape(-1, 1)
        future_predictions = model.predict(future_years)
        
        forecast = []
        for year, pred in zip(future_years.flatten(), future_predictions):
            forecast.append({
                "year": int(year),
                "value": float(pred),
                "type": "forecast"
            })
        
        # Combine historical + forecast
        all_points = historical + forecast
        
        info = COUNTRY_INFO[country]
        result["countries"].append({
            "country": country,
            "iso3": info["iso3"],
            "lat": info.get("lat"),
            "lng": info.get("lng"),
            "slope": float(model.coef_[0]),
            "intercept": float(model.intercept_),
            "points": all_points,
        })
    
    return result["countries"]
