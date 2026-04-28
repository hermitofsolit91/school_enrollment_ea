import axios from "axios";
import type {
  DataPoint,
  MapDataPoint,
  ClusterData,
  CountryTrends,
  RegressionResult,
  GenderGapResult,
  ForecastData,
  HealthStatus,
} from "../types";

const API_BASE = "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const apiClient = {
  // Health check
  getHealth: async (): Promise<HealthStatus> => {
    try {
      const response = await client.get<HealthStatus>("/health");
      return response.data;
    } catch {
      return { status: "unhealthy" };
    }
  },

  // Data endpoints
  getData: async (params: {
    indicator: string;
  }): Promise<DataPoint[]> => {
    const response = await client.get<DataPoint[]>("/data", { params });
    return response.data;
  },

  getMapData: async (params: {
    indicator: string;
    year: number;
  }): Promise<MapDataPoint[]> => {
    const response = await client.get<MapDataPoint[]>("/map-data", { params });
    return response.data;
  },

  getClusteringData: async (): Promise<ClusterData[]> => {
    const response = await client.get<ClusterData[]>("/models/clustering");
    return response.data;
  },

  getCountryTrends: async (iso3: string): Promise<CountryTrends> => {
    const response = await client.get<CountryTrends>(`/trends/${iso3}`);
    return response.data;
  },

  getRegressionResults: async (): Promise<RegressionResult> => {
    const response = await client.get<RegressionResult>("/models/regression");
    return response.data;
  },

  getGenderGapData: async (): Promise<GenderGapResult> => {
    const response = await client.get<GenderGapResult>("/models/gender-gap");
    return response.data;
  },

  getForecastData: async (): Promise<ForecastData[]> => {
    const response = await client.get<ForecastData[]>("/models/forecast");
    return response.data;
  },
};
