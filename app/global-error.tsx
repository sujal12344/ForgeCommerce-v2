"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0f172a",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                height: "44px",
                width: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}
            >
              <span style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>F</span>
            </div>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.3px" }}>
              ForgeCommerce
            </span>
          </div>

          <div style={{ maxWidth: "380px" }}>
            <p style={{ fontSize: "40px", fontWeight: "800", margin: "0 0 8px", color: "#f8fafc" }}>500</p>
            <h2 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 8px", color: "#f8fafc" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
              An unexpected error occurred on our end. Please try again.
            </p>
          </div>

          <button
            onClick={() => reset()}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 28px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
