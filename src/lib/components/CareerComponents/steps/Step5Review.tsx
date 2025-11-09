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
  secretPrompt?: string;
  aiSecretPrompt?: string;
  requireVideo?: boolean;
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
  minimumSalary, maximumSalary, salaryNegotiable, screeningSetting, secretPrompt, aiSecretPrompt, requireVideo,
    teamMembers, preScreeningQuestions, interviewCategories,
    onPublish, onSaveDraft, saving, formType
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#181D27', margin: 0 }}>5. Review & Save</h2>
      <p style={{ fontSize: 14, color: '#414651', marginTop: -8 }}>Confirm all details before {formType === 'add' ? 'creating' : 'updating'} this career. You can still go back to adjust.</p>

      {/* Section: Career Details & Team Access */}
      <CollapsibleCard title="Career Details & Team Access" defaultOpen>
        <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
          {/* Row: Job Title (full width) */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EAECF0'}}>
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

          {/* Row: Job Description (Field) */}
          <div style={{ padding: '14px 16px', borderBottom: teamMembers.length ? '1px solid #EAECF0' : 'none' }}>
            <Field
              label="Job Description"
              value={
                <div style={{ fontSize: 14, color: '#111827', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {normalizeDescription(description || '') || '—'}
                </div>
              }
            />
          </div>

          {/* Row: Team Access list (Field) */}
          <div style={{ padding: '14px 16px' }}>
            <Field
              label="Team Access"
              value={
                teamMembers.length === 0 ? (
                  <Empty value="No team members added" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {teamMembers.map((m) => (
                      <div
                        key={m.email}
                        style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 12 }}
                      >
                        <Avatar name={m.name} image={m.image} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.name}</div>
                          {m.email && <div style={{ fontSize: 12, color: '#667085' }}>{m.email}</div>}
                        </div>
                        <div style={{ fontSize: 12, color: '#98A2B3' }}>{m.role || 'Member'}</div>
                      </div>
                    ))}
                  </div>
                )
              }
            />
          </div>
        </div>
      </CollapsibleCard>

      {/* Section: CV Review & Pre-Screening Questions */}
      <CollapsibleCard title="CV Review & Pre-Screening Questions" defaultOpen>
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20 }}>
          {/* Row: CV Screening (Field) */}
          <div style={{ marginBottom: 12 }}>
            <Field
              label="CV Screening"
              value={
                <span style={{  color: '#181D27' }}>
                  Automatically endorse candidates who are {renderScreeningSettingPill(screeningSetting)} and above
                </span>
              }
            />
          </div>
          <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />

          {/* Row: CV Secret Prompt (Field) */}
          <div style={{ marginBottom: 12 }}>
            <Field
              label={
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <img
                    src="/career_form_svg/star.svg"
                    width={16}
                    height={16}
                    alt="gradient star icon"
                    aria-hidden="true"
                  />
                  <span>CV Secret Prompt</span>
                </div>
              }
              value={
                secretPrompt ? (
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {splitPrompt(secretPrompt).map((line, idx) => (
                      <li key={idx} style={{  color: '#414651', lineHeight: 1.4 }}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{  color: '#667085', fontStyle: 'italic' }}>No secret prompt provided.</span>
                )
              }
            />
          </div>
          <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />

          {/* Row: Pre-Screening Questions (Field for count) */}
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#181D27' }}>Pre-Screening Questions</div>
              <span
                aria-label="Pre-screening questions count"
                style={{ fontSize: 11, lineHeight: '16px', padding: '1px 6px', borderRadius: 999, border: '1px solid #D5D7DA', background: '#FFFFFF', color: '#181D27', fontWeight: 500 }}>
                {preScreeningQuestions.length}
              </span>
            </div>
          {preScreeningQuestions.length === 0 ? (
            <div style={{ color: '#667085', fontStyle: 'italic' }}>None</div>
          ) : (
            <ol style={{ fontSize: 13, margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {preScreeningQuestions.map((q, idx) => (
                <li key={String(q.id ?? idx)} style={{ color: '#181D27' }}>
                  <div style={{ marginBottom: 6 }}>{q.title || q.key || 'Untitled question'}</div>
                  {renderQuestionDetails(q)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </CollapsibleCard>

      {/* Section: AI Interview Setup (redesigned, using Field) */}
      <CollapsibleCard title="AI Interview Setup" defaultOpen>
        <div style={{ background: '#FFFFFF',  borderRadius: 16, padding: 20 }}>
          {/* Row: AI Interview Screening (Field) */}
          <div style={{ marginBottom: 12 }}>
            <Field
              label="AI Interview Screening"
              value={
                <span style={{  color: '#181D27' }}>
                  Automatically endorse candidates who are {renderScreeningSettingPill(screeningSetting)} and above
                </span>
              }
            />
          </div>
          <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />

          {/* Row: Require Video (Field) */}
          <div style={{ marginBottom: 12 }}>
            <Field
              label="Require Video on Interview"
              value={
                <div style={{ color: '#414651', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="la la-video" style={{ color: '#667085' }} aria-hidden="true"></i>
                  {requireVideo ? 'Yes' : 'No'}
                </div>
              }
            />
          </div>
          <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />

          {/* Row: AI Secret Prompt (Field) */}
          <div style={{ marginBottom: 12 }}>
            <Field
              label={
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <img
                    src="/career_form_svg/star.svg"
                    width={16}
                    height={16}
                    alt="gradient star icon"
                    aria-hidden="true"
                  />
                  <span>AI Interview Secret Prompt</span>
                </div>
              }
              value={
                aiSecretPrompt ? (
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {splitPrompt(aiSecretPrompt).map((line, idx) => (
                      <li key={idx} style={{  color: '#414651', lineHeight: 1.4 }}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: '#667085', fontStyle: 'italic' }}>No secret prompt provided.</span>
                )
              }
            />
          </div>
          <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />

          {/* Row: Interview Questions (heading with inline count pill) */}
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#181D27' }}>Interview Questions</div>
            <span
              aria-label="Interview questions count"
              style={{ fontSize: 11, lineHeight: '16px', padding: '1px 6px', borderRadius: 999, border: '1px solid #D5D7DA', background: '#FFFFFF', color: '#181D27', fontWeight: 500 }}>
              {interviewCategories ? interviewCategories.reduce((sum, c) => sum + c.questions.length, 0) : 0}
            </span>
          </div>
          {(!interviewCategories || interviewCategories.every(c => c.questions.length === 0)) ? (
            <div style={{  color: '#667085', fontStyle: 'italic' }}>None</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(() => {
                const items: React.ReactNode[] = [];
                let counter = 1;
                interviewCategories!.forEach(cat => {
                  if (cat.questions.length === 0) return;
                  items.push(
                    <div key={`heading-${cat.label}`} style={{ fontSize: 14, fontWeight: 600, color: '#667085',  letterSpacing: 0.3 }}>{cat.label}</div>
                  );
                  cat.questions.forEach(q => {
                    items.push(
                      <div key={`q-${cat.label}-${counter}`} style={{ fontSize: 13, color: '#414651', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ color: '#181D27', fontWeight: 600 }}>{counter}.</span>
                        <span style={{ flex: 1 }}>{q.text || '—'}</span>
                      </div>
                    );
                    counter++;
                  });
                });
                return items;
              })()}
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Section: Pipeline Stages (Step 4 static summary) */}
      <CollapsibleCard title="Pipeline Stages" defaultOpen>
        <div style={{ background: '#FFFFFF', border: '1px solid #EAECF0', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
            {renderPipelineStage('CV Screening', 'la la-user', ['Waiting Submission', 'For Review'])}
            {renderPipelineStage('AI Interview', 'la la-microphone', ['Waiting Interview', 'For Review'])}
            {renderPipelineStage('Personality Test', 'la la-brain', ['Waiting Submission', 'For Review'])}
            {renderPipelineStage('Coding Test', 'la la-code', ['Waiting Submission', 'For Review'])}
          </div>
        </div>
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
function Field({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 14, color: '#667085', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: '#111827' }}>{value}</div>
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

// Helpers for CV Review & Pre-screening render
function renderScreeningSettingPill(setting?: string) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        display: 'inline-block',
        padding: '1px 8px',
        border: '1px solid #D5D7DA',
        borderRadius: 999,
        background: '#FFFFFF',
        color: '#181D27',
        fontSize: 12,
        lineHeight: '18px',
        fontWeight: 500,
      }}>{setting || 'Good Fit'}</span>
    </span>
  );
}

function splitPrompt(prompt: string): string[] {
  // Split into non-empty trimmed lines; convert sentences or bullets into items
  const lines = prompt
    .replace(/\r/g, '')
    .split(/\n|\u2022|•/)
    .map((s) => s.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean);
  // If it's a single long paragraph, try to split by sentences
  if (lines.length <= 1) {
    return prompt
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return lines;
}

function renderQuestionDetails(q: any) {
  if (q.type === 'dropdown' || q.type === 'checkboxes') {
    const opts = (q.options || []) as Array<{ id: string; label: string }>;
    if (!opts.length) return null;
    return (
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {opts.map((opt) => (
          <li key={opt.id} style={{ fontSize: 13, color: '#414651' }}>{opt.label}</li>
        ))}
      </ul>
    );
  }
  if (q.type === 'range') {
    const min = q.min ?? '';
    const max = q.max ?? '';
    const cur = q.currency ?? '';
    const label = [cur, min && String(min), (min || max) && max ? ' - ' : '', cur && !min && max ? cur + ' ' : '', max && String(max)]
      .filter(Boolean)
      .join('');
    return <div style={{ fontSize: 13, color: '#414651' }}>{label || '—'}</div>;
  }
  // short/long answer have no predefined options
  return null;
}

// Static pipeline stage renderer for Step 4 review card
function renderPipelineStage(title: string, iconClass: string, subStages: string[]) {
  return (
    <div style={{ border: '1px solid #E9EAEB', background: '#F9FAFB', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className={iconClass} style={{ fontSize: 16, color: '#667085' }} aria-hidden="true"></i>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#181D27' }}>{title}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#667085', letterSpacing: 0.5, textTransform: 'uppercase' }}>Substages</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {subStages.map((s) => (
          <div key={s} style={{
            border: '1px solid #E9EAEB',
            background: '#FFFFFF',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
            color: '#181D27',
            fontWeight: 500
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}
