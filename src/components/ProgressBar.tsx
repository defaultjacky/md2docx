import "./ProgressBar.css";

interface ProgressBarProps {
  progress: number;
  status: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="progress-status">{status}</p>
    </div>
  );
}
