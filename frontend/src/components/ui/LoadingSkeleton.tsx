type LoadingSkeletonProps = {
  lines?: number;
  height?: number;
};

export default function LoadingSkeleton({ lines = 3, height = 18 }: LoadingSkeletonProps) {
  return (
    <div className="skeleton-wrap" aria-label="Loading data">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="skeleton-line"
          style={{ height: `${height}px`, width: `${Math.max(45, 92 - i * 11)}%` }}
        />
      ))}
    </div>
  );
}
