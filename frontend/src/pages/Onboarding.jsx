import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleContinue = () => {
    if (!name || !age) {
      alert("Please enter your name and age");
      return;
    }

    // Save onboarding data to global state
    setUser(prev => ({
      ...prev,
      name: name,
      age: age
    }));

    // Move to next step
    navigate("/check");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Welcome to MindGuardian</h1>

      <p>
        MindGuardian helps you notice stress early and stay balanced —
        without pressure or judgment.
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <label>
          Name
          <br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          />
        </label>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>
          Age
          <br />
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="Your age"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          />
        </label>
      </div>

      <button
        onClick={handleContinue}
        style={{
          marginTop: "2rem",
          padding: "0.7rem 1.5rem",
          cursor: "pointer"
        }}
      >
        Continue
      </button>
    </div>
  );
}
