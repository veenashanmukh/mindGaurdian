// ============================================================
// Audio Tone Analysis Module
// ============================================================
// Purpose: Analyzes voice recordings to infer emotional tone
// Method: Uses RMS (loudness) and zero-crossing rate (frequency)
// Why: Determines if user sounds calm, tense, or neutral
// No external AI — all client-side for privacy & speed
// ============================================================

export async function analyzeAudioBlob(blob) {
  // Decode the recorded audio blob and extract emotional markers
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await ac.decodeAudioData(arrayBuffer);

    const ch = audioBuffer.getChannelData(0); // use first channel
    const frameSize = 1024;
    let rmsSum = 0;
    let zcrSum = 0;
    let frames = 0;

    for (let i = 0; i < ch.length; i += frameSize) {
      const frame = ch.subarray(i, i + frameSize);
      let sumSquares = 0;
      let zc = 0;
      for (let j = 0; j < frame.length; j++) {
        const v = frame[j];
        sumSquares += v * v;
        if (j > 0) {
          if ((frame[j - 1] >= 0 && v < 0) || (frame[j - 1] < 0 && v >= 0)) zc++;
        }
      }
      const rms = Math.sqrt(sumSquares / frame.length);
      rmsSum += rms;
      zcrSum += zc / frame.length;
      frames++;
    }

    const avgRms = rmsSum / Math.max(1, frames);
    const avgZcr = zcrSum / Math.max(1, frames);

    const tone = inferTone({ rms: avgRms, zcr: avgZcr });

    try { ac.close(); } catch (e) {}

    return { rms: avgRms, zcr: avgZcr, tone };
  } catch (err) {
    return { error: err.message };
  }
}

export function inferTone({ rms, zcr }) {
  // ============================================================
  // Tone Inference Rules
  // ============================================================
  // calm (low stress): low RMS + moderate-to-low zcr
  //   → speaks quietly, steady voice, controlled breathing
  // tense (high stress): high RMS + variable/high zcr
  //   → speaks louder, irregular voice, shallow breathing
  // neutral: moderate RMS and zcr
  //   → normal speaking tone
  // ============================================================
  
  // Simple deterministic rules:
  if (rms < 0.005) return 'calm';
  if (rms > 0.02 || zcr > 0.15) return 'tense';
  return 'neutral';
}
