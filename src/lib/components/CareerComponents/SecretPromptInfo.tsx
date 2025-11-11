"use-client";

import { useState, useEffect, useRef } from "react";

export default function SecretPromptInfo(){
    const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (!ref.current) return;
			const target = e.target as Node | null;
			if (target && !ref.current.contains(target)) setOpen(false);
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onKey);
		};
	}, []);

   return (
        <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
            <button
                type="button"
                aria-label="About CV Secret Prompt"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 20,
                    borderRadius: 999,
                    border: "none",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    marginLeft: -4,
                    outline: "none",
                }}
                title="What is a CV Secret Prompt?"
            >
                <i className="la la-question-circle" style={{ fontSize: 20, color: "#667085" }} aria-hidden="true"></i>
            </button>
   
            {/* Always render the tooltip so we can animate fade/scale on open/close */}
            <div
                role="tooltip"
                aria-hidden={!open}
                style={{
                    position: "absolute",
                    bottom: "140%",
                    left: "50%",
                    transform: open ? "translate(-50%, 0) scale(1)" : "translate(-50%, 4px) scale(0.98)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    background: "#111827",
                    color: "#FFFFFF",
                    borderRadius: 10,
                    padding: "10px 12px",
                    boxShadow: "0 8px 20px rgba(2,6,23,0.35)",
                    maxWidth: 460,
                    width: "max-content",
                    zIndex: 100,
                    transition: "opacity 140ms ease, transform 140ms ease",
                }}
            >
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt.
                </div>
                {/* Arrow pointing down to the trigger */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        bottom: -6,
                        left: "calc(50% - 6px)",
                        width: 12,
                        height: 12,
                        background: "#111827",
                        transform: "rotate(45deg)",
                        boxShadow: "2px 2px 4px rgba(2,6,23,0.2)",
                    }}
                />
            </div>
        </div>
    );
}