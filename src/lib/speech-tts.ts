import type { LanguageCode } from "./types";

export function playAudioChime(type: "start" | "success" | "camera" | "click" = "start") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "start") {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "camera") {
      osc.type = "square";
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (err) {
    // AudioContext may be restricted by autoplay policy
    void err;
  }
}

const LANGUAGE_VOICE_MAP: Record<LanguageCode, string[]> = {
  hi: ["hi-IN", "hi_IN", "Hindi", "hi"],
  te: ["te-IN", "te_IN", "Telugu", "te"],
  ta: ["ta-IN", "ta_IN", "Tamil", "ta"],
  kn: ["kn-IN", "kn_IN", "Kannada", "kn"],
  mr: ["mr-IN", "mr_IN", "Marathi", "mr"],
  en: ["en-IN", "en_IN", "English (India)", "en-GB", "en-US"],
};

export function speakVernacular(
  text: string,
  lang: LanguageCode = "hi",
  onEnd?: () => void,
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const desiredTags = LANGUAGE_VOICE_MAP[lang] || ["en-IN"];

    const matchingVoice = voices.find((v) =>
      desiredTags.some((tag) => v.lang.includes(tag) || v.name.includes(tag)),
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    utterance.lang = desiredTags[0] ?? "en-IN";
    utterance.rate = 0.92; // slightly slower for clear rural comprehension
    utterance.pitch = 1.05;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
