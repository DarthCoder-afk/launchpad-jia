"use client";

interface ProgressHeaderProps {
  step: number;
  totalSteps: number;
}

export default function ProgressHeader({ step, totalSteps }: ProgressHeaderProps) {
  const steps = [
    "Career Details & Team Access",
    "CV Review & Pre-screening",
    "AI Interview Setup",
    "Pipeline Stages",
    "Review Career",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {steps.map((label, index) => {
          const isActive = step === index + 1;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Outer Circle with Inner Solid Circle */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#FFFFFF" : "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: isActive ? "2px solid #000000" : "2px solid #E5E7EB",
                  zIndex: 2,
                }}
              >
                {/* Inner Solid Circle */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: isActive ? "#181D27" : "#E5E7EB",
                  }}
                />
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    width: "100%",
                    height: 4,
                    backgroundColor: "#E5E7EB",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  color: isActive ? "#181D27" : "#6B7280",
                  fontWeight: isActive ? 600 : 400,
                  marginTop: 8,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
