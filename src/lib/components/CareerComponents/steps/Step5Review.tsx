// (Using "la" icon font per request)
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
  onEditCareerDetails?: () => void;
  onEditCVReview?: () => void;
  onEditAISetup?: () => void;
  onEditPipeline?: () => void;
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
    onEditCareerDetails, onEditCVReview, onEditAISetup, onEditPipeline,
    onPublish, onSaveDraft, saving, formType
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#181D27' }}>5. Review & Save</h2>
      <p style={{ fontSize: 16, color: '#414651', marginTop:-20}}>Confirm all details before {formType === 'add' ? 'creating' : 'updating'} this career. You can still go back to adjust.</p>

      {/* Section: Career Details & Team Access */}
  <CollapsibleCard title="Career Details & Team Access" defaultOpen onEdit={onEditCareerDetails} editAriaLabel="Edit career details and team access">
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
  <CollapsibleCard title="CV Review & Pre-Screening Questions" defaultOpen onEdit={onEditCVReview} editAriaLabel="Edit CV review and pre-screening">
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
                  <div style={{ marginBottom: 6 }}>{(q.title && String(q.title).trim()) || 'Untitled question'}</div>
                  {renderQuestionDetails(q)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </CollapsibleCard>

      {/* Section: AI Interview Setup (redesigned, using Field) */}
  <CollapsibleCard title="AI Interview Setup" defaultOpen onEdit={onEditAISetup} editAriaLabel="Edit AI interview setup">
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: 12,
            }}
          >
            {/* Label */}
            <div
              style={{
                fontWeight: 600,
                color: '#0F172A',
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              Require Video on Interview
            </div>

            {/* Dynamic Value */}
            {requireVideo ? (
              // ✅ YES STATE
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 6,
                  color: '#027A48',
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                <span style={{ lineHeight: 1 }}>Yes</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '1px solid #A6F4C5',
                    backgroundColor: '#ECFDF3',
                    flexShrink: 0,
                  }}
                >
                  <i
                    className="la la-check"
                    aria-hidden="true"
                    style={{ fontSize: 13, color: '#12B76A', lineHeight: 1 }}
                  ></i>
                </span>
              </div>
            ) : (
              // ❌ NO STATE
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 6,
                  color: '#B42318',
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                <span style={{ lineHeight: 1 }}>No</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '1px solid #FEE4E2',
                    backgroundColor: '#FEF3F2',
                    flexShrink: 0,
                  }}
                >
                  <i
                    className="la la-times"
                    aria-hidden="true"
                    style={{ fontSize: 13, color: '#F04438', lineHeight: 1 }}
                  ></i>
                </span>
              </div>
            )}
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
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Interview Questions</div>
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
                    <div key={`heading-${cat.label}`} style={{ fontSize: 12, color: '#111827', fontWeight: 600, letterSpacing: 0.3 }}>{cat.label}</div>
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
  <CollapsibleCard title="Pipeline Stages" defaultOpen onEdit={onEditPipeline} editAriaLabel="Edit pipeline stages">
        <div style={{ background: '#FFFFFF',  borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
            {renderPipelineStage('CV Screening', 'la la-user', ['Waiting Submission', 'For Review'])}
            {renderPipelineStage('AI Interview', 'la la-microphone', ['Waiting Interview', 'For Review'])}
            {renderPipelineStage('Personality Test', 'la la-brain', ['Waiting Submission', 'For Review'])}
            {renderPipelineStage('Coding Test', 'la la-code', ['Waiting Submission', 'For Review'])}
          </div>
        </div>
      </CollapsibleCard>

     
    </div>
  );
}

