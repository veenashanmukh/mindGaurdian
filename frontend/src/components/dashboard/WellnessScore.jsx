import React from "react";

export default function WellnessScore({ score, energy }) {
	return (
		<div style={{
			background: "#eef2ff",
			padding: "1.25rem",
			borderRadius: 12,
			textAlign: "center"
		}}>
			<h3 style={{ margin: 0 }}>Wellness</h3>
			<p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{score} / 100</p>
			<p style={{ color: "#374151", margin: 0 }}>Energy: {energy}</p>
		</div>
	);
}

