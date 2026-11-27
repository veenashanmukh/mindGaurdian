import React from "react";
import { trackSuggestionUsed } from "../../services/analyticsService";

export default function Suggestions({ items = [] }) {
	function handleUse(item) {
		// Track anonymous event (analyticsService will silently noop if unavailable)
		try { trackSuggestionUsed(item); } catch (e) {}
		// For now, we simply log action — in-app navigation or other effects go here
		console.log("Suggestion used:", item);
	}

	return (
		<div style={{ marginTop: "1rem" }}>
			<h3>Gentle suggestions</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				{items.map((it, i) => (
					<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 8, borderRadius: 8 }}>
						<div>{it}</div>
						<button onClick={() => handleUse(it)} style={{ padding: '6px 10px', borderRadius: 8 }}>Use</button>
					</div>
				))}
			</div>
		</div>
	);
}

