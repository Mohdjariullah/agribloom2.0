"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#F1FAF1",
          padding: "1.5rem",
        }}>
          <div style={{
            maxWidth: "28rem",
            width: "100%",
            background: "white",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#166534" }}>
              The app crashed
            </h1>
            <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
              A fatal error stopped the page from rendering.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#16a34a",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
