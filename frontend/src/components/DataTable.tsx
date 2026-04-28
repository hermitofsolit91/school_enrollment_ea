import { useMemo, useState } from "react";
import { ENDPOINTS } from "../constants/api";
import { DEFAULT_COUNTRY_SELECTION, countriesToParam, type CountryName } from "../constants/countries";
import { useApi } from "../hooks/useApi";
import { valueBand } from "../utils/colorScale";
import { fmt, pct } from "../utils/formatNumber";
import ErrorCard from "./ui/ErrorCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import CountrySelector from "./ui/CountrySelector";
import YearSelector from "./ui/YearSelector";
import { asRows, field, yearInRange } from "./sectionHelpers";

type SortKey = "country" | "year" | "primary" | "secondary" | "tertiary" | "literacy" | "gap" | "oos" | "completion" | "expenditure";

export default function DataTable() {
  const [countries, setCountries] = useState<CountryName[]>(DEFAULT_COUNTRY_SELECTION);
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2023);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("country");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const countriesParam = countriesToParam(countries);
  const trendApi = useApi<unknown>(ENDPOINTS.trend(countriesParam));

  const rows = useMemo(() => asRows<Record<string, unknown>>(trendApi.data), [trendApi.data]);
  const normalized = useMemo(
    () =>
      rows
        .map((r) => ({
          country: String(r.country ?? "N/A"),
          year: Number(r.year ?? 0),
          primary: field(r, ["primary_enrollment_rate", "primary_enrollment"]),
          secondary: field(r, ["secondary_enrollment_rate", "secondary_enrollment"]),
          tertiary: field(r, ["tertiary_enrollment_rate", "tertiary_enrollment"]),
          literacy: field(r, ["adult_literacy_rate", "literacy_rate_adult"]),
          gap: field(r, ["gender_literacy_gap", "gender_gap"]),
          oos: field(r, ["out_of_school_primary", "out_of_school"]),
          completion: field(r, ["primary_completion_rate", "completion_rate"]),
          expenditure: field(r, ["govt_education_expenditure", "expenditure"]),
        }))
        .filter((row) => yearInRange(row.year, startYear, endYear))
        .filter((row) => row.country.toLowerCase().includes(search.toLowerCase())),
    [rows, startYear, endYear, search],
  );

  const sorted = useMemo(() => {
    const copy = [...normalized];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return copy;
  }, [normalized, sortAsc, sortKey]);

  const rowsPerPage = 20;
  const pageCount = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const pageRows = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const exportCsv = () => {
    const headers = [
      "Country",
      "Year",
      "Primary Enroll%",
      "Secondary Enroll%",
      "Tertiary Enroll%",
      "Adult Literacy%",
      "Gender Gap",
      "OOS Children",
      "Completion%",
      "Expenditure% GDP",
    ];

    const body = sorted.map((r) => [
      r.country,
      r.year,
      r.primary,
      r.secondary,
      r.tertiary,
      r.literacy,
      r.gap,
      r.oos,
      r.completion,
      r.expenditure,
    ]);

    const csv = [headers, ...body].map((line) => line.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edudata_ea_filtered.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="data-table" className="section reveal">
      <div className="section-head">
        <h2>Full Dataset</h2>
        <div className="controls-row">
          <CountrySelector selected={countries} onChange={setCountries} />
          <YearSelector
            mode="range"
            startYear={startYear}
            endYear={endYear}
            onRangeChange={(s, e) => {
              setStartYear(s);
              setEndYear(e);
            }}
          />
          <input
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search country"
          />
          <button type="button" className="btn btn-secondary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {trendApi.loading && <LoadingSkeleton lines={10} height={16} />}
      {trendApi.error && <ErrorCard message={trendApi.error} />}

      {!trendApi.loading && !trendApi.error && (
        <article className="glass-card table-card">
          {pageRows.length === 0 ? (
            <p className="empty-msg">No data for current filters.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => onSort("country")}>Country</th>
                    <th onClick={() => onSort("year")}>Year</th>
                    <th onClick={() => onSort("primary")}>Primary</th>
                    <th onClick={() => onSort("secondary")}>Secondary</th>
                    <th onClick={() => onSort("tertiary")}>Tertiary</th>
                    <th onClick={() => onSort("literacy")}>Literacy</th>
                    <th onClick={() => onSort("gap")}>Gap</th>
                    <th onClick={() => onSort("oos")}>OOS</th>
                    <th onClick={() => onSort("completion")}>Completion</th>
                    <th onClick={() => onSort("expenditure")}>Expenditure</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, idx) => (
                    <tr key={`${r.country}-${r.year}-${idx}`}>
                      <td>{r.country}</td>
                      <td>{r.year}</td>
                      <td className={`value-${valueBand(r.primary)}`}>{pct(r.primary)}</td>
                      <td className={`value-${valueBand(r.secondary)}`}>{pct(r.secondary)}</td>
                      <td className={`value-${valueBand(r.tertiary)}`}>{pct(r.tertiary)}</td>
                      <td className={`value-${valueBand(r.literacy)}`}>{pct(r.literacy)}</td>
                      <td>{fmt(r.gap, 1)}</td>
                      <td>{fmt(r.oos, 1)}</td>
                      <td className={`value-${valueBand(r.completion)}`}>{pct(r.completion)}</td>
                      <td>{fmt(r.expenditure, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pagination">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
              Next
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
