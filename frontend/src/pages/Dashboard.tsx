import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChoroplethMap } from "../components/dashboard/ChoroplethMap";
import { FilterPanel } from "../components/dashboard/FilterPanel";
import { EnrollmentTrends } from "../components/dashboard/EnrollmentTrends";
import LiteracySection from "../components/LiteracySection";
import CompletionSection from "../components/CompletionSection";
import GenderGapSection from "../components/GenderGapSection";
import ExpenditureSection from "../components/ExpenditureSection";
import RankingsSection from "../components/RankingsSection";
import type { CountryName } from "../constants/countries";
import { COUNTRY_NAMES } from "../constants/countries";
import "../styles/dashboard.css";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.toString() };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">
              Dashboard Error
            </h1>
            <p className="text-red-600 mb-4">
              An error occurred while rendering the dashboard:
            </p>
            <pre className="bg-white p-4 rounded border border-red-200 text-sm overflow-auto text-red-800">
              {this.state.error}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Dashboard: React.FC = () => {
  // Filter State
  const [selectedCountries, setSelectedCountries] = useState<CountryName[]>(
    [...COUNTRY_NAMES]
  );
  const [selectedAge, setSelectedAge] = useState<string>("all");
  const [selectedYears, setSelectedYears] = useState<number[]>(
    Array.from({ length: 14 }, (_, i) => 2010 + i)
  );
  const [analysisType, setAnalysisType] = useState<string>("enrollment");

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        <Navbar />

        <div className="dashboard-content">
          {/* Left Panel - Filters */}
          <FilterPanel
            selectedCountries={selectedCountries}
            selectedAge={selectedAge}
            selectedYears={selectedYears}
            onCountriesChange={setSelectedCountries}
            onAgeChange={setSelectedAge}
            onYearsChange={setSelectedYears}
            onAnalysisChange={setAnalysisType}
          />

          <main className="dashboard-main">
            <section className="w-full mb-12">
              <ChoroplethMap 
                indicator={analysisType}
                selectedCountries={selectedCountries}
                selectedYears={selectedYears}
              />
            </section>

            {/* Graphs and Charts - Below Map */}
            <div className="dashboard-charts space-y-12 mt-12 pb-20">
              <EnrollmentTrends 
                selectedCountries={selectedCountries} 
                selectedYears={selectedYears} 
              />
              <LiteracySection 
                selectedCountries={selectedCountries} 
                selectedYears={selectedYears} 
              />
              <CompletionSection 
                selectedCountries={selectedCountries} 
                selectedYears={selectedYears} 
              />
              <GenderGapSection 
                selectedCountries={selectedCountries} 
                selectedYears={selectedYears} 
              />
              <ExpenditureSection 
                selectedCountries={selectedCountries} 
                selectedYears={selectedYears} 
              />
              <RankingsSection 
                selectedCountries={selectedCountries} 
                selectedYears={selectedYears} 
              />
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
