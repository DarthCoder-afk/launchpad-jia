"use client";

interface ProgressHeaderProps {
  step: number;              // current active step (1-indexed)
  totalSteps: number;        // total number of steps
  currentStepPartial?: boolean; // when true, show the connector to the next step as half-filled
}

export default function ProgressHeader({ step, totalSteps, currentStepPartial }: ProgressHeaderProps) {
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
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber; // user already moved past this step
          const isLast = index === steps.length - 1;

            // Connector progress logic (line leading out to next step)
          // States:
          //  - Completed (past step): 100%
          //  - Active + partial flag: 50%
          //  - Active (no partial) or not reached yet: 0%
          let connectorFillPercent = 0;
          if (!isLast) {
            if (isCompleted) connectorFillPercent = 100;
            else if (isActive && currentStepPartial) connectorFillPercent = 50;
          }

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
              {/* Outer / Inner Circle */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#FFFFFF" : isCompleted ? "#FFFFFF" : "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: isActive || isCompleted ? "2px solid #000000" : "2px solid #E5E7EB",
                  zIndex: 2,
                  flexShrink: 0,
                  transition: "border-color 0.25s ease, background-color 0.25s ease",
                }}
                className="md:w-6 md:h-6"
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isActive || isCompleted ? "#181D27" : "#E5E7EB",
                    transition: "background-color 0.25s ease",
                  }}
                  className="md:w-2 md:h-2"
                />
              </div>

              {/* Connector (background + progress overlay) */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "50%",
                    width: "100%",
                    height: 2,
                    backgroundColor: "#E5E7EB",
                    zIndex: 0,
                    overflow: "hidden",
                  }}
                  className="md:top-3 md:h-1"
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${connectorFillPercent}%`,
                      background: `linear-gradient(
                          90deg,
                          #9fcaed 0%,
                          #ceb6da 33%,
                          #ebacc9 66%,
                          #fccec0 100%
                        )`,
                      transition: "width 0.4s ease",
                    }}
                    />
                </div>
              )}

              {/* Label */}
              <span
                style={{
                  fontSize: "15px",
                  color: isActive || isCompleted ? "#181D27" : "#6B7280",
                  fontWeight: isActive ? 600 : isCompleted ? 600 : 400,
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
