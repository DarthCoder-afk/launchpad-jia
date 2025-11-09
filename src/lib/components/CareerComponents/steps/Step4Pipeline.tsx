"use client";

// Step 4 – Pipeline Stages (Optional)
// Purely presentational to mirror the provided mock. No persistence or drag/drop for now.

export default function Step4Pipeline() {
  const stages: Array<{ title: string; icon?: string; subStages: string[] }> = [
    { title: 'CV Screening', icon: 'la la-file-alt', subStages: ['Waiting Submission', 'For Review'] },
    { title: 'AI Interview', icon: 'la la-microphone', subStages: ['Waiting Interview', 'For Review'] },
    { title: 'Final Human Interview', icon: 'la la-users', subStages: ['Waiting Schedule', 'Waiting Interview', 'For Review'] },
    { title: 'Job Offer', icon: 'la la-briefcase', subStages: ['For Final Review', 'Waiting Offer Acceptance', 'For Contract Signing', 'Hired'] },
  ];

  const StageCard = ({ title, icon, subStages }: { title: string; icon?: string; subStages: string[] }) => (
    <div style={{ background: '#F7F9FC', border: '1px solid #EAECF0', borderRadius: 20, padding: 0, marginTop: 12 }}>
      <div style={{ position: 'relative', padding: 14, paddingTop: 56 }}>
        {/* Top dashed card behind (absolute) */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 14,
            right: 14,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: '#98A2B3',
            fontSize: 14,
            borderRadius: 16,
            border: '1px dashed #E9EAEB',
            background: '#FFFFFF',
            padding: '0 12px',
            zIndex: 0,
          }}
        >
          <i className="la la-lock" aria-hidden="true" style={{ fontSize: 14 }} /> Core stage, cannot move
        </div>
        {/* Header row */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {icon && <i className={icon} aria-hidden="true" style={{ color: '#98A2B3' }} />}
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{title}</h4>
              <i className="la la-question-circle" aria-hidden="true" title="This is a core stage in the hiring pipeline." style={{ color: '#98A2B3', fontSize: 16 }} />
            </div>
            <i className="la la-lock" aria-hidden="true" style={{ color: '#98A2B3', fontSize: 16 }} />
          </div>

          {/* Substages */}
          <div style={{ position: 'relative', zIndex: 1, color: '#98A2B3', fontSize: 12, marginBottom: 8 }}>Substages</div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subStages.map((s) => (
              <div
                key={`${title}-${s}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #EAECF0',
                  borderRadius: 12,
                  fontSize: 13,
                  color: '#111827',
                  boxShadow: '0 1px 0 rgba(16,24,40,0.02)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{s}</span>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    border: '1px solid #EAECF0',
                    color: '#667085',
                    background: '#FFFFFF',
                  }}
                >
                  <i className="la la-bolt text-lg" aria-hidden="true" />
                </span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );

  const DividerWithPlus = () => (
    <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', height: '100%' }}>
      <div
        title="Add stage (placeholder)"
        style={{
          width: 44,
          height: '100%',
          border: '1px dashed #E9EAEB',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#667085',
          background: 'transparent',
        }}
      >
        +
      </div>
    </div>
  );

  const Toolbar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 999,
          border: '1px solid #D5D7DA',
          background: '#FFFFFF',
          color: '#101828',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <i className="las la-history" aria-hidden="true" />
        Restore to default
      </button>
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 999,
          border: '1px solid #D5D7DA',
          background: '#FFFFFF',
          color: '#101828',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Copy pipeline from existing job
        <i className="la la-angle-down" aria-hidden="true" />
      </button>
    </div>
  );

  // Build grid items with only the middle divider (between second and third cards)
  const gridItems: React.ReactNode[] = [];
  stages.forEach((stage, idx) => {
    gridItems.push(<StageCard key={`stage-${stage.title}`} {...stage} />);
    // Insert divider only after the second stage (idx === 1)
    if (idx === 1) {
      gridItems.push(<DividerWithPlus key="divider-middle" />);
    }
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
      <div style={{ width: '100%', maxWidth: 1500 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px 0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 650, color: '#111827' }}>Customize pipeline stages</h2>
            <p style={{ margin: 0, marginTop: 6, color: '#667085', fontSize: 14 }}>
              Create, modify, reorder, and delete stages and sub-stages. Core stages are fixed and can’t be moved or edited as they are essential to Jia’s system logic.
            </p>
          </div>
          <Toolbar />
        </div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 44px 1fr 1fr', gap: 12, alignItems: 'stretch' }}>{gridItems}</div>
      </div>
    </div>
  );
}

