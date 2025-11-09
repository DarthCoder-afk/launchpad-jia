"use client";

// Step 4 – Pipeline Stages (Optional)
// Purely presentational to mirror the provided mock. No persistence or drag/drop for now.

export default function Step4Pipeline() {
	const stages: Array<{
		title: string;
		icon?: string; // optional leading icon class
		subStages: string[];
	}> = [
		{
			title: "CV Screening",
			icon: "la la-file-alt",
			subStages: ["Waiting Submission", "For Review"],
		},
		{
			title: "AI Interview",
			icon: "la la-microphone",
			subStages: ["Waiting Interview", "For Review"],
		},
		{
			title: "Final Human Interview",
			icon: "la la-users",
			subStages: ["Waiting Schedule", "Waiting Interview", "For Review"],
		},
		{
			title: "Job Offer",
			icon: "la la-briefcase",
			subStages: ["For Final Review", "Waiting Offer Acceptance", "For Contract Signing", "Hired"],
		},
	];

	const StageCard = ({ title, icon, subStages }: { title: string; icon?: string; subStages: string[] }) => (
		<div
			className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB]"
			style={{ background: "#FCFCFD" }}
		>
			<div
				className="rounded-2xl"
				style={{ padding: 12, border: "1px dashed #E9EAEB", margin: 12, background: "#FFFFFF" }}
			>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
					<span style={{ color: "#667085", fontSize: 12 }}>
						<i className="la la-lock" aria-hidden="true" /> Core stage, cannot move
					</span>
					<i className="la la-lock" style={{ color: "#98A2B3" }} aria-hidden="true" />
				</div>

				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
						{icon && <i className={icon} aria-hidden="true" style={{ color: "#667085" }} />}
						<h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#101828" }}>{title}</h4>
						<i
							className="la la-question-circle"
							aria-hidden="true"
							title="This is a core stage in the hiring pipeline."
							style={{ color: "#98A2B3", fontSize: 16 }}
						/>
					</div>
					<i className="la la-ellipsis-v" aria-hidden="true" style={{ color: "#98A2B3" }} />
				</div>

				<div style={{ marginTop: 12 }}>
					<div style={{ color: "#667085", fontSize: 12, marginBottom: 8 }}>Substages</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{subStages.map((s, i) => (
							<button
								key={`${title}-${s}-${i}`}
								type="button"
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									width: "100%",
									padding: "10px 12px",
									borderRadius: 12,
									border: "1px solid #E9EAEB",
									background: "#FFFFFF",
									color: "#101828",
									fontSize: 13,
									cursor: "default",
								}}
							>
								<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{s}</span>
								<span
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
								>
									<i className="la la-bolt" aria-hidden="true" />
								</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);

	const Toolbar = () => (
		<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
			<button
				type="button"
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: 8,
					padding: "8px 12px",
					borderRadius: 999,
					border: "1px solid #D5D7DA",
					background: "#FFFFFF",
					color: "#101828",
					fontSize: 13,
				}}
			>
				<i className="la la-undo" aria-hidden="true" />
				Restore to default
			</button>
			<button
				type="button"
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: 8,
					padding: "8px 12px",
					borderRadius: 999,
					border: "1px solid #D5D7DA",
					background: "#FFFFFF",
					color: "#101828",
					fontSize: 13,
				}}
			>
				<i className="la la-copy" aria-hidden="true" />
				Copy pipeline from existing job
				<i className="la la-angle-down" aria-hidden="true" />
			</button>
		</div>
	);

	return (
		<div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 8 }}>
			<div style={{ width: "100%", maxWidth: 1500 }}>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px 0" }}>
					<div>
						<h2 style={{ margin: 0, fontSize: 20, fontWeight: 650, color: "#111827" }}>Customize pipeline stages</h2>
						<p style={{ margin: 0, marginTop: 6, color: "#667085", fontSize: 14 }}>
							Create, modify, reorder, and delete stages and sub-stages. Core stages are fixed and can’t be moved
							or edited as they are essential to Jia’s system logic.
						</p>
					</div>
					<Toolbar />
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 20px 1fr 20px 1fr 20px 1fr",
						gap: 12,
						alignItems: "stretch",
					}}
				>
					<StageCard {...stages[0]} />
					{/* Divider with plus (between columns) */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
						<div style={{ width: 1, height: "100%", background: "#E9EAEB", position: "relative" }}>
							<div
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									width: 36,
									height: 36,
									borderRadius: 999,
									background: "#FFFFFF",
									border: "1px solid #E9EAEB",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#98A2B3",
								}}
								title="Add stage (placeholder)"
							>
								<i className="la la-plus" aria-hidden="true" />
							</div>
						</div>
					</div>

					<StageCard {...stages[1]} />

					{/* Second divider with plus */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
						<div style={{ width: 1, height: "100%", background: "#E9EAEB", position: "relative" }}>
							<div
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									width: 36,
									height: 36,
									borderRadius: 999,
									background: "#FFFFFF",
									border: "1px solid #E9EAEB",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#98A2B3",
								}}
								title="Add stage (placeholder)"
							>
								<i className="la la-plus" aria-hidden="true" />
							</div>
						</div>
					</div>

					<StageCard {...stages[2]} />

					{/* Third divider with plus */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
						<div style={{ width: 1, height: "100%", background: "#E9EAEB", position: "relative" }}>
							<div
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									width: 36,
									height: 36,
									borderRadius: 999,
									background: "#FFFFFF",
									border: "1px solid #E9EAEB",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#98A2B3",
								}}
								title="Add stage (placeholder)"
							>
								<i className="la la-plus" aria-hidden="true" />
							</div>
						</div>
					</div>

					<StageCard {...stages[3]} />
				</div>
			</div>
		</div>
	);
}

