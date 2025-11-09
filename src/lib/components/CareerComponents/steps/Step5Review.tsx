"use client";
import React, { useState } from 'react';
import type { Category } from './Step3AI_Interview';

interface PreScreeningQuestion {
  id: string | number;
  key?: string;
  title?: string; // primary display text
  type?: string;
  options?: any;
}

interface Step5ReviewProps {
  jobTitle: string;
  description: string;
  employmentType: string;
  workSetup: string;
  country: string;
  province: string;
  city: string;
  minimumSalary: string | number;
  maximumSalary: string | number;
  salaryNegotiable: boolean;
  screeningSetting: string;
  teamMembers: any[];
  preScreeningQuestions: PreScreeningQuestion[];
  interviewCategories?: Category[];
  onPublish: () => Promise<void> | void;
  onSaveDraft: () => Promise<void> | void;
  saving: boolean;
  formType: string;
}

export default function Step5Review(props: Step5ReviewProps) {
  const {
    jobTitle, description, employmentType, workSetup, country, province, city,
    minimumSalary, maximumSalary, salaryNegotiable, screeningSetting,
    teamMembers, preScreeningQuestions, interviewCategories,
    onPublish, onSaveDraft, saving, formType
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#181D27', margin: 0 }}>5. Review & Save</h2>
      <p style={{ fontSize: 14, color: '#414651', marginTop: -8 }}>Confirm all details before {formType === 'add' ? 'creating' : 'updating'} this career. You can still go back to adjust.</p>

      {/* Section: Career Details & Team Access */}
      <CollapsibleCard title="Career Details & Team Access" defaultOpen>
        <div style={{ background: '#FFFFFF', border: '1px solid #EAECF0', borderRadius: 16, overflow: 'hidden' }}>
          {/* Row: Job Title (full width) */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAECF0' }}>
            <Field label="Job Title" value={jobTitle || '—'} />
          </div>

          {/* Row: Employment Type | Work Arrangement */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderBottom: '1px solid #EAECF0' }}>
            <div style={{ padding: '14px 16px' }}>
              <Field label="Employment Type" value={employmentType || '—'} />
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Field label="Work Arrangement" value={workSetup || '—'} />
            </div>
          </div>

          {/* Row: Country | State / Province | City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderBottom: '1px solid #EAECF0' }}>
            <div style={{ padding: '14px 16px' }}>
              <Field label="Country" value={country || '—'} />
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Field label="State / Province" value={province || '—'} />
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Field label="City" value={city || '—'} />
            </div>
          </div>

          {/* Row: Minimum Salary | Maximum Salary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderBottom: '1px solid #EAECF0' }}>
            <div style={{ padding: '14px 16px' }}>
              <Field label="Minimum Salary" value={salaryNegotiable ? 'Negotiable' : (minimumSalary || '—')} />
            </div>
            <div style={{ padding: '14px 16px' }}>
              <Field label="Maximum Salary" value={salaryNegotiable ? 'Negotiable' : (maximumSalary || '—')} />
            </div>
          </div>

          {/* Row: Job Description (block) */}
          <div style={{ padding: '14px 16px', borderBottom: teamMembers.length ? '1px solid #EAECF0' : 'none' }}>
            <div style={{ fontSize: 12, color: '#667085', marginBottom: 6 }}>Job Description</div>
            <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{normalizeDescription(description || '') || '—'}</div>
          </div>

          {/* Row: Team Access list */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#667085', marginBottom: 10 }}>Team Access</div>
            {teamMembers.length === 0 && <Empty value="No team members added" />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {teamMembers.map((m) => (
                <div key={m.email}
                     style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 12 }}>
                  <Avatar name={m.name} image={m.image} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.name}</div>
                    {m.email && <div style={{ fontSize: 12, color: '#667085' }}>{m.email}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: '#98A2B3' }}>{m.role || 'Member'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Section: CV Review & Pre-screening */}
      <CollapsibleCard title="CV Review & Pre-screening" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          <SubCard title="Pre-Screening Questions">
            {preScreeningQuestions.length === 0 && <Empty value="None" />}
            {preScreeningQuestions.map((q, i) => {
              // Safe extraction: prefer explicit title, fallback to key, else show id
              const display = typeof q === 'string' ? q : (q.title || q.key || q.id || 'Untitled');
              return (
                <div key={typeof q === 'object' ? String(q.id ?? i) : String(i)} style={{ fontSize: 13, color: '#181D27', marginBottom: 6 }}>
                  {display}
                </div>
              );
            })}
          </SubCard>
        </div>
      </CollapsibleCard>

      {/* Section: AI Interview Setup */}
      <CollapsibleCard title="AI Interview Setup" defaultOpen>
        <SubCard title="Interview Categories">
          {(!interviewCategories || interviewCategories.every(c => c.questions.length === 0)) && <Empty value="No interview questions" />}
          {interviewCategories?.map((cat) => (
            <div key={cat.label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#181D27', marginBottom: 4 }}>{cat.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cat.questions.slice(0, 5).map((q, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#414651', lineHeight: 1.4 }}>
                    • {q.text || '—'}
                  </div>
                ))}
                {cat.questions.length > 5 && (
                  <div style={{ fontSize: 12, color: '#667085' }}>+ {cat.questions.length - 5} more</div>
                )}
              </div>
            </div>
          ))}
        </SubCard>
      </CollapsibleCard>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSaveDraft()}
          style={{
            padding: '10px 16px',
            borderRadius: 60,
            border: '1px solid #D5D7DA',
            background: '#FFFFFF',
            color: '#181D27',
            fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onPublish()}
          style={{
            padding: '10px 16px',
            borderRadius: 60,
            border: '1px solid #181D27',
            background: '#181D27',
            color: '#FFFFFF',
            fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}
        >
          {saving ? 'Publishing…' : formType === 'add' ? 'Publish Career' : 'Update & Publish'}
          <i className="la la-check-circle" style={{ fontSize: 16 }}></i>
        </button>
      </div>
    </div>
  );
}

