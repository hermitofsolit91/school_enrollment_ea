import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_COUNTRIES_LABEL,
  COUNTRY_NAMES,
  type CountryName,
  isAllCountriesSelected,
  normalizeSelectedCountries,
} from "../../constants/countries";
import ChipTag from "./ChipTag";

type CountrySelectorProps = {
  selected: CountryName[];
  selectedCountries?: CountryName[];
  onChange: (next: CountryName[]) => void;
};

export default function CountrySelector({ selected: selectedProp, selectedCountries, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const resolvedSelected = selectedCountries ?? selectedProp;
  const normalized = useMemo(
    () => normalizeSelectedCountries(resolvedSelected),
    [resolvedSelected],
  );
  const allChecked = isAllCountriesSelected(normalized);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleAll = (checked: boolean) => {
    onChange(checked ? [...COUNTRY_NAMES] : []);
  };

  const toggleCountry = (country: CountryName, checked: boolean) => {
    const set = new Set(normalized);
    if (checked) set.add(country);
    else set.delete(country);
    onChange(COUNTRY_NAMES.filter((c) => set.has(c)));
  };

  return (
    <div className="country-selector" ref={rootRef}>
      <button type="button" className="selector-trigger" onClick={() => setOpen((v) => !v)}>
        <span>Countries</span>
        <strong>{allChecked ? ALL_COUNTRIES_LABEL : `${normalized.length} selected`}</strong>
      </button>

      {open && (
        <div className="selector-menu">
          <label className="selector-row">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            <span>{ALL_COUNTRIES_LABEL}</span>
          </label>

          <div className="selector-scroll">
            {COUNTRY_NAMES.map((country) => (
              <label key={country} className="selector-row">
                <input
                  type="checkbox"
                  checked={normalized.includes(country)}
                  onChange={(e) => toggleCountry(country, e.target.checked)}
                />
                <span>
                  {country}
                </span>
              </label>
            ))}
          </div>

          <button type="button" className="clear-btn" onClick={() => onChange([])}>
            Clear All
          </button>
        </div>
      )}

      <div className="chip-list">
        {normalized.map((country) => (
          <ChipTag
            key={country}
            label={country}
            onRemove={() => onChange(normalized.filter((c) => c !== country))}
          />
        ))}
      </div>
    </div>
  );
}
