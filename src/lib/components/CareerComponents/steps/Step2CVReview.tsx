"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

type DropdownQuestion = {
	id: string;
	key: string;
	title: string;
	type: "dropdown";
	options: Array<{ id: string; label: string }>;
};

type RangeQuestion = {
	id: string;
	key: string;
	title: string;
	type: "range";
	min?: string;
	max?: string;
	currency?: string;
};

export type PreScreeningQuestion = DropdownQuestion | RangeQuestion;

export interface Step2CVReviewProps {
	screeningSetting?: string; // e.g. "Good Fit and above"
	onChangeScreeningSetting?: (val: string) => void;
	secretPrompt?: string; // raw prompt text
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
	preScreeningQuestions,
	setPreScreeningQuestions,
	suggestedQuestions = defaultSuggested,
}: Step2CVReviewProps) {
	const isAdded = (key: string) => preScreeningQuestions.some((q) => q.key === key);

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

	const removeQuestion = (id: string) => {
		setPreScreeningQuestions((prev) => prev.filter((q) => q.id !== id));
	};

	const addOption = (qid: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && q.type === "dropdown") {
					return { ...q, options: [...q.options, { id: uid("opt"), label: "" }] };
				}
				return q;
			})
		);
	};

	const removeOption = (qid: string, optId: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && q.type === "dropdown") {
					return { ...q, options: q.options.filter((o) => o.id !== optId) };
				}
				return q;
			})
		);
	};

	const updateOptionLabel = (qid: string, optId: string, label: string) => {
		setPreScreeningQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qid && q.type === "dropdown") {
					return {
						...q,
						options: q.options.map((o) => (o.id === optId ? { ...o, label } : o)),
					};
				}
				return q;
			})
		);
	};

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
									<span style={{ marginRight: 4 }}>✨</span> CV Secret Prompt <span className="text-[#667085]" style={{ fontWeight: 400 }}>(optional)</span>
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
									<ul style={{ margin: 0, paddingLeft: 18, listStyle: "disc", lineHeight: 1.5 }}>
										<li>Prioritize candidates with strong hands-on experience in Java and object-oriented programming.</li>
										<li>Look for familiarity with frameworks like Spring Boot or Hibernate, and experience building scalable backend systems.</li>
										<li>Give extra weight to candidates who demonstrate knowledge of REST APIs, microservices, and SQL or NoSQL databases.</li>
										<li>Deprioritize resumes that only list Java as a secondary or outdated skill.</li>
									</ul>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* 2. Pre-Screening Questions */}
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
									cursor: "default",
									fontSize: 14,
									fontWeight: 500,
									lineHeight: 1.1,
								}}
                                disabled
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
							<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
								{preScreeningQuestions.map((q, qIdx) => (
									<div key={q.id} className="rounded-xl border border-[#E9EAEB] bg-[#F9FAFB]" style={{ padding: 16 }}>
										<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
											<div style={{ fontSize: 14, fontWeight: 600, color: "#181D27" }}>{q.title}</div>
											<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
												<div
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: 6,
														border: "1px solid #E9EAEB",
														padding: "6px 10px",
														borderRadius: 999,
														background: "#FFFFFF",
														color: "#181D27",
														fontSize: 13,
													}}
													title={q.type === "dropdown" ? "Dropdown" : "Range"}
												>
													<i className="la la-sliders-h" style={{ fontSize: 14 }}></i>
													{q.type === "dropdown" ? "Dropdown" : "Range"}
													<i className="la la-angle-down" style={{ fontSize: 14, color: "#667085" }}></i>
												</div>
												<button
													onClick={() => removeQuestion(q.id)}
													style={{
														border: "1px solid #EE5D50",
														color: "#EE5D50",
														background: "#FFFFFF",
														padding: "8px 12px",
														borderRadius: 999,
														fontSize: 13,
														fontWeight: 500,
													}}
												>
													<i className="la la-trash mr-1"></i> Delete Question
												</button>
											</div>
										</div>

										{/* Body */}
										{q.type === "dropdown" ? (
											<div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
												{q.options.map((opt, idx) => (
													<div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
														<div
															style={{
																width: 30,
																textAlign: "center",
																border: "1px solid #E9EAEB",
																background: "#FFFFFF",
																borderRadius: 8,
																color: "#181D27",
																fontSize: 13,
																padding: "6px 0",
															}}
														>
															{idx + 1}
														</div>
														<input
															value={opt.label}
															onChange={(e) => updateOptionLabel(q.id, opt.id, e.target.value)}
															placeholder={`Option ${idx + 1}`}
															style={{
																flex: 1,
																border: "1px solid #E9EAEB",
																borderRadius: 8,
																padding: "10px 12px",
																background: "#FFFFFF",
																fontSize: 14,
																color: "#181D27",
															}}
														/>
														<button
															onClick={() => removeOption(q.id, opt.id)}
															style={{
																width: 28,
																height: 28,
																display: "inline-flex",
																alignItems: "center",
																justifyContent: "center",
																borderRadius: 999,
																border: "1px solid #E9EAEB",
																background: "#FFFFFF",
																color: "#667085",
															}}
															aria-label="Remove option"
														>
															<i className="la la-times"></i>
														</button>
													</div>
												))}
												<button
													onClick={() => addOption(q.id)}
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: 8,
														padding: 0,
														border: "none",
														background: "transparent",
														color: "#181D27",
														fontWeight: 500,
														fontSize: 14,
														marginTop: 2,
													}}
												>
													<span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Option
												</button>
											</div>
										) : (
											<div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
												<div>
													<div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>Minimum</div>
													<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
														<div style={{ position: "relative", flex: 1 }}>
															<span style={{ position: "absolute", left: 10, top: 10, color: "#667085" }}>₱</span>
															<input
																value={(q as RangeQuestion).min || ""}
																onChange={(e) => updateRange(q.id, "min", e.target.value)}
																placeholder="40,000"
																style={{
																	width: "100%",
																	border: "1px solid #E9EAEB",
																	borderRadius: 8,
																	padding: "10px 12px 10px 24px",
																	background: "#FFFFFF",
																	fontSize: 14,
																}}
															/>
														</div>
														<div
															style={{
																border: "1px solid #E9EAEB",
																borderRadius: 8,
																padding: "8px 10px",
																background: "#FFFFFF",
																color: "#181D27",
																minWidth: 68,
																textAlign: "center",
															}}
															title="Currency"
														>
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
															<input
																value={(q as RangeQuestion).max || ""}
																onChange={(e) => updateRange(q.id, "max", e.target.value)}
																placeholder="60,000"
																style={{
																	width: "100%",
																	border: "1px solid #E9EAEB",
																	borderRadius: 8,
																	padding: "10px 12px 10px 24px",
																	background: "#FFFFFF",
																	fontSize: 14,
																}}
															/>
														</div>
														<div
															style={{
																border: "1px solid #E9EAEB",
																borderRadius: 8,
																padding: "8px 10px",
																background: "#FFFFFF",
																color: "#181D27",
																minWidth: 68,
																textAlign: "center",
															}}
															title="Currency"
														>
															{(q as RangeQuestion).currency || "PHP"}
															<i className="la la-angle-down" style={{ marginLeft: 6, color: "#667085" }}></i>
														</div>
													</div>
												</div>
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
					<h3 className="text-lg font-semibold text-[#181D27] m-3">💡 Tips</h3>
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

