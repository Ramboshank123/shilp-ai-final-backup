import { useState, useEffect } from "react";
import {
  Sparkles,
  Mic,
  Play,
  CheckCircle2,
  X,
  ArrowRight,
  Globe,
  Award,
  Zap,
  TrendingUp,
} from "lucide-react";
import { speakVernacular, playAudioChime } from "@/lib/speech-tts";
import type { ProductDraft } from "@/lib/types";

export function GuidedDemoModal({
  isOpen,
  onClose,
  onApplyDraft,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (draft: Partial<ProductDraft>) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const demoScriptHindi =
    "यह टोकरी हमने स्थानीय असमिया बांस से तीन दिनों में हाथ से बुनी है। इसमें प्राकृतिक फल, सब्जियां या कपड़े सुरक्षित रख सकते हैं।";
  const demoScriptEnglish =
    "This basket is handwoven over 3 days using indigenous Assam bamboo. It is sturdy and perfect for storing fresh fruits, vegetables, or household linens.";

  function handlePlayVoice() {
    setSpeaking(true);
    playAudioChime("start");
    speakVernacular(demoScriptHindi, "hi", () => {
      setSpeaking(false);
      setStep(2);
    });
  }

  function handleNextStep() {
    if (step === 1) {
      handlePlayVoice();
    } else if (step === 2) {
      playAudioChime("success");
      setStep(3);
    } else if (step === 3) {
      playAudioChime("success");
      setStep(4);
    } else {
      // Apply the generated draft to the actual app state!
      onApplyDraft({
        name: "Handcrafted Barpeta Bamboo Storage Basket",
        category: "Bamboo",
        craft_type: "Bamboo weaving",
        material: "Indigenous Jati Bamboo & Cane",
        colour: "Natural golden cane",
        size: "30 × 30 × 25 cm",
        production_time: "3 days",
        description: demoScriptEnglish,
        description_hindi: demoScriptHindi,
        price: 749,
        transcript: demoScriptHindi,
        imageUrl: "/demo/bamboo-basket.jpg",
        key_features: [
          "100% natural Assam cane peel",
          "Chemical-free organic vegetable wash",
          "Double-reinforced base for heavy storage",
          "Direct living wage to Meera Devi's family",
        ],
        provenance_story:
          "Rooted in the ancient bamboo craft guilds of the Brahmaputra Valley, practiced continuously for over four centuries.",
      });
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl border-2 border-[#1f1a17] bg-[#faf6ee] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#e6dfd5] bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-[#c84218] text-white">
              <Zap size={16} />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#c84218]">
                Interactive Simulation
              </span>
              <h3 className="text-sm font-bold text-[#1f1a17]">
                30-Second AI Voice Cataloging Demo
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#e6dfd5] p-1 text-[#6e6258] hover:text-[#1f1a17]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="grid grid-cols-4 border-b border-[#e6dfd5] bg-[#f5efe4] text-center text-[10px] font-bold uppercase tracking-wider">
          <div
            className={`py-2 border-r border-[#e6dfd5] ${
              step === 1
                ? "bg-[#c84218] text-white"
                : step > 1
                  ? "bg-[#dcfce7] text-[#0d6234]"
                  : "text-[#6e6258]"
            }`}
          >
            1. Voice Input
          </div>
          <div
            className={`py-2 border-r border-[#e6dfd5] ${
              step === 2
                ? "bg-[#c84218] text-white"
                : step > 2
                  ? "bg-[#dcfce7] text-[#0d6234]"
                  : "text-[#6e6258]"
            }`}
          >
            2. Gemini AI
          </div>
          <div
            className={`py-2 border-r border-[#e6dfd5] ${
              step === 3
                ? "bg-[#c84218] text-white"
                : step > 3
                  ? "bg-[#dcfce7] text-[#0d6234]"
                  : "text-[#6e6258]"
            }`}
          >
            3. GI & Pricing
          </div>
          <div className={`py-2 ${step === 4 ? "bg-[#c84218] text-white" : "text-[#6e6258]"}`}>
            4. Live ONDC
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-left space-y-4">
          {step === 1 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border-2 border-[#c84218] bg-white text-[#c84218]">
                <Mic size={36} className={speaking ? "animate-pulse text-[#e11d48]" : ""} />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#1f1a17]">
                  Step 1: Rural Artisan Speaks in Native Dialect
                </h4>
                <p className="text-xs text-[#6e6258] mt-1 max-w-sm mx-auto">
                  Click below to simulate Meera Devi (Assam) speaking about her handmade bamboo
                  basket in Hindi/Assamese.
                </p>
              </div>

              <div className="border border-[#c84218]/30 bg-white p-3.5 text-xs italic text-[#a8320a]">
                "{demoScriptHindi}"
              </div>

              {speaking && (
                <div className="flex items-center justify-center gap-1">
                  {[20, 36, 48, 28, 44, 22, 38].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#c84218] animate-bounce"
                      style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0b2559] font-bold text-xs">
                <Sparkles size={16} />
                <span>Multimodal Gemini 2.5/Flash Inspection</span>
              </div>
              <p className="text-xs text-[#6e6258]">
                Gemini processes the photo and audio waveform, extracting structured commercial
                attributes:
              </p>
              <div className="border border-[#e6dfd5] bg-white p-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="text-[#6e6258]">Extracted Name:</span>
                  <span className="font-bold text-[#1f1a17]">
                    Handcrafted Barpeta Bamboo Storage Basket
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="text-[#6e6258]">Craft Category:</span>
                  <span className="font-bold text-[#0d6234]">Bamboo & Cane Weaving</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="text-[#6e6258]">Raw Materials:</span>
                  <span className="font-semibold text-[#1f1a17]">
                    Indigenous Jati Bamboo & Cane Peel
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6258]">Production Duration:</span>
                  <span className="font-semibold text-[#1f1a17]">3 Days (18 Labor Hours)</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#0d6234] font-bold text-xs">
                <Award size={16} />
                <span>Geographical Indication Match & Fair-Wage Audit</span>
              </div>
              <div className="border border-[#0d6234] bg-[#f0fdf4] p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#0d6234]">GI Registry Verified</span>
                  <span className="font-mono font-bold text-[#0d6234]">GI-IN-AS0112</span>
                </div>
                <p className="text-[#064e3b]">
                  Matched official registration:{" "}
                  <strong>Assam Bamboo & Cane Works (Brahmaputra Valley)</strong>.
                </p>
              </div>

              <div className="border border-[#e6dfd5] bg-white p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6e6258]">Living Wage Rate:</span>
                  <span className="font-bold text-[#1f1a17]">₹110 / hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6258]">Artisan Direct Payout:</span>
                  <span className="font-bold text-[#0d6234]">₹495 direct to bank</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-1">
                  <span className="text-[#6e6258]">Recommended Direct Price:</span>
                  <span className="text-sm font-bold text-[#c84218]">
                    ₹749 (Traditional emporium: ₹1,650)
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#0d6234] text-white">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-bold text-[#1f1a17]">
                Listing Ready for Nationwide ONDC Broadcast!
              </h4>
              <p className="text-xs text-[#6e6258] max-w-sm mx-auto">
                In less than 30 seconds, a rural artisan's voice note has been converted into a
                verified, GI-authenticated product listed across Paytm, Mystore, and PhonePe.
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-[#e6dfd5] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#6e6258] hover:text-[#1f1a17]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="flex items-center gap-1.5 border border-[#c84218] bg-[#c84218] px-5 py-2 text-xs font-bold text-white transition hover:brightness-110"
          >
            <span>
              {step === 1
                ? speaking
                  ? "Speaking..."
                  : "Play Voice Simulation"
                : step === 4
                  ? "Open Listing in Studio"
                  : "Continue"}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
