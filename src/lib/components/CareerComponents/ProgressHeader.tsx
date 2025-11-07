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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px", overflowX: "auto", paddingBottom: "8px" }} className="md:overflow-x-visible md:pb-0">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", minWidth: "600px" }} className="md:min-w-0">
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
                minWidth: "100px",
              }}
            >
              {/* Outer Circle with Inner Solid Circle */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#FFFFFF" : "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: isActive ? "2px solid #000000" : "2px solid #E5E7EB",
                  zIndex: 2,
                  flexShrink: 0,
                }}
                className="md:w-6 md:h-6"
              >
                {/* Inner Solid Circle */}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isActive ? "#181D27" : "#E5E7EB",
                  }}
                  className="md:w-2 md:h-2"
                />
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "50%",
                    width: "100%",
                    height: 2,
                    backgroundColor: "#E5E7EB",
                    zIndex: 0,
                  }}
                  className="md:top-3 md:h-1"
                />
              )}

              {/* Label */}
              <span
                style={{
                  fontSize: "10px",
                  color: isActive ? "#181D27" : "#6B7280",
                  fontWeight: isActive ? 600 : 400,
                  marginTop: 6,
                  textAlign: "center",
                  whiteSpace: "normal",
                  lineHeight: "1.2",
                  padding: "0 2px",
                }}
                className="md:text-xs md:mt-2 md:whitespace-nowrap md:px-0"
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
