import { BrowserRouter, Routes, Route } from "react-router-dom";
import AboutSection from "./components/AboutSection";
import CompletionSection from "./components/CompletionSection";
import CorrelationMatrix from "./components/CorrelationMatrix";
import DataTable from "./components/DataTable";
import EnrollmentSection from "./components/EnrollmentSection";
import ExpenditureSection from "./components/ExpenditureSection";
import Footer from "./components/Footer";
import GenderGapSection from "./components/GenderGapSection";
import HeroSection from "./components/HeroSection";
import KPICards from "./components/KPICards";
import LiteracySection from "./components/LiteracySection";
import Navbar from "./components/Navbar";
import OutOfSchoolSection from "./components/OutOfSchoolSection";
import RankingsSection from "./components/RankingsSection";
import Dashboard from "./pages/Dashboard";

function HomePage() {
  return (
    <div className="app">
      <Navbar />
      <HeroSection />
      <main className="main-content">
        <div className="container-max">
          <KPICards />
          <EnrollmentSection />
          <LiteracySection />
          <GenderGapSection />
          <OutOfSchoolSection />
          <CompletionSection />
          <ExpenditureSection />
          <RankingsSection />
          <CorrelationMatrix />
          <DataTable />
          <AboutSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
