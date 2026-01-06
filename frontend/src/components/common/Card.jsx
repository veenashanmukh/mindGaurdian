export default function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
