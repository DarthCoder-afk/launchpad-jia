"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

export interface Step2CVReviewProps {
	screeningSetting?: string; // e.g. "Good Fit and above"
	onChangeScreeningSetting?: (val: string) => void;
	secretPrompt?: string; // raw prompt text
	preScreeningQuestions?: Array<{ id: string; label: string }>; // future custom questions
	suggestedQuestions?: Array<{ key: string; title: string; description: string }>; // default suggestions
	onAddSuggested?: (key: string) => void; // stub handler (unused for now)
	onAddCustom?: () => void; // stub handler (unused for now)
}

const defaultSuggested = [
	{ key: "noticePeriod", title: "Notice Period", description: "How long is your notice period?" },
	{ key: "workSetup", title: "Work Setup", description: "How often are you willing to report to the office each week?" },
	{ key: "askingSalary", title: "Asking Salary", description: "How much is your expected monthly salary?" },
];

export default function Step2CVReview({
	screeningSetting = "Good Fit and above",
	onChangeScreeningSetting,
	secretPrompt,
	preScreeningQuestions = [],
	suggestedQuestions = defaultSuggested,
}: Step2CVReviewProps) {
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
						

						{/* Current questions list (placeholder) */}
						{preScreeningQuestions.length === 0 && (
							<div style={{ fontSize: 14, color: '#414651', paddingTop: 4, paddingBottom: 12 }}>
								No pre-screening questions added yet.
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
										<button
											style={{
												padding: "6px 14px",
												borderRadius: 30,
												border: "1px solid #D5D7DA",
												background: "#F9FAFB",
												fontSize: 13,
												fontWeight: 500,
												color: "#181D27",
												cursor: "default",
											}}
											disabled
										>
											Add
										</button>
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

