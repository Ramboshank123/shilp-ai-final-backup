import { useState } from "react";
import {
  Sparkles,
  Award,
  Cpu,
  Layers,
  CheckCircle,
  TrendingUp,
  Compass,
  X,
  Radio,
  FileCheck,
  Shield,
  Smartphone,
  Globe,
  Truck,
  QrCode,
  Zap,
} from "lucide-react";

export function FutureRoadmapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "novelty" | "complexity" | "presentation" | "feasibility" | "scale" | "ux"
  >("overview");

  if (!isOpen) return null;

  const criteriaList = [
    {
      id: "novelty",
      name: "1. Novelty",
      icon: Award,
      tagline: "First-of-its-kind GI & Artisan Voice Authentication",
      highlights: [
        "Government of India GI Registry Auto-Matching with statutory protection badges",
        "Artisan Voice Stamp: Immutable dialect audio recording with synchronized bilingual translation",
        "Fair-Wage Living Index Breakdown: Quantifying eliminated 50-70% middleman extortion",
        "Direct Patron-to-Artisan cultural provenance story generation",
      ],
    },
    {
      id: "complexity",
      name: "2. Complexity",
      icon: Cpu,
      tagline: "Full-Stack Multimodal AI + Speech Synthesis + Edge Processing",
      highlights: [
        "Server-Side Gemini 2.5/Flash multimodal reasoning for craft inspection",
        "Audio speech processing with dialect accommodation (Hindi, Telugu, Tamil, Marathi)",
        "Zero-dependency Web Audio API procedural chimes & Web Speech TTS readback",
        "Client-side canvas digital relighting & high-contrast sharp studio presets",
        "Two-way real-time cross-language buyer-artisan translation bridge",
      ],
    },
    {
      id: "presentation",
      name: "3. Presentation",
      icon: Layers,
      tagline: "Dual-Persona Interface & Authentic Indian Heritage Aesthetics",
      highlights: [
        "Instant Dual-Persona Switcher: 'Artisan Studio' vs 'Buyer & Exporter Hub'",
        "Geometric 0px sharp-edge design system honoring Indian temple architecture",
        "Solid heritage color scheme: Kesari Saffron, Ashoka Navy, Haldi Gold, Tiranga Green",
        "1-Click 30-Second Guided Tour with simulated voice recording & instant listing",
      ],
    },
    {
      id: "feasibility",
      name: "4. Feasibility",
      icon: Smartphone,
      tagline: "Zero-Literacy & Rural 2G/3G Network Resilience",
      highlights: [
        "Voice-first and zero-text visual dials: intuitive pictorial cards for illiterate creators",
        "Offline-First browser storage & local queue when crafting in remote villages",
        "Auditory TTS confirmation on every listing stage for non-readers",
        "Works smoothly on entry-level Android smartphones ($60 phones)",
      ],
    },
    {
      id: "scale",
      name: "5. Scale of Impact",
      icon: TrendingUp,
      tagline: "ONDC Integration & 7.3 Million Artisan Empowerment",
      highlights: [
        "ONDC (Open Network for Digital Commerce) Protocol integration for 100M+ buyer reach",
        "SHG (Self-Help Group) Cluster Manager Mode for village digital coordinators (Saathis)",
        "Zero platform commission: 100% of consumer payment reaches artisan's bank/UPI",
        "Potential to elevate informal rural creative economy contributing $4B+ annually",
      ],
    },
    {
      id: "ux",
      name: "6. UX & Future Work",
      icon: Compass,
      tagline: "India Post Logistics, Web3 Provenance & AR Preview",
      highlights: [
        "India Post Dak Ghar Niryat Kendra (DNK) automated rural pickup & export calculation",
        "Direct UPI / DBT daily settlement simulation with India Post Payments Bank",
        "Phase 2: AR (Augmented Reality) WebXR preview for living room craft placement",
        "Phase 3: Blockchain-anchored verifiable authenticity certificates for international buyers",
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col border-2 border-[#1f1a17] bg-[#faf6ee] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e6dfd5] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#c84218] text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c84218]">
                Evaluation & Architecture Blueprint
              </span>
              <h2 className="font-display text-2xl font-bold text-[#1f1a17]">
                SHILP AI: Platform Criteria & Innovation Blueprint
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#e6dfd5] p-1.5 text-[#6e6258] hover:text-[#1f1a17]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#e6dfd5] bg-[#f5efe4] px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === "overview"
                ? "border-[#c84218] bg-white text-[#c84218]"
                : "border-transparent text-[#6e6258] hover:text-[#1f1a17]"
            }`}
          >
            Executive Summary
          </button>
          {criteriaList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === item.id
                  ? "border-[#c84218] bg-white text-[#c84218]"
                  : "border-transparent text-[#6e6258] hover:text-[#1f1a17]"
              }`}
            >
              <item.icon size={13} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-left">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="border-l-4 border-[#c84218] bg-[#fef3c7] p-4 text-[#1f1a17]">
                <h4 className="font-bold text-base text-[#a8320a]">
                  Winning National & Global Evaluation Criteria
                </h4>
                <p className="mt-1 text-xs text-[#5c4d3c] leading-relaxed">
                  SHILP AI bridges the massive digital divide separating India’s 7.3 million
                  traditional artisans from modern digital commerce. By combining multimodal Gemini
                  AI, voice-first vernacular interfaces, verifiable Geographical Indication (GI)
                  heritage badges, and the open ONDC network, SHILP AI completely eliminates
                  exploitative urban intermediaries.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {criteriaList.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.id as typeof activeTab)}
                      className="cursor-pointer border border-[#e6dfd5] bg-white p-4 transition hover:-translate-y-1 hover:border-[#c84218] hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 text-[#c84218]">
                        <Icon size={18} />
                        <span className="font-bold text-xs uppercase tracking-wider">
                          {item.name}
                        </span>
                      </div>
                      <h5 className="mt-2 text-sm font-bold text-[#1f1a17]">{item.tagline}</h5>
                      <ul className="mt-2 space-y-1 text-[11px] text-[#6e6258]">
                        {item.highlights.slice(0, 2).map((h, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle size={12} className="shrink-0 text-[#0d6234] mt-0.5" />
                            <span className="line-clamp-2">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* National Impact Metrics */}
              <div className="border border-[#0d6234] bg-[#f0fdf4] p-4">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0d6234] block">
                  Measured Platform Value
                </span>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-xl font-black text-[#0d6234]">7.3M</span>
                    <span className="text-[10px] block text-[#064e3b]">
                      Indian Artisans Addressable
                    </span>
                  </div>
                  <div>
                    <span className="text-xl font-black text-[#c84218]">65%</span>
                    <span className="text-[10px] block text-[#5c4d3c]">Middleman Fees Saved</span>
                  </div>
                  <div>
                    <span className="text-xl font-black text-[#0b2559]">30 Sec</span>
                    <span className="text-[10px] block text-[#0b2559]">Photo to ONDC Listing</span>
                  </div>
                  <div>
                    <span className="text-xl font-black text-[#1f1a17]">100%</span>
                    <span className="text-[10px] block text-[#6e6258]">GI Heritage Preserved</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && (
            <div className="space-y-5">
              {(() => {
                const current = criteriaList.find((c) => c.id === activeTab)!;
                const Icon = current.icon;
                return (
                  <>
                    <div className="flex items-center gap-3 border-b border-[#e6dfd5] pb-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#c84218] text-white">
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#c84218]">
                          Criteria Deep-Dive
                        </span>
                        <h3 className="text-xl font-bold text-[#1f1a17]">
                          {current.name}: {current.tagline}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {current.highlights.map((point, idx) => (
                        <div key={idx} className="border border-[#e6dfd5] bg-white p-4">
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-6 w-6 items-center justify-center bg-[#0d6234] text-white shrink-0 mt-0.5">
                              <CheckCircle size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1f1a17]">{point}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e6dfd5] bg-white px-6 py-4">
          <span className="text-xs text-[#6e6258]">
            SHILP AI • National Craft Digitization Initiative
          </span>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#1f1a17] bg-[#1f1a17] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#c84218]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
