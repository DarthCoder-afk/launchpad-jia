"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import { useState } from "react";

type DropdownQuestion = {
	id: string;
	key: string;
	title: string;
	type: "dropdown";
	options: Array<{ id: string; label: string }>;
};

// Numeric salary/compensation range with currency
type RangeQuestion = {
	id: string;
	key: string;
	title: string;
	type: "range";
	min?: string;
	max?: string;
	currency?: string;
};

// Free‑form one‑line response
type ShortAnswerQuestion = {
	id: string;
	key: string;
	title: string;
	type: "short";
};

// Free‑form multi‑line response
type LongAnswerQuestion = {
	id: string;
	key: string;
	title: string;
	type: "long";
};

// Multiple selection via checkboxes
type CheckboxesQuestion = {
	id: string;
	key: string;
	title: string;
	type: "checkboxes";
	options: Array<{ id: string; label: string }>;
};

export type PreScreeningQuestion = DropdownQuestion | RangeQuestion | ShortAnswerQuestion | LongAnswerQuestion | CheckboxesQuestion;

export interface Step2CVReviewProps {
	screeningSetting?: string; // e.g. "Good Fit and above"
	onChangeScreeningSetting?: (val: string) => void;
	secretPrompt?: string; // raw prompt text
	onChangeSecretPrompt?: (val: string) => void;
	preScreeningQuestions: PreScreeningQuestion[];
	setPreScreeningQuestions: (updater: PreScreeningQuestion[] | ((prev: PreScreeningQuestion[]) => PreScreeningQuestion[])) => void;
	suggestedQuestions?: Array<{ key: string; title: string; description: string }>; // default suggestions
	onAddSuggested?: (key: string) => void; // optional external hook
	onAddCustom?: () => void; // stub handler (optional)
}

const defaultSuggested = [
	{ key: "noticePeriod", title: "Notice Period", description: "How long is your notice period?" },
	{ key: "workSetup", title: "Work Setup", description: "How often are you willing to report to the office each week?" },
	{ key: "askingSalary", title: "Asking Salary", description: "How much is your expected monthly salary?" },
];

function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
}

