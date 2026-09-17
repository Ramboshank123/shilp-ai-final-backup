import { useState } from "react";
import { Send, Mic, Volume2, Globe, Sparkles, User, ArrowRight, CheckCheck } from "lucide-react";
import { speakVernacular, playAudioChime } from "@/lib/speech-tts";
import { translateVernacularChat } from "@/lib/ai.functions";
import type { MarketplaceProduct, LanguageCode } from "@/lib/types";

interface ChatMessage {
  id: string;
  sender: "buyer" | "artisan";
  text_buyer: string;
  text_artisan: string;
  timestamp: string;
}

export function TwoWayVernacularChat({
  product,
  onClose,
}: {
  product: MarketplaceProduct;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "buyer",
      text_buyer:
        "Namaste! Can this be delivered to Bengaluru within 4 days? Also is the finish waterproof?",
      text_artisan: "नमस्ते! क्या यह 4 दिनों में बेंगलुरु पहुंच सकता है? और क्या यह वाटरप्रूफ है?",
      timestamp: "10:14 AM",
    },
    {
      id: "msg-2",
      sender: "artisan",
      text_buyer:
        "Yes ji, we apply natural beeswax polish so it resists light moisture. India Post Speed Post will reach Bengaluru in 3 days.",
      text_artisan:
        "हाँ जी, हम प्राकृतिक मोम पॉलिश लगाते हैं जिससे यह नमी सुरक्षित रहता है। स्पीड पोस्ट से 3 दिन में पहुँच जाएगा।",
      timestamp: "10:16 AM",
    },
  ]);

  const [inputBuyer, setInputBuyer] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [artisanLanguage, setArtisanLanguage] = useState<LanguageCode>("hi");

  const quickArtisanReplies = [
    {
      hi: "हाँ जी, यह अभी स्टॉक में तैयार है।",
      en: "Yes ji, this is ready in stock right now.",
    },
    {
      hi: "हम आपकी पसंद का रंग या आकार भी बना सकते हैं।",
      en: "We can also customize the color or size according to your preference.",
    },
    {
      hi: "सुरक्षित बांस-क्राफ्ट पैकेजिंग में भेजा जाएगा।",
      en: "It will be dispatched in protective eco-friendly craft packaging.",
    },
  ];

  async function handleSendBuyer() {
    if (!inputBuyer.trim() || isTranslating) return;
    const text = inputBuyer.trim();
    setInputBuyer("");
    setIsTranslating(true);

    try {
      const translation = await translateVernacularChat({
        data: {
          message: text,
          sourceLang: "en",
          targetLang: artisanLanguage,
        },
      });

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "buyer",
        text_buyer: text,
        text_artisan: translation.translated,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, newMsg]);
      playAudioChime("success");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "buyer",
          text_buyer: text,
          text_artisan: text,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTranslating(false);
    }
  }

  function handleArtisanQuickReply(item: { hi: string; en: string }) {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "artisan",
      text_buyer: item.en,
      text_artisan: item.hi,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, newMsg]);
    playAudioChime("start");
  }

  return (
    <div className="border-2 border-[#1f1a17] bg-[#faf6ee] p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e6dfd5] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center bg-[#c84218] font-bold text-white">
            {product.artisan_name?.[0] ?? "A"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-[#1f1a17]">
                Live Chat with {product.artisan_name}
              </h3>
              <span className="flex items-center gap-1 bg-[#dcfce7] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#0d6234]">
                <Globe size={10} /> Vernacular AI Bridge
              </span>
            </div>
            <p className="text-[11px] text-[#6e6258]">
              Artisan speaks in Hindi/Regional • You read & reply in English
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="border border-[#e6dfd5] bg-white px-2.5 py-1 text-xs font-bold text-[#6e6258] hover:text-[#1f1a17]"
        >
          Close Chat
        </button>
      </div>

      {/* Message Timeline */}
      <div className="my-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => {
          const isArtisan = m.sender === "artisan";
          return (
            <div key={m.id} className={`flex flex-col ${isArtisan ? "items-start" : "items-end"}`}>
              <div
                className={`max-w-[85%] border p-3 ${
                  isArtisan
                    ? "border-[#c84218]/30 bg-white text-[#1f1a17]"
                    : "border-[#1f1a17] bg-[#fef3c7] text-[#1f1a17]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1 text-[10px] font-bold">
                  <span className={isArtisan ? "text-[#c84218]" : "text-[#a8320a]"}>
                    {isArtisan ? `Artisan (${product.artisan_name})` : "You (Buyer)"}
                  </span>
                  <span className="text-[#6e6258]">{m.timestamp}</span>
                </div>

                {/* Primary display */}
                <p className="mt-1.5 text-xs font-medium leading-relaxed">
                  {isArtisan ? m.text_buyer : m.text_buyer}
                </p>

                {/* Translated Vernacular Accordion / Listen */}
                <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-1.5 text-[11px] text-[#6e6258]">
                  <span className="italic font-hindi">"{m.text_artisan}"</span>
                  <button
                    type="button"
                    onClick={() => speakVernacular(m.text_artisan, "hi")}
                    className="flex items-center gap-1 font-bold text-[#c84218] hover:underline"
                    title="Play audio in Artisan's language"
                  >
                    <Volume2 size={12} /> Listen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Artisan Quick Responses (Simulating Voice/1-Touch Actions for non-literate artisans) */}
      <div className="mb-3 border border-[#e6dfd5] bg-white p-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e6258] block mb-1.5">
          Simulated Artisan 1-Touch Vernacular Responses:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickArtisanReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleArtisanQuickReply(reply)}
              className="border border-[#c84218]/40 bg-[#faf6ee] px-2 py-1 text-[11px] font-semibold text-[#a8320a] transition hover:bg-[#fef3c7]"
            >
              💬 "{reply.hi}"
            </button>
          ))}
        </div>
      </div>

      {/* Input Box for Buyer */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputBuyer}
          onChange={(e) => setInputBuyer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSendBuyer();
          }}
          placeholder="Ask a question about craft, custom size, or delivery..."
          className="flex-1 border border-[#1f1a17] bg-white px-3.5 py-2 text-xs outline-none focus:ring-1 focus:ring-[#c84218]"
        />
        <button
          type="button"
          disabled={isTranslating}
          onClick={() => void handleSendBuyer()}
          className="flex items-center gap-1 border border-[#c84218] bg-[#c84218] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isTranslating ? (
            "Translating..."
          ) : (
            <>
              <Send size={13} /> Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
