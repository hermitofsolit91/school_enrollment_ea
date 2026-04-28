export const YEARS = Array.from({ length: 14 }, (_, i) => 2010 + i);

type SingleYearProps = {
  mode: "single";
  year: number;
  onYearChange: (year: number) => void;
};

type RangeYearProps = {
  mode: "range";
  startYear: number;
  endYear: number;
  onRangeChange: (startYear: number, endYear: number) => void;
};

type YearSelectorProps = SingleYearProps | RangeYearProps;

export default function YearSelector(props: YearSelectorProps) {
  if (props.mode === "single") {
    return (
      <div className="year-selector single">
        <label htmlFor="single-year">Year</label>
        <select
          id="single-year"
          value={props.year}
          onChange={(e) => props.onYearChange(Number(e.target.value))}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const { startYear, endYear } = props;

  return (
    <div className="year-selector range">
      <div className="range-head">
        <span>Year Range</span>
        <strong>
          {startYear} - {endYear}
        </strong>
      </div>
      <div className="range-selects">
        <select
          aria-label="Start year"
          value={startYear}
          onChange={(e) => {
            const next = Number(e.target.value);
            props.onRangeChange(Math.min(next, endYear), endYear);
          }}
        >
          {YEARS.map((year) => (
            <option key={`from-${year}`} value={year}>
              From {year}
            </option>
          ))}
        </select>
        <select
          aria-label="End year"
          value={endYear}
          onChange={(e) => {
            const next = Number(e.target.value);
            props.onRangeChange(startYear, Math.max(next, startYear));
          }}
        >
          {YEARS.map((year) => (
            <option key={`to-${year}`} value={year}>
              To {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
