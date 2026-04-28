type ErrorCardProps = {
  message?: string;
};

export default function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="error-card" role="alert">
      <h4>Unable to load this section</h4>
      <p>{message ?? "Please check your API service and try again."}</p>
    </div>
  );
}
