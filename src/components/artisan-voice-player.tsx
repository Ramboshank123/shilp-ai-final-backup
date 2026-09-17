import { useState, useEffect } from "react";
import { Volume2, VolumeX, Mic, Sparkles } from "lucide-react";
import { speakVernacular, stopSpeaking } from "@/lib/speech-tts";
import type { ArtisanAudioNote, LanguageCode } from "@/lib/types";

export function ArtisanVoicePlayer({
  audioNote,
  artisanName = "The Artisan",
  language = "en",
}: {
  audioNote?: ArtisanAudioNote | null;
  artisanName?: string;
  language?: LanguageCode;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"native" | "english">("native");

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!audioNote) {
    return null;
  }

  function handleTogglePlay() {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const speechText =
      activeTab === "native"
        ? audioNote?.native_transcript || ""
        : audioNote?.english_translation || "";
    const speechLang = activeTab === "native" ? "hi" : "en";

    speakVernacular(speechText, speechLang, () => {
      setIsPlaying(false);
    });
  }

  return (
    <div className="border border-[#e6dfd5] bg-[#fffbf2] p-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border border-[#c84218] bg-[#c84218] text-white">
            <Mic size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c84218] flex items-center gap-1">
              <Sparkles size={11} />
              Artisan Voice Stamp
            </span>
            <p className="text-xs font-bold text-[#1f1a17]">
              Hear {artisanName} speaking in {audioNote.dialect}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition ${
            isPlaying
              ? "border-[#c84218] bg-[#c84218] text-white animate-pulse"
              : "border-[#1f1a17] bg-white text-[#1f1a17] hover:bg-[#faf6ee]"
          }`}
        >
          {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isPlaying ? "Pause" : "Listen (14s)"}</span>
        </button>
      </div>

      {/* Synchronized Audio Waveform Indicator */}
      {isPlaying && (
        <div className="mt-3 flex items-center justify-center gap-1 bg-white/70 py-2 border border-[#e6dfd5]">
          {[16, 28, 42, 22, 35, 48, 20, 38, 44, 26, 33, 40, 18, 30].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[#c84218] transition-all duration-150 animate-bounce"
              style={{
                height: `${h}px`,
                animationDelay: `${i * 70}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtitles toggle */}
      <div className="mt-3 border-t border-[#e6dfd5]/80 pt-2.5">
        <div className="flex gap-2 text-[10px] uppercase font-bold mb-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("native")}
            className={`px-2 py-0.5 border ${
              activeTab === "native"
                ? "border-[#c84218] bg-[#fef3c7] text-[#a8320a]"
                : "border-[#e6dfd5] bg-white text-[#6e6258]"
            }`}
          >
            Native {audioNote.dialect}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("english")}
            className={`px-2 py-0.5 border ${
              activeTab === "english"
                ? "border-[#c84218] bg-[#fef3c7] text-[#a8320a]"
                : "border-[#e6dfd5] bg-white text-[#6e6258]"
            }`}
          >
            English Translation
          </button>
        </div>

        <p className="text-xs italic text-[#4a3f35] leading-relaxed">
          "{activeTab === "native" ? audioNote.native_transcript : audioNote.english_translation}"
        </p>
      </div>
    </div>
  );
}
