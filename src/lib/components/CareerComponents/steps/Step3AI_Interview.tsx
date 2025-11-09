"use client";

import { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Functional UI for Step 3: AI Interview Setup – adds generation and editing controls.

export type Step3InterviewRef = {
	validateQuestions: () => boolean;
};

const MIN_TOTAL_QUESTIONS = 5;

export type Question = {
  text: string;
  source: "ai" | "manual";
  editing: boolean; // true when input is editable
};

export type Category = {
  label: string;
  questions: Question[];
  askCount: number;
  showAskCount?: boolean;
};

type GeneratePayload = {
	label: string;
	askCount: number;
	jobDescription?: string;
	secretPrompt?: string;
	existingQuestions?: string[];
};

interface Step3Props {
	jobDescription?: string;
	secretPrompt?: string; // existing (unused currently) job-level prompt if needed
	initialCategories?: Category[]; // allow parent to hydrate from draft
	onCategoriesChange?: (categories: Category[]) => void; // sync upward for persistence
	secretPromptEditable?: boolean; // future flag if needed
	onChangeSecretPrompt?: (val: string) => void; // new handler to persist AI secret prompt
	// NEW: AI interview screening + require video controls (optional props so parent can ignore if not wiring yet)
	screeningSetting?: string; // e.g., "Good Fit and above"
	onChangeScreeningSetting?: (val: string) => void;
	requireVideo?: boolean;
	onChangeRequireVideo?: (val: boolean) => void;
}

const Step3AI_Interview = forwardRef<Step3InterviewRef, Step3Props>(
({ jobDescription, secretPrompt, initialCategories, onCategoriesChange, onChangeSecretPrompt, screeningSetting = "Good Fit and above", onChangeScreeningSetting, requireVideo, onChangeRequireVideo }, ref) => {
	const [loadingAll, setLoadingAll] = useState(false);
	const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
	const [showMinError, setShowMinError] = useState(false);
		// Hydrate from parent if provided; else default empty categories
		const defaultCategories: Category[] = [
			{ label: "CV Validation / Experience", questions: [], askCount: 2, showAskCount: false },
			{ label: "Technical", questions: [], askCount: 2, showAskCount: false },
			{ label: "Behavioral", questions: [], askCount: 2, showAskCount: false },
			{ label: "Analytical", questions: [], askCount: 2, showAskCount: false },
			{ label: "Others", questions: [], askCount: 2, showAskCount: false },
		];
		const [categories, setCategories] = useState<Category[]>(() => initialCategories && initialCategories.length > 0 ? initialCategories : defaultCategories);

		// Total questions regardless of saved state (used for badge count)
		const totalQuestions = useMemo(
			() => categories.reduce((sum, c) => sum + c.questions.length, 0),
			[categories]
		);

		// Count only valid, saved questions: non-empty text and not in editing mode
		const savedValidCount = useMemo(
			() =>
				categories.reduce(
					(sum, c) =>
						sum + c.questions.filter((q) => q.editing === false && q.text && q.text.trim().length > 0).length,
					0
				),
			[categories]
		);

	useImperativeHandle(ref, () => ({
			validateQuestions: () => {
				// Require at least MIN_TOTAL_QUESTIONS that are saved (editing=false) and non-empty
				const ok = savedValidCount >= MIN_TOTAL_QUESTIONS;
			setShowMinError(!ok);
			return ok;
		},
	}));

	useEffect(() => {
		if (showMinError && totalQuestions >= MIN_TOTAL_QUESTIONS) {
			setShowMinError(false);
		}
	}, [totalQuestions, showMinError]);

	// Sync categories upward for persistence when they change
	useEffect(() => {
		if (onCategoriesChange) {
			onCategoriesChange(categories);
		}
	}, [categories, onCategoriesChange]);

	async function generateForIndex(index: number) {
		const cat = categories[index];
		if (cat.askCount < 1) return; // nothing to generate
		setLoadingIdx(index);
		try {
			const payload: GeneratePayload = {
				label: cat.label,
				askCount: Math.max(1, Math.min(20, cat.askCount || 1)),
				jobDescription,
				secretPrompt,
				existingQuestions: cat.questions.map((q) => q.text),
			};
			const res = await fetch("/api/generate-interview-question", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err?.error || `Request failed: ${res.status}`);
			}
			const data: { label: string; questions: string[] } = await res.json();
			setCategories((prev) => {
				const copy = [...prev];
				const aiQs: Question[] = data.questions.map((q) => ({ text: q, source: "ai" as const, editing: false }));
				copy[index] = { ...copy[index], questions: aiQs };
				return copy;
			});
		} catch (e) {
			console.error(e);
			toast.error("Cant generate right now");
		} finally {
			setLoadingIdx(null);
		}
	}

	async function generateAll() {
		setLoadingAll(true);
		try {
			for (let i = 0; i < categories.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				await generateForIndex(i);
			}
		} finally {
			setLoadingAll(false);
		}
	}

	function revealAskCount(index: number) {
		setCategories((prev) => {
			const copy = [...prev];
			copy[index] = { ...copy[index], showAskCount: true };
			return copy;
		});
	}

	function revealAllAskCount() {
		setCategories((prev) => prev.map((c) => ({ ...c, showAskCount: true })));
	}

	function updateAskCount(index: number, value: number) {
		const v = Math.max(0, Math.min(20, Number.isFinite(value) ? value : 0));
		setCategories((prev) => {
			const copy = [...prev];
			copy[index] = { ...copy[index], askCount: v };
			return copy;
		});
	}

	function deleteQuestion(index: number, qIndex: number) {
		setCategories((prev) => {
			const copy = [...prev];
			const qs = [...copy[index].questions];
			qs.splice(qIndex, 1);
			copy[index] = { ...copy[index], questions: qs };
			return copy;
		});
	}

	function updateQuestionText(index: number, qIndex: number, value: string) {
		setCategories((prev) => {
			const copy = [...prev];
			const qs = [...copy[index].questions];
			qs[qIndex] = { ...qs[qIndex], text: value };
			copy[index] = { ...copy[index], questions: qs };
			return copy;
		});
	}

	function setEditing(index: number, qIndex: number, editing: boolean) {
		setCategories((prev) => {
			const copy = [...prev];
			const qs = [...copy[index].questions];
			qs[qIndex] = { ...qs[qIndex], editing };
			copy[index] = { ...copy[index], questions: qs };
			return copy;
		});
	}

	function addManualQuestion(index: number) {
		setCategories((prev) => {
			const copy = [...prev];
			const qs = [...copy[index].questions, { text: "", source: "manual" as const, editing: true }];
			// Hide askCount UI and revert button state when user opts to manually add
			copy[index] = { ...copy[index], questions: qs, showAskCount: false };
			return copy;
		});
	}

	function saveQuestion(index: number, qIndex: number) {
		const q = categories[index].questions[qIndex];
		if (!q.text.trim()) {
			toast.error("Question cannot be empty");
			return;
		}
		setEditing(index, qIndex, false);
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				width: "100%",
				gap: 20,
				alignItems: "flex-start",
				marginTop: 16,
				maxWidth: 1500,
				marginLeft: "auto",
				marginRight: "auto",
			}}
		>
			{/* LEFT COLUMN */}
			<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
				{/* 1. AI Interview Settings */}
				<div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2">
					<h2 className="text-lg font-semibold text-[#181D27] m-3">1. AI Interview Settings</h2>
					<div className="layered-card-middle bg-white p-4 mb-2" style={{ gap: 24 }}>
						{/* AI Interview Screening */}
						<div>
							<h3 className="font-medium text-[#181D27] mb-2" style={{ fontWeight: 600 }}>AI Interview Screening</h3>
							<p className="text-sm text-[#666666] mb-3">
								Jia automatically endorses candidates who meet the chosen criteria.
							</p>
							<CustomDropdown
								onSelectSetting={(val) => onChangeScreeningSetting?.(val)}
								screeningSetting={screeningSetting}
								settingList={[{ name: "Good Fit and above" }, { name: "Only Strong Fit" }, { name: "No Automatic Promotion" }]}
								placeholder="Choose screening criteria"
							/>
						</div>

						{/* Divider */}
						<div style={{ height: 1, background: "#E9EAEB", width: "100%" }} />

						{/* Require Video on Interview */}
						<div>
							<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
								<h3 className="font-medium text-[#181D27]" style={{ fontWeight: 600, marginBottom: 0 }}>Require Video on Interview</h3>
							</div>
							<p className="text-sm text-[#666666] mb-3" style={{ lineHeight: 1.5 }}>
								Require candidates to keep their camera on. Recordings will appear on their analysis page.
							</p>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
								<div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#181D27" }}>
									<i className="la la-video" aria-hidden="true" style={{ fontSize: 16, color: "#667085" }}></i>
									<span>Require Video Interview</span>
								</div>
								{/* Toggle defaults to Yes when undefined; calls back when parent wired */}
								<div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
									<label className="switch" style={{ margin: 0 }}>
										<input
											type="checkbox"
											checked={requireVideo ?? true}
											onChange={(e) => onChangeRequireVideo?.(e.target.checked)}
										/>
										<span className="slider round"></span>
									</label>
									<span style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>{(requireVideo ?? true) ? "Yes" : "No"}</span>
								</div>
							</div>
						</div>

						{/* Divider */}
						<div style={{ height: 1, background: "#E9EAEB", width: "100%" }} />

										{/* AI Interview Secret Prompt (optional, now editable) */}
										<div>
											<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
												<h3 className="font-medium text-[#181D27]" style={{ fontWeight: 600, marginBottom: 0 }}>
													<span style={{ marginRight: 4 }}>
														<img
															className="m-1"
															src="/career_form_svg/star.svg"
															width={20}
															height={20}
															alt="sparkle icon"
															aria-hidden="true"
														/>
													</span>
													AI Interview Secret Prompt <span className="text-[#667085]" style={{ fontWeight: 400 }}>(optional)</span>
												</h3>
												<i
													className="la la-question-circle"
													style={{ fontSize: 16, color: "#667085", cursor: "default" }}
													title="Secret Prompts help refine Jia's evaluation against role-specific nuances."
												></i>
											</div>
											<p className="text-sm text-[#666666] mb-3" style={{ lineHeight: 1.5 }}>
												Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate
												assessment of requirements from the job description.
											</p>
											<textarea
												value={secretPrompt ?? ""}
												onChange={(e) => onChangeSecretPrompt?.(e.target.value)}
												placeholder="Enter a secret prompt (e.g. Give higher scores to answers demonstrating structured problem-solving before proposing solutions.)"
												style={{
													width: "100%",
													minHeight: 140,
													resize: "vertical",
													padding: 14,
													borderRadius: 12,
													border: "1px solid #D5D7DA",
													background: "#FFFFFF",
													fontSize: 14,
													color: "#181D27",
													lineHeight: 1.5,
												}}
											/>
										</div>
					</div>
				</div>

				{/* 2. AI Interview Questions */}
				<div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2">
					<div
						className="flex w-full flex-nowrap items-center justify-between gap-3 px-4 py-3"
						style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", gap: 12 }}
					>
						<h2
                            className="text-lg font-semibold text-[#181D27] m-0 leading-none flex items-center flex-1 min-w-0"
                            style={{ lineHeight: 1, margin: 0, display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                2. AI Interview Questions
                                <span className="text-[#667085] font-normal" style={{ fontWeight: 400 }}> (optional)</span>
                            </span>
                            <span
                                className="inline-block align-middle ml-2"
                                style={{
                                    fontSize: 12,
                                    lineHeight: '18px',
                                    padding: '1px 7px',
                                    borderRadius: 999,
                                    border: '1px solid #D5D7DA',
                                    background: '#FFFFFF',
                                    color: '#181D27',
                                    fontWeight: 500,
                                    
                                }}
                                aria-label="AI interview questions count"
                            >
								{totalQuestions}
                            </span>
                        </h2>

						<button
							type="button"
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								padding: "10px 14px",
								borderRadius: 999,
								border: "1px solid #181D27",
								background: "#181D27",
								color: "#FFFFFF",
								cursor: loadingAll ? "wait" : "pointer",
								fontSize: 14,
								fontWeight: 500,
								lineHeight: 1.1,
							}}
							aria-label="Generate all questions"
							onClick={() => {
								if (loadingAll || loadingIdx !== null) return;
								const anyHidden = categories.some((c) => !c.showAskCount);
								if (anyHidden) {
									revealAllAskCount();
									return;
								}
								generateAll();
							}}
						>
							<img
                                className="m-1 invert"
                                src="/career_form_svg/star_white.svg"
                                width={13}
                                height={13}
                                alt="light bulb icon"
                                aria-hidden="true"
                            />
							{loadingAll ? "Generating..." : categories.every((c) => c.showAskCount) ? "Generate now" : "Generate all questions"}
						</button>
					</div>
					{showMinError && (
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 16px 8px 16px', color: '#B42318', fontSize: 13 }}>
							<i className="la la-exclamation-triangle" aria-hidden="true" style={{ fontSize: 16 }}></i>
							<span>Please add at least {MIN_TOTAL_QUESTIONS} interview questions.</span>
						</div>
					)}
					<div className="layered-card-middle bg-white p-4 mb-2" style={{ gap: 12 }}>
						{categories.map((cat, idx) => (
							<div key={cat.label}>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "flex-start",
										gap: 10,
										padding: "10px 12px",
										borderRadius: 5,
									}}
								    >
									<p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#181D27" }}>{cat.label}</p>
									{cat.questions.length > 0 && (
										<div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
											{cat.questions.map((q, qIdx) => (
												<div key={`${cat.label}-${qIdx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E9EAEB', background: '#FFFFFF', borderRadius: 12, padding: '10px 12px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
														<div title="Drag to reorder" style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #E2E4E8', background: '#FFFFFF', color: '#667085' }}>
															<i className="la la-ellipsis-v" aria-hidden="true"></i>
														</div>
														<input
															type="text"
															value={q.text}
															readOnly={!q.editing}
															onChange={(e) => updateQuestionText(idx, qIdx, e.target.value)}
															style={{ flex: 1, border: 'none', outline: 'none', color: '#181D27', fontSize: 14, background: 'transparent' }}
														/>
													</div>
													<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
														{q.editing ? (
															<button type="button" onClick={() => saveQuestion(idx, qIdx)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, border: '1px solid #181D27', background: '#181D27', color: '#FFFFFF', fontSize: 13 }}>
																<i className="la la-save" aria-hidden="true"></i>
																Save
															</button>
														) : (
															<button type="button" onClick={() => setEditing(idx, qIdx, true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, border: '1px solid #E9EAEB', background: '#FFFFFF', color: '#181D27', fontSize: 13 }}>
																<i className="la la-pencil" aria-hidden="true"></i>
																Edit
															</button>
														)}
														<button type="button" title="Delete" onClick={() => deleteQuestion(idx, qIdx)} style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '1px solid #FEE4E2', background: '#FFF7F7', color: '#EF4444' }}>
															<i className="la la-trash" aria-hidden="true"></i>
														</button>
													</div>
												</div>
											))}
										</div>
									)}
                                    <div style={{ width: '100%', display: "flex", alignItems: "center", justifyContent: 'space-between', gap: 12 }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
											<button
											type="button"
											style={{
												display: "inline-flex",
												alignItems: "center",
												gap: 6,
												padding: "8px 12px",
												borderRadius: 30,
												border: "1px solid #181D27",
												background: "#181D27",
												color: "#FFFFFF",
												fontSize: 13,
													cursor: loadingIdx === idx || loadingAll ? "wait" : "pointer",
											}}
												onClick={() => {
													if (loadingIdx !== null || loadingAll) return;
													if (!cat.showAskCount) {
														revealAskCount(idx);
														return;
													}
													generateForIndex(idx);
												}}
										    >
											<img
                                                className="m-1 invert"
                                                src="/career_form_svg/star_white.svg"
                                                width={13}
                                                height={13}
                                                alt="light bulb icon"
                                                aria-hidden="true"
                                            />
											{loadingIdx === idx ? "Generating..." : cat.showAskCount ? "Generate now" : "Generate questions"}
                                            </button>
                                            <button
                                                type="button"
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    padding: "8px 12px",
                                                    borderRadius: 30,
                                                    border: "1px solid #D5D7DA",
                                                    background: "#F9FAFB",
                                                    color: "#181D27",
                                                    fontSize: 13,
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => addManualQuestion(idx)}
                                            >
                                                <i className="la la-plus" aria-hidden="true"></i>
                                                Manually add
                                            </button>
								        </div>
										{cat.showAskCount && (
											<div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
												<span style={{ color: '#667085', fontSize: 12 }}># of questions to ask</span>
												<input
													type="text"
													min={0}
													max={20}
													value={cat.askCount}
													onChange={(e) => updateAskCount(idx, parseInt(e.target.value || "0", 10))}
													style={{ width: 40, padding: '10px 8px', borderRadius: 10, border: '1px solid #D5D7DA', background: '#FFFFFF', color: '#181D27', fontSize: 13, textAlign: 'center' }}
												/>
											</div>
										)}
									</div>
								</div>
								{/* Divider under each category except last */}
								{idx < categories.length - 1 && (
										<div style={{ height: 1, background: "#E9EAEB", width: "100%", margin: "14px 0" }} />
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* RIGHT COLUMN (Tips) */}
			<div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 16 }}>
				<div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2" style={{ maxWidth: 340 }}>
					<h3 className="text-lg font-semibold text-[#181D27] m-3">
						<img
                            className="m-1"
                            src="/career_form_svg/light_bulb.svg"
                            width={20}
                            height={20}
                            alt="light bulb icon"
                            aria-hidden="true"
                        />
						Tips
					</h3>
					<div className="layered-card-middle bg-white p-4 mb-2">
						<ul style={{ paddingLeft: 0, marginTop: 8, color: "#414651", fontSize: 14, listStyle: "none" }}>
							<li>
								<strong>Add a Secret Prompt</strong> to fine-tune how Jia scores and evaluates the interview responses.
							</li>
							<li style={{ marginTop: 10 }}>
								Use <strong>"Generate Questions"</strong> to quickly create tailored interview questions, then refine or mix
								them with your own for balanced results.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
});

export default Step3AI_Interview;