export default function Step2CVReview({
	screeningSetting = "Good Fit and above",
	onChangeScreeningSetting,
	secretPrompt,
	onChangeSecretPrompt,
	preScreeningQuestions,
	setPreScreeningQuestions,
	suggestedQuestions = defaultSuggested,
}: Step2CVReviewProps) {
	const [typeMenuOpenFor, setTypeMenuOpenFor] = useState<string | null>(null);
	const isAdded = (key: string) => preScreeningQuestions.some((q) => q.key === key);

	// Insert one of the canned question templates from the Suggested list
	const addSuggestedQuestion = (key: string) => {
		if (isAdded(key)) return;
		const map: Record<string, PreScreeningQuestion> = {
			noticePeriod: {
				id: uid("q"),
				key: "noticePeriod",
				title: "How long is your notice period?",
				type: "dropdown",
				options: [
					{ id: uid("opt"), label: "Immediately" },
					{ id: uid("opt"), label: "< 30 days" },
					{ id: uid("opt"), label: "> 30 days" },
				],
			},
			workSetup: {
				id: uid("q"),
				key: "workSetup",
				title: "How often are you willing to report to the office?",
				type: "dropdown",
				options: [
					{ id: uid("opt"), label: "At most 1-2x a week" },
					{ id: uid("opt"), label: "At most 3-4x a week" },
					{ id: uid("opt"), label: "Open to fully onsite work" },
					{ id: uid("opt"), label: "Only open to fully remote work" },
				],
			},
			askingSalary: {
				id: uid("q"),
				key: "askingSalary",
				title: "How much is your expected monthly salary?",
				type: "range",
				min: "",
				max: "",
				currency: "PHP",
			},
		};
		const toAdd = map[key];
		if (toAdd) {
			setPreScreeningQuestions((prev) => [...prev, toAdd]);
		}
	};

	// Remove a question from the builder
	const removeQuestion = (id: string) => {
		setPreScreeningQuestions((prev) => prev.filter((q) => q.id !== id));
	};

	// Update a question title inline
	const updateQuestionTitle = (qid: string, title: string) => {
		setPreScreeningQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, title } : q)));
	};

	// Add a new blank custom question (defaults to dropdown with one option)
	const addCustomQuestion = () => {
		const newQ: DropdownQuestion = {
			id: uid("q"),
			key: uid("custom"),
			title: "",
			type: "dropdown",
			options: [{ id: uid("opt"), label: "Option 1" }],
		};
		setPreScreeningQuestions((prev) => [...prev, newQ]);
	};

	// Option helpers for dropdown/checkboxes
	const addOption = (qid: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && (q.type === "dropdown" || q.type === "checkboxes")) {
					return { ...q, options: [...q.options, { id: uid("opt"), label: "" }] };
				}
				return q;
			})
		);
	};

	const removeOption = (qid: string, optId: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && (q.type === "dropdown" || q.type === "checkboxes")) {
					return { ...q, options: q.options.filter((o) => o.id !== optId) };
				}
				return q;
			})
		);
	};

	const updateOptionLabel = (qid: string, optId: string, label: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && (q.type === "dropdown" || q.type === "checkboxes")) {
					return {
						...q,
						options: q.options.map((o) => (o.id === optId ? { ...o, label } : o)),
					};
				}
				return q;
			})
		);
	};

	// Update range min/max/currency for range‑type questions
	const updateRange = (qid: string, field: "min" | "max" | "currency", value: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && q.type === "range") {
					return { ...q, [field]: value } as RangeQuestion;
				}
				return q;
			})
		);
	};

	// Convert a question to a different type while preserving id/key/title
	const changeQuestionType = (qid: string, next: PreScreeningQuestion["type"]) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id !== qid) return q;
				const base = { id: q.id, key: q.key, title: q.title } as const;
				switch (next) {
					case "short":
						return { ...base, type: "short" } as ShortAnswerQuestion;
					case "long":
						return { ...base, type: "long" } as LongAnswerQuestion;
					case "dropdown":
						return { ...base, type: "dropdown", options: [{ id: uid("opt"), label: "Option 1" }] } as DropdownQuestion;
					case "checkboxes":
						return { ...base, type: "checkboxes", options: [{ id: uid("opt"), label: "Option 1" }] } as CheckboxesQuestion;
					case "range":
						return { ...base, type: "range", min: "", max: "", currency: "PHP" } as RangeQuestion;
					default:
						return q;
				}
			})
		);
		setTypeMenuOpenFor(null);
	};

		// Map question type to an icon class (Line Awesome) and optional color
		const typeIconClass = (t: PreScreeningQuestion["type"]) => {
			switch (t) {
				case "short":
					return { cls: "las la-user", color: "#667085" }; // text lines icon
				case "long":
					return { cls: "las la-align-left", color: "#667085" }; // paragraph icon
				case "dropdown":
					return { cls: "las la-user", color: "#667085" }; // list icon
				case "checkboxes":
					return { cls: "las la-user", color: "#667085" }; // checkbox icon
				case "range":
					return { cls: "la la-sort-numeric-up", color: "#667085" }; // numeric range icon
				default:
					return { cls: "la la-question-circle", color: "#667085" }; // fallback
			}
		};
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
				{/* 1. CV Review Settings */}
				<div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2">
					<h2 className="text-lg font-semibold text-[#181D27] m-3">1. CV Review Settings</h2>
					<div className="layered-card-middle bg-white p-4 mb-2" style={{ gap: 24 }}>
						{/* CV Screening */}
						<div>
							<h3 className="font-medium text-[#181D27] mb-2" style={{ fontWeight: 600 }}>CV Screening</h3>
							<p className="text-sm text-[#666666] mb-3">
								Jia automatically endorses candidates who meet the chosen criteria.
							</p>
							<CustomDropdown
								onSelectSetting={onChangeScreeningSetting}
								screeningSetting={screeningSetting}
								settingList={[{ name: "Good Fit and above" }, { name: "Only Strong Fit" }, { name: "No Automatic Promotion" }]}
								placeholder="Choose screening criteria"
							/>
							
						</div>

						{/* Secret Prompt (optional) */}
						<div>
							<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
								<h3 className="font-medium text-[#181D27]" style={{ fontWeight: 600, marginBottom: 0 }}>
									<span style={{ marginRight: 4 }}>
                                         <img
                                            src="/career_form_svg/star.svg"
                                            width={16}
                                            height={16}
                                            alt="gradient star icon"
                                            aria-hidden="true"
                                        />
                                    </span> CV Secret Prompt <span className="text-[#667085]" style={{ fontWeight: 400 }}>(optional)</span>
								</h3>
								<i
									className="la la-question-circle"
									style={{ fontSize: 16, color: "#667085", cursor: "pointer" }}
									title="Secret Prompts help refine Jia's evaluation against role-specific nuances."
								></i>
							</div>
							<p className="text-sm text-[#666666] mb-3" style={{ lineHeight: 1.5 }}>
								Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate
								assessment of requirements from the job description.
							</p>
							{onChangeSecretPrompt ? (
								<textarea
									value={secretPrompt || ""}
									onChange={(e) => onChangeSecretPrompt?.(e.target.value)}
									placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
									style={{
										width: "100%",
										border: "1px solid #D5D7DA",
										borderRadius: 12,
										background: "#FFFFFF",
										padding: 16,
										fontSize: 14,
										color: "#181D27",
										minHeight: 140,
										maxHeight: 220,
										resize: "vertical",
									}}
								/>
							) : (
								<div
									style={{
										border: "1px solid #D5D7DA",
										borderRadius: 12,
										background: "#FFFFFF",
										padding: 16,
										fontSize: 14,
										color: "#181D27",
										minHeight: 140,
										maxHeight: 220,
										overflowY: "auto",
									}}
								>
									{secretPrompt ? (
										<pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.5 }}>{secretPrompt}</pre>
									) : (
										<p className="text-md font-light text-gray-500">
											Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* 2. Pre-Screening Questions */}
				<div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2 mb-5">
					<div
						className="flex w-full flex-nowrap items-center justify-between gap-3 px-4 py-3"
						style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", gap: 12 }}
					>
							<h2
								className="text-lg font-semibold text-[#181D27] m-0 leading-none flex items-center flex-1 min-w-0"
								style={{ lineHeight: 1, margin: 0, display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}
							>
								<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									2. Pre-Screening Questions
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
									aria-label="Pre-screening questions count"
								>
									{preScreeningQuestions.length}
								</span>
							</h2>
                        
							<button
								onClick={addCustomQuestion}
								style={{
									display: "inline-flex",
									alignItems: "center",
									flexShrink: 0,
									gap: 8,
									padding: "12px 14px",
									borderRadius: 999,
									border: "1px solid #D5D7DA",
									background: "#181D27",
									color: "#FFFFFF",
									cursor: "pointer",
									fontSize: 14,
									fontWeight: 500,
									lineHeight: 1.1,
								}}
							>
							<span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add custom
							</button>
                        
                    </div>
					<div className="layered-card-middle bg-white p-4 mb-2" style={{ gap: 20 }}>
						

						{/* Current questions list */}
						{preScreeningQuestions.length === 0 ? (
							<div style={{ fontSize: 14, color: '#414651', paddingTop: 4, paddingBottom: 12 }}>
								No pre-screening questions added yet.
							</div>
						) : (
							<div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
									{preScreeningQuestions.map((q) => (
										<div key={q.id} className="border border-[#E9EAEB] bg-[#F9FAFB]" style={{ borderRadius:12 }}>
											{/* Header row */}
											<div
												className="layered-card-outer--solid"
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													gap: 12,
													marginBottom: 8,
                                                    marginTop: 0,
													background: "#F6F7F9",
													padding: "10px 12px",
													borderRadius: 5,
												}}
											>
												{/* Inline editable title input to match UX: input on the left, type selector on the right */}
												<input
													value={q.title}
													onChange={(e) => updateQuestionTitle(q.id, e.target.value)}
													placeholder="Write your question..."
													style={{
														flex: 1,
														margin: 0,
														border: '1px solid #E9EAEB',
														background: '#FFFFFF',
														color: '#181D27',
														fontSize: 14,
														borderRadius: 8,
														padding: '10px 12px',
													}}
												/>
												<div style={{ position: "relative" }}>
													<button
														onClick={() => setTypeMenuOpenFor((cur) => (cur === q.id ? null : q.id))}
														style={{
															display: "inline-flex",
															alignItems: "center",
															gap: 8,
															border: "1px solid #E9EAEB",
															padding: "10px 12px",
															borderRadius: 9,
															background: "#FFFFFF",
															color: "#181D27",
															fontSize: 13,
															minWidth: 200,
															justifyContent: "space-between",
														}}
													>
														<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
															<i
																className={typeIconClass(q.type).cls}
																style={{ fontSize: 14, color: typeIconClass(q.type).color }}
																aria-hidden="true"
															></i>
															{q.type === "short"
																? "Short Answer"
																: q.type === "long"
																? "Long Answer"
																: q.type === "dropdown"
																? "Dropdown"
																: q.type === "checkboxes"
																? "Checkboxes"
																: "Range"}
														</span>
														<i className="la la-angle-down" style={{ fontSize: 14, color: "#667085" }}></i>
													</button>
													{typeMenuOpenFor === q.id && (
														<div style={{ position: "absolute", top: "110%", right: 0, background: "#FFFFFF", border: "1px solid #E9EAEB", borderRadius: 12, boxShadow: "0 8px 20px rgba(16,24,40,0.1)", width: 220, zIndex: 50 }}>
															{[
																{ key: "short", label: "Short Answer" },
																{ key: "long", label: "Long Answer" },
																{ key: "dropdown", label: "Dropdown" },
																{ key: "checkboxes", label: "Checkboxes" },
																{ key: "range", label: "Range" },
															].map((item) => (
																<div
																	key={item.key}
																	onClick={() => changeQuestionType(q.id, item.key as PreScreeningQuestion["type"])}
																	style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", fontSize: 14, gap: 10 }}
																>
																	<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
																		<i className={typeIconClass(item.key as PreScreeningQuestion["type"]).cls} style={{ fontSize: 14, color: typeIconClass(item.key as PreScreeningQuestion["type"]).color }} aria-hidden="true"></i>
																		{item.label}
																	</span>
																	{q.type === item.key && <i className="la la-check" style={{ color: '#181D27' }}></i>}
																</div>
															))}
														</div>
													)}
												</div>
												
											</div>

											{/* Body */}
											{(q.type === "dropdown" || q.type === "checkboxes") && (
												<div style={{ padding: 20, marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
													{(q as DropdownQuestion | CheckboxesQuestion).options.map((opt, idx) => (
														<div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
															{/* Shell to match rounded pill with internal divider */}
															<div style={{ display: "flex", alignItems: "center", flex: 1, border: "1px solid #E9EAEB", background: "#FFFFFF", borderRadius: 12, overflow: "hidden" }}>
																<div style={{ minWidth: 44, textAlign: "center", color: "#181D27", fontSize: 13, padding: "10px 0", borderRight: "1px solid #E9EAEB" }}>{idx + 1}</div>
																<input
																	value={opt.label}
																	onChange={(e) => updateOptionLabel(q.id, opt.id, e.target.value)}
																	placeholder={`Option ${idx + 1}`}
																	style={{ flex: 1, border: "none", outline: "none", padding: "10px 12px", background: "transparent", fontSize: 14, color: "#181D27" }}
																/>
															</div>
															<button onClick={() => removeOption(q.id, opt.id)} style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: "1px solid #E9EAEB", background: "#FFFFFF", color: "#667085" }} aria-label="Remove option">
																<i className="la la-times"></i>
															</button>
														</div>
													))}
													<button onClick={() => addOption(q.id)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: 0, border: "none", background: "transparent", color: "#181D27", fontWeight: 500, fontSize: 14, marginTop: 2, cursor: "pointer", outline: "none" }}>
														<span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Option
													</button>

                                                    {/* Separator */}
						                            <div style={{ height: 1, background: '#E9EAEB', width: '100%', marginBottom: 16 }} />

													<div style={{ display: "flex", justifyContent: "flex-end" }}>
														<button
															onClick={() => removeQuestion(q.id)}
															style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "2px solid #EE5D50", color: "#EE5D50", background: "#FFFFFF", padding: "10px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
															aria-label="Delete question"
														>
															<i className="la la-trash text-xl" aria-hidden="true"></i>
															<span className="text-bold text-md">Delete Question</span>
														</button>
													</div>
												</div>
											)}
											{q.type === "range" && (
												<div style={{ padding: 20, marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
													<div>
														<div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>Minimum</div>
														<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
															<div style={{ position: "relative", flex: 1 }}>
																<span style={{ position: "absolute", left: 10, top: 10, color: "#667085" }}>₱</span>
																<input value={(q as RangeQuestion).min || ""} onChange={(e) => updateRange(q.id, "min", e.target.value)} placeholder="40,000" style={{ width: "100%", border: "1px solid #E9EAEB", borderRadius: 8, padding: "10px 12px 10px 24px", background: "#FFFFFF", fontSize: 14 }} />
															</div>
															<div style={{ border: "1px solid #E9EAEB", borderRadius: 8, padding: "8px 10px", background: "#FFFFFF", color: "#181D27", minWidth: 68, textAlign: "center" }} title="Currency">
																{(q as RangeQuestion).currency || "PHP"}
																<i className="la la-angle-down" style={{ marginLeft: 6, color: "#667085" }}></i>
															</div>
														</div>
													</div>
													<div>
														<div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>Maximum</div>
														<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
															<div style={{ position: "relative", flex: 1 }}>
																<span style={{ position: "absolute", left: 10, top: 10, color: "#667085" }}>₱</span>
																<input value={(q as RangeQuestion).max || ""} onChange={(e) => updateRange(q.id, "max", e.target.value)} placeholder="60,000" style={{ width: "100%", border: "1px solid #E9EAEB", borderRadius: 8, padding: "10px 12px 10px 24px", background: "#FFFFFF", fontSize: 14 }} />
															</div>
															<div style={{ border: "1px solid #E9EAEB", borderRadius: 8, padding: "8px 10px", background: "#FFFFFF", color: "#181D27", minWidth: 68, textAlign: "center" }} title="Currency">
																{(q as RangeQuestion).currency || "PHP"}
																<i className="la la-angle-down" style={{ marginLeft: 6, color: "#667085" }}></i>
															</div>
														</div>
													</div>
                                                     {/* Separator */}
						                            <div style={{ height: 1, background: '#E9EAEB', width: '200%', marginBottom: 16 }} />

													<div style={{ display: "flex", justifyContent: "flex-end" }}>
														<button
															onClick={() => removeQuestion(q.id)}
															style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "2px solid #EE5D50", color: "#EE5D50", background: "#FFFFFF", padding: "10px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 16 }}
															aria-label="Delete question"
														    >
															<i className="la la-trash text-xl" aria-hidden="true"></i>
															<span className="text-bold text-md">Delete Question</span>
														</button>
													</div>
												</div>
											)}
											{q.type === "short" && (
												<div style={{ padding: 20, marginTop: 12 }}>
													<input  placeholder="Short answer" style={{ width: "100%", border: "1px dashed #E9EAEB", borderRadius: 8, padding: "10px 12px", background: "#FFFFFF", fontSize: 14, color: "#667085" }} />
												</div>
											)}
											{q.type === "long" && (
												<div style={{ padding: 20, marginTop: 12 }}>
													<textarea  placeholder="Long answer" rows={3} style={{ width: "100%", border: "1px dashed #E9EAEB", borderRadius: 8, padding: "10px 12px", background: "#FFFFFF", fontSize: 14, color: "#667085", resize: "vertical" }} />
												</div>
											)}
										</div>
									))}
							</div>
						)}
						{/* Separator */}
						<div style={{ height: 1, background: '#E9EAEB', width: '100%', marginBottom: 16 }} />

						{/* Suggested questions */}
						<div style={{ marginTop: 8 }}>
							<h4 style={{ fontSize: 13, fontWeight: 600, color: "#181D27", marginBottom: 12 }}>Suggested Pre-screening Questions:</h4>
							<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
								{suggestedQuestions.map((q) => (
									<div
										key={q.key}
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											border: "1px solid #E9EAEB",
											background: "#FFFFFF",
											padding: "12px 16px",
											borderRadius: 12,
											gap: 16,
										}}
									>
										<div style={{ flex: 1 }}>
											<div style={{ fontSize: 14, fontWeight: 600, color: "#181D27" }}>{q.title}</div>
											<div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>{q.description}</div>
										</div>
										{isAdded(q.key) ? (
											<span
												style={{
													padding: "6px 14px",
													borderRadius: 30,
													border: "1px solid #D5D7DA",
													background: "#F9FAFB",
													fontSize: 13,
													fontWeight: 500,
													color: "#667085",
												}}
											>
												Added
											</span>
										) : (
											<button
												onClick={() => addSuggestedQuestion(q.key)}
												style={{
													padding: "6px 14px",
													borderRadius: 30,
													border: "1px solid #D5D7DA",
													background: "#F9FAFB",
													fontSize: 13,
													fontWeight: 500,
													color: "#181D27",
													cursor: "pointer",
												}}
											>
												Add
											</button>
										)}
									</div>
								))}
							</div>
						</div>
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
                    />Tips</h3>
					<div className="layered-card-middle bg-white p-4 mb-2">
						<ul style={{ paddingLeft: 0, marginTop: 8, color: "#414651", fontSize: 14, listStyle: "none" }}>
							<li><strong>Add a Secret Prompt</strong> to fine-tune how Jia scores and evaluates submitted CVs.</li>
							<li style={{ marginTop: 10 }}><strong>Add Pre-Screening questions</strong> to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions.</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

