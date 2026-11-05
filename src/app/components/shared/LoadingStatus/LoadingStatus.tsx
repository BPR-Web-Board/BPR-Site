import { LoaderCircle } from "lucide-react";

export default function LoadingStatus({ label = "Loading more articles…" }: { label?: string }) {
  return <div className="site-loading" role="status">
    <LoaderCircle size={16} className="site-loading-icon" aria-hidden="true" />
    <span>{label}</span>
  </div>;
}
