type ChipTagProps = {
  label: string;
  onRemove: () => void;
};

export default function ChipTag({ label, onRemove }: ChipTagProps) {
  return (
    <span className="chip-tag">
      <span>{label}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>
        ×
      </button>
    </span>
  );
}