function CollapsibleCard({ title, children, defaultOpen = true, onEdit, editAriaLabel }) {
  const [open, setOpen] = React.useState(!!defaultOpen);

return (
  <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2" style={{ background: '#F9FAFB' }}>
    <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px 0 8px',
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse section' : 'Expand section'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <i
            className={`la ${open ? 'la-angle-up' : 'la-angle-down'}`}
            style={{ fontSize: 18, color: '#667085' }}
            aria-hidden="true"
          />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#181D27', margin: 0 }}>{title}</h3>
        </button>
      </div>

      <button
        type="button"
        onClick={onEdit ?? (() => {})}
        disabled={!onEdit}
        aria-disabled={!onEdit}
        aria-label={editAriaLabel || `Edit ${title}`}
        title={editAriaLabel || `Edit ${title}`}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid #E9EAEB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onEdit ? 'pointer' : 'default',
          opacity: onEdit ? 1 : 0.7,
          marginBottom: 5,
        }}
      >
        <i className="las la-pencil-alt text-lg" style={{ color: '#181D27' }} aria-hidden="true"></i>
      </button>
    </div>

    {/* Smooth expandable content */}
    <div
      style={{
        overflow: 'hidden',
        maxHeight: open ? 1000 : 0, // adjust to fit content height
        opacity: open ? 1 : 0,
        transition: 'max-height 0.4s ease, opacity 0.3s ease',
      }}
    >
      <div
        className="layered-card-middle bg-white p-4 mb-2"
        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        {children}
      </div>
    </div>
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
      <div style={{ fontSize: 14, color: '#111827', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, color: '#161f33ff' }}>{value}</div>
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

function normalizeDescription(input: string): string {
  if (!input) return '';
  try {
    // 🧹 Step 1: Clean up HTML and boilerplate labels
    let s = input.replace(/^\s*Job\s*Description\s*:*/i, '');
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/(div|p)>/gi, '\n');
    s = s.replace(/<[^>]+>/g, '');
    s = s.replace(/(^|[\r\n])\s*Job\s*Description\s*:?\s*(?=\r?\n|$)/gi, '$1');

    const lines = s.split(/\r?\n/);
    const out: string[] = [];

    // 🧩 Define all recognized headings that should start bullet sections
    const bulletHeadings = new Set([
      'responsibilities',
      'responsibility',
      'qualifications',
      'qualification',
      'requirements',
      'requirement',
      'skills',
      'duties',
      'tasks',
      'expectations',
    ]);

    let inBulletSection = false;

    // 🧠 Step 2: Process each line
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();
      if (!trimmed) {
        out.push('');
        continue;
      }

      // Detect headings like "Responsibilities:" or "Skills"
      const headingMatch = trimmed.match(/^([A-Za-z][A-Za-z &/()\-]{2,})\s*:?\s*$/);
      if (headingMatch) {
        const headingKey = headingMatch[1].toLowerCase();
        if (bulletHeadings.has(headingKey)) {
          // 🧩 Add one line before heading for readability
          out.push('');
          out.push(`${headingMatch[1]}:`);
          inBulletSection = true;
          continue;
        } else {
          // Not a recognized heading, just reset bullet mode
          inBulletSection = false;
        }
      }

      if (inBulletSection) {
        // 🟢 Convert paragraph into bullet points
        const alreadyBulleted = /^(?:[-*•]\s+)/.test(trimmed);
        const base = alreadyBulleted ? trimmed.replace(/^(?:[-*•]\s+)/, '') : trimmed;
        const sentences = base
          .split(/(?<=[.!?][)"'”]?)\s*(?=[A-Z0-9])/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0);

        if (sentences.length > 1) {
          sentences.forEach((sPart) => out.push(`• ${sPart.replace(/^(?:[-*•]\s*)/, '')}`));
        } else {
          out.push(`• ${base}`);
        }
      } else {
        // Non-bullet sections — keep plain or convert existing bullets
        if (/^(?:[-*•]\s+)/.test(trimmed)) {
          out.push(`• ${trimmed.replace(/^(?:[-*•]\s*)/, '')}`);
        } else {
          out.push(raw);
        }
      }
    }

    // 🧹 Step 3: Clean and normalize final text
    let formatted = out.join('\n');

    // Remove extra line after any recognized heading (e.g., "Responsibilities:\n\n•" → "Responsibilities:\n•")
    bulletHeadings.forEach((h) => {
      const regex = new RegExp(`(${h}s?:)\\n\\n`, 'gi');
      formatted = formatted.replace(regex, '$1\n');
    });

    // Collapse excessive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();

    return formatted;
  } catch {
    return input;
  }
}



// Helpers for CV Review & Pre-screening render
function renderScreeningSettingPill(setting?: string) {
  const displaySetting = setting?.split(' and')[0] || 'Good Fit';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        display: 'inline-block',
        padding: '1px 8px',
        border: '1px solid #B2DDFF',
        borderRadius: 999,
        background: '#EFF8FF',
        color: '#175CD3',
        fontSize: 12,
        lineHeight: '18px',
        fontWeight: 500,
      }}>{displaySetting}</span>
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
      .split(/(?<=[.!?][)"'”]?)\s*(?=[A-Z0-9])/)
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
