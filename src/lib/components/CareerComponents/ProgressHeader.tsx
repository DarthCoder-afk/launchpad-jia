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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {steps.map((label, index) => {
          const isActive = step === index + 1;
          const isCompleted = step > index + 1;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: isActive || isCompleted ? "#000" : "#E5E7EB",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  zIndex: 1,
                }}
              >
                {index + 1}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    width: "100%",
                    height: 2,
                    backgroundColor: isCompleted ? "#000" : "#E5E7EB",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Label */}
              <span
                style={{
                  fontSize: "12px",
                  color: isActive ? "#000" : "#6B7280",
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
