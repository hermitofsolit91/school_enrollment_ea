import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EnrollmentTrends } from "../components/dashboard/EnrollmentTrends";
import LiteracySection from "../components/LiteracySection";
import CompletionSection from "../components/CompletionSection";
import GenderGapSection from "../components/GenderGapSection";
import ExpenditureSection from "../components/ExpenditureSection";
import RankingsSection from "../components/RankingsSection";
import { DEFAULT_COUNTRY_SELECTION, type CountryName } from "../constants/countries";

const Charts: React.FC = () => {
  const [selectedCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [selectedYears] = useState<number[]>(Array.from({ length: 14 }, (_, i) => 2010 + i));

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="container-max py-16">
        <header className="mb-16 border-b-2 border-accent pb-6">
          <h1 className="text-5xl font-extrabold text-primary mb-2 tracking-tight font-display">
            Analytical Intelligence
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-3xl">
            Explore deep educational metrics and regional performance across East Africa with our advanced visualization engine.
          </p>
        </header>

        <div className="dashboard-charts space-y-24">
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
      </div>
      <Footer />
    </div>
  );
};

export default Charts;
