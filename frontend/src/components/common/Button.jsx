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
        background: disabled ? "#ccc" : "#2F6B68",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.target.style.background = "#22504E")}
      onMouseLeave={(e) => !disabled && (e.target.style.background = "#2F6B68")}
    >
      {children}
    </button>
  );
}
