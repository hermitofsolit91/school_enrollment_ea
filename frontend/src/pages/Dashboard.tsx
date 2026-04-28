import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { StatsBar } from "../components/dashboard/StatsBar";
import { EnrollmentTrends } from "../components/dashboard/EnrollmentTrends";
import { ChoroplethMap } from "../components/dashboard/ChoroplethMap";
import { ModelResults } from "../components/dashboard/ModelResults";
import { CountryProfiles } from "../components/dashboard/CountryProfiles";

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
            <h1 className="text-2xl font-bold text-red-700 mb-4">Dashboard Error</h1>
            <p className="text-red-600 mb-4">An error occurred while rendering the dashboard:</p>
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
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Stats Bar */}
        <StatsBar />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Enrollment Trends */}
          <section>
            <EnrollmentTrends />
          </section>

          {/* Choropleth Map */}
          <section>
            <ChoroplethMap />
          </section>

          {/* Model Results */}
          <section>
            <ModelResults />
          </section>

          {/* Country Profiles */}
          <section>
            <CountryProfiles />
          </section>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
