import { useNavigate } from "react-router-dom";
import { trackSuggestionUsed } from "../../services/analyticsService";

export default function Suggestions({ items = [] }) {
  const navigate = useNavigate();

  function handleUse(item) {
    try { trackSuggestionUsed(item.label || item); } catch { /* analytics is optional */ }
    if (item && item.to) navigate(item.to);
  }

  return (
    <ul className="mg-suggestions">
      {items.map((it, i) => {
        const label = typeof it === "string" ? it : it.label;
        return (
          <li key={i} className="mg-suggestion">
            <div>
              <div className="mg-suggestion__label">{label}</div>
              {it.detail && <div className="mg-muted">{it.detail}</div>}
            </div>
            {it.to && (
              <button className="mg-btn mg-btn--soft" onClick={() => handleUse(it)}>
                Start
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
