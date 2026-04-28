// Types for the dashboard

export interface CountryData {
  iso3: string;
  country_name: string;
  latitude: number;
  longitude: number;
  flag_emoji: string;
}

export interface DataPoint {
  year: number;
  country: string;
  iso3: string;
  indicator: string;
  value: number;
}

export interface MapDataPoint {
  iso3: string;
  country_name: string;
  latitude: number;
  longitude: number;
  flag_emoji: string;
  value: number;
  indicator: string;
  year: number;
}

export interface ClusterData {
  iso3: string;
  country_name: string;
  latitude: number;
  longitude: number;
  flag_emoji: string;
  cluster: "High Performer" | "Mid Tier" | "Needs Attention";
}

export interface CountryTrends {
  iso3: string;
  country_name: string;
  flag_emoji: string;
  cluster: "High Performer" | "Mid Tier" | "Needs Attention";
  literacy_rate_latest: number;
  completion_rate_latest: number;
  govt_expenditure_latest: number;
  enrollment_history: Array<{ year: number; value: number }>;
}

export interface RegressionResult {
  r_squared: number;
  coefficients: Record<string, number>;
  predictions: Array<{ actual: number; predicted: number }>;
}

export interface GenderGapResult {
  countries: Array<{
    iso3: string;
    country_name: string;
    flag_emoji: string;
    male_literacy: number;
    female_literacy: number;
    gap: number;
    gap_direction: "narrowing" | "widening";
  }>;
}

export interface ForecastData {
  iso3: string;
  country_name: string;
  flag_emoji: string;
  historical: Array<{ year: number; value: number }>;
  forecast: Array<{ year: number; value: number }>;
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  message?: string;
}

export type Indicator = 
  | "primary_enrollment_rate"
  | "secondary_enrollment_rate"
  | "literacy_rate"
  | "completion_rate"
  | "govt_expenditure";

export const INDICATOR_LABELS: Record<Indicator, string> = {
  primary_enrollment_rate: "Primary Enrollment Rate",
  secondary_enrollment_rate: "Secondary Enrollment Rate",
  literacy_rate: "Literacy Rate",
  completion_rate: "Completion Rate",
  govt_expenditure: "Government Expenditure",
};
