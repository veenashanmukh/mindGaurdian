// Passes through onClick and other props so cards can be used as tappable choices
// (the Journal page relies on this). Clickable cards also work from the keyboard.
export default function Card({ children, style = {}, className = "", onClick, ...rest }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      className={`mg-card${clickable ? " mg-card--action" : ""}${className ? " " + className : ""}`}
      style={style}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
