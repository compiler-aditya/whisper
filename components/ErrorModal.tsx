"use client";

interface ErrorModalProps {
  open: boolean;
  title: string;
  message: string;
  retryable?: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export default function ErrorModal({
  open,
  title,
  message,
  retryable = true,
  onClose,
  onRetry,
}: ErrorModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(5,5,5,0.85)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[380px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 mx-auto mb-5 flex items-center justify-center"
          style={{
            background: "rgba(212,68,59,0.08)",
            border: "1px solid rgba(212,68,59,0.2)",
            borderRadius: "50%",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="var(--danger)"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2
          className="text-center text-lg font-light mb-2"
          style={{ color: "var(--text)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          className="text-center text-sm mb-6 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {retryable && onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 text-sm transition-all active:scale-[0.98]"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                borderRadius: 10,
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 text-sm transition-all active:scale-[0.98]"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: 10,
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
