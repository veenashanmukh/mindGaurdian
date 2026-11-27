export default function Button({ children, onClick, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        borderRadius: "8px",
        border: "none",
        background: disabled ? "#ccc" : "#6366f1",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.target.style.background = "#4f46e5")}
      onMouseLeave={(e) => !disabled && (e.target.style.background = "#6366f1")}
    >
      {children}
    </button>
  );
}
