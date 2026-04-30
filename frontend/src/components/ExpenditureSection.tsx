import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { ENDPOINTS } from "../constants/api";
import { countriesToParam, type CountryName, NAME_TO_ISO, ISO_TO_NAME } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { countryColor } from "./sectionHelpers";
import "../styles/dashboard.css";

interface ExpenditureSectionProps {
  selectedCountries: CountryName[];
  selectedYears: number[];
}

export default function ExpenditureSection({ selectedCountries, selectedYears }: ExpenditureSectionProps) {
  const countriesParam = countriesToParam(selectedCountries);
  const expenditureApi = useApi<any[]>(ENDPOINTS.trend(countriesParam, "govt_education_expenditure"));

  const transformedData = useMemo(() => {
    if (!expenditureApi.data || !Array.isArray(expenditureApi.data)) return [];
    const yearMap: Record<number, any> = {};
    expenditureApi.data.forEach(item => {
      const yr = Number(item.year);
      if (!yearMap[yr]) yearMap[yr] = { year: yr };
      const iso = NAME_TO_ISO[item.country as CountryName] || item.iso3 || item.country;
      yearMap[yr][iso] = item.value;
    });
    return Object.values(yearMap)
      .filter(d => selectedYears.includes(d.year))
      .sort((a, b) => a.year - b.year);
  }, [expenditureApi.data, selectedYears]);

  const selectedIsos = selectedCountries.map(c => NAME_TO_ISO[c]);

  return (
    <div className="section">
      <div className="section-title-wrap">
        <h2>Government Education Expenditure</h2>
      </div>

      <div className="chart-main-area">
        <div className="chart-container">
          <h3 className="mb-6 uppercase font-black text-primary tracking-tighter">Expenditure as % of GDP</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b' }} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              {selectedIsos.map((iso3) => (
                <Line
                  key={iso3}
                  dataKey={iso3}
                  name={iso3}
                  stroke={countryColor(ISO_TO_NAME[iso3] || iso3)}
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-explanation-sidebar">
        <div className="explanation-block">
          <div className="explanation-title">Fiscal Investment</div>
          <p className="explanation-text">
            Investment in education as a percentage of GDP highlights the relative priority of education in national budgets.
          </p>
        </div>

        <div className="explanation-block">
          <div className="explanation-title">Analysis Range</div>
          <p className="explanation-text">
            The chart covers {selectedYears.length} years of data for the selected countries.
          </p>
        </div>
      </div>
    </div>
  );
}
