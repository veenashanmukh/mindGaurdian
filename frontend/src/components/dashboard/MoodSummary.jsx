import React from "react";

export default function MoodSummary({ situations = [] }) {
	return (
		<div style={{ marginTop: "1rem" }}>
			<h3>Mood Weather</h3>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<div style={{ fontSize: "2rem" }}>☀️</div>
				<div>
					<p style={{ margin: 0, color: "#374151" }}>{situations.length ? situations.join(', ') : 'Calm'}</p>
					<p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>Icon-based mood weather</p>
				</div>
			</div>
		</div>
	);
}

