"use client";

// Static UI for Step 3: AI Interview Setup
// Mirrors the visual style used in Step 2 (cards, headers, pills, dividers)
// No functionality is wired yet — purely presentational per request.

export default function Step3AI_Interview() {
	const categories: string[] = [
		"CV Validation / Experience",
		"Technical",
		"Behavioral",
		"Analytical",
		"Others",
	];

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
							<button
								type="button"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									border: "1px solid #E9EAEB",
									padding: "10px 12px",
									borderRadius: 9,
									background: "#FFFFFF",
									color: "#181D27",
									fontSize: 13,
									minWidth: 220,
									justifyContent: "space-between",
								}}
								aria-label="AI interview screening selection"
							>
								<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
									<i className="la la-check-circle" style={{ fontSize: 14, color: "#667085" }} aria-hidden="true"></i>
									Good Fit and above
								</span>
								<i className="la la-angle-down" style={{ fontSize: 14, color: "#667085" }}></i>
							</button>
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
								{/* Static ON toggle with Yes label */}
								<div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
									<div
										aria-hidden
										style={{
											width: 44,
											height: 24,
											background: "#EE5D50",
											borderRadius: 999,
											position: "relative",
											boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
										}}
									>
										<span
											style={{
												position: "absolute",
												left: 22,
												top: 2,
												width: 20,
												height: 20,
												background: "#FFFFFF",
												borderRadius: 999,
												boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
											}}
										/>
									</div>
									<span className="text-sm" style={{ color: "#667085" }}>Yes</span>
								</div>
							</div>
						</div>

						{/* Divider */}
						<div style={{ height: 1, background: "#E9EAEB", width: "100%" }} />

						{/* AI Interview Secret Prompt (optional) */}
						<div>
							<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
								<h3 className="font-medium text-[#181D27]" style={{ fontWeight: 600, marginBottom: 0 }}>
									<span style={{ marginRight: 4 }}>
										<i className="la la-magic" aria-hidden="true" style={{ color: "#EE5D50" }}></i>
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
							<div
								style={{
									border: "1px solid #D5D7DA",
									borderRadius: 12,
									background: "#FFFFFF",
									padding: 16,
									fontSize: 14,
									color: "#181D27",
									minHeight: 140,
								}}
							>
								<p className="text-md font-light text-gray-500" style={{ margin: 0 }}>
									Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally.
									Focus on clarity, coherence, and confidence rather than language preference or accent.)
								</p>
							</div>
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
							<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
								2. AI Interview Questions <i className="la la-info-circle" style={{ marginLeft: 6, color: "#667085", fontSize: 14 }}></i>
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
								cursor: "default",
								fontSize: 14,
								fontWeight: 500,
								lineHeight: 1.1,
							}}
							aria-label="Generate all questions"
						>
							<i className="la la-magic" aria-hidden="true"></i>
							Generate all questions
						</button>
					</div>
					<div className="layered-card-middle bg-white p-4 mb-2" style={{ gap: 12 }}>
						{categories.map((label, idx) => (
							<div key={label}>
								<div
									className="layered-card-outer--solid"
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 12,
										background: "#F6F7F9",
										padding: "10px 12px",
										borderRadius: 5,
									}}
								>
									<p style={{ padding: 6, margin: 0, fontSize: 14, fontWeight: 600, color: "#181D27" }}>{label}</p>
									<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
												cursor: "default",
											}}
										>
											<i className="la la-magic" aria-hidden="true"></i>
											Generate questions
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
												cursor: "default",
											}}
										>
											<i className="la la-plus" aria-hidden="true"></i>
											Manually add
										</button>
									</div>
								</div>
								{/* Divider under each category except last */}
								{idx < categories.length - 1 && (
									<div style={{ height: 1, background: "#E9EAEB", width: "100%", margin: "12px 0" }} />
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
						<i className="la la-lightbulb-o" style={{ marginRight: 6 }} aria-hidden="true"></i>
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
}

