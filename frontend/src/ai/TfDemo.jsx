import { useState } from "react";

export default function TfDemo() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  async function runDemo() {
    setStatus("loading");
    try {
      const tf = await import('@tensorflow/tfjs');
      // simple deterministic tensor computation as a demo
      const a = tf.tensor([1, 2, 3]);
      const b = tf.tensor([4, 5, 6]);
      const c = a.add(b);
      const data = await c.array();
      setResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setResult(err.message);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <h4>Optional ML demo</h4>
      <p style={{ marginTop: 0, color: '#555' }}>Loads TensorFlow.js dynamically and runs a tiny computation (safe & local).</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={runDemo}>Run ML Demo</button>
        <span style={{ color: '#444' }}>{status}</span>
      </div>
      {result && (
        <pre style={{ marginTop: 8, background: '#f8fafc', padding: 8, borderRadius: 6 }}>{JSON.stringify(result)}</pre>
      )}
    </div>
  );
}
