import axios from "axios";
import type {
  DataPoint,
  MapDataPoint,
  ClusterData,
  CountryTrends,
  RegressionResult,
  HealthStatus,
  ForecastData,
} from "../types";

const API_BASE = import.meta.env.PROD 
  ? "/api" 
  : "http://localhost:8000/api";

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

  getGenderGapData: async (countries?: string): Promise<any[]> => {
    const response = await client.get<any[]>("/gender-gap", {
      params: countries ? { countries } : {},
    });
    return response.data;
  },

  getForecastData: async (): Promise<ForecastData[]> => {
    const response = await client.get<ForecastData[]>("/models/forecast");
    return response.data;
  },

  // New endpoints for dashboard filters
  getTrendData: async (countries?: string, indicator?: string): Promise<any[]> => {
    const response = await client.get<any[]>("/trend", {
      params: {
        ...(countries ? { countries } : {}),
        ...(indicator ? { indicator } : {}),
      },
    });
    return response.data;
  },

  getEnrollmentData: async (countries?: string, year?: number): Promise<any[]> => {
    const response = await client.get<any[]>("/enrollment", {
      params: {
        ...(countries ? { countries } : {}),
        ...(year ? { year } : {}),
      },
    });
    return response.data;
  },

  getLiteracyData: async (countries?: string, year?: number): Promise<any[]> => {
    const response = await client.get<any[]>("/literacy", {
      params: {
        ...(countries ? { countries } : {}),
        ...(year ? { year } : {}),
      },
    });
    return response.data;
  },

  getOutOfSchoolData: async (countries?: string, year?: number): Promise<any[]> => {
    const response = await client.get<any[]>("/out-of-school", {
      params: {
        ...(countries ? { countries } : {}),
        ...(year ? { year } : {}),
      },
    });
    return response.data;
  },

  getCompletionData: async (countries?: string, year?: number): Promise<any[]> => {
    const response = await client.get<any[]>("/completion", {
      params: {
        ...(countries ? { countries } : {}),
        ...(year ? { year } : {}),
      },
    });
    return response.data;
  },

  getExpenditureData: async (countries?: string, year?: number): Promise<any[]> => {
    const response = await client.get<any[]>("/expenditure", {
      params: {
        ...(countries ? { countries } : {}),
        ...(year ? { year } : {}),
      },
    });
    return response.data;
  },
};