function CollapsibleCard({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2" style={{ background: '#F9FAFB' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px 0 8px' }}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Collapse section' : 'Expand section'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <i className={`la ${open ? 'la-angle-up' : 'la-angle-down'}`} style={{ fontSize: 18, color: '#667085' }} aria-hidden="true"></i>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#181D27', margin: 0 }}>{title}</h3>
        </button>
      </div>
      {open && (
        <div className="layered-card-middle bg-white p-4 mb-2" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SubCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2" style={{ background: '#FFFFFF' }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#181D27', margin: '8px 12px 0 12px' }}>{title}</h4>
      <div className="layered-card-middle bg-white p-4 mb-2" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 13, color: '#667085' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#181D27', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Empty({ value }: { value: string }) {
  return <div style={{ fontSize: 13, fontStyle: 'italic', color: '#667085' }}>{value}</div>;
}

// New simple field and avatar helpers for the details view
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#667085', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#111827' }}>{value}</div>
    </div>
  );
}

function Avatar({ name, image }: { name?: string; image?: string }) {
  if (image) {
    return <img src={image} alt={name || 'member'} style={{ width: 32, height: 32, borderRadius: 999, objectFit: 'cover', border: '1px solid #E2E4E8' }} />;
  }
  const initials = (name || '?')
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: 999, background: '#EEF2F6', color: '#475467', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, border: '1px solid #E2E4E8' }}>
      {initials}
    </div>
  );
}

// Normalize/sanitize HTML-ish job description to readable plain text
function normalizeDescription(input: string): string {
  if (!input) return '';
  try {
    // Remove leading label if present
    let s = input.replace(/^\s*Job\s*Description\s*:*/i, '');
    // Normalize common HTML breaks/containers to newlines
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/(div|p)>/gi, '\n');
    // Strip remaining tags
    s = s.replace(/<[^>]+>/g, '');
    // Remove any standalone 'Job Description:' lines leftover
    s = s.replace(/(^|[\r\n])\s*Job\s*Description\s*:?\s*(?=\r?\n|$)/gi, '$1');
    // Convert key sections into bullet lists
    const lines = s.split(/\r?\n/);
    const out: string[] = [];
    const bulletHeadings = new Set(['responsibilities', 'responsibility', 'qualifications', 'qualification']);
    let inBulletSection = false;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();
      const headingMatch = trimmed.match(/^([A-Za-z][A-Za-z &/()\-]{2,})\s*:?\s*$/);
      if (headingMatch) {
        const headingKey = headingMatch[1].toLowerCase();
        if (bulletHeadings.has(headingKey)) {
          out.push(`${headingMatch[1]}:`);
          out.push('');
          inBulletSection = true;
          continue;
        } else {
          inBulletSection = false;
        }
      }
      if (trimmed.length === 0) {
        out.push('');
        // Do not exit bullet section on blank lines; keep collecting until next heading
        continue;
      }
      if (inBulletSection) {
        const bulletText = trimmed.replace(/^(?:[-*•]\s*)/, '');
        out.push(`• ${bulletText}`);
      } else {
        // Normalize ad-hoc bullets even outside known sections
        if (/^(?:[-*•]\s+)/.test(trimmed)) {
          out.push(`• ${trimmed.replace(/^(?:[-*•]\s*)/, '')}`);
        } else {
          out.push(raw);
        }
      }
    }
    let formatted = out.join('\n');
    // Collapse excessive blank lines and trim
    formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();
    return formatted;
  } catch {
    return input;
  }
}
