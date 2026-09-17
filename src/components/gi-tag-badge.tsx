import { useState } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  X,
  Landmark,
  BookOpen,
} from "lucide-react";
import type { GiTagInfo } from "@/lib/types";

export function GiTagBadge({
  giTag,
  showModalTrigger = true,
  size = "md",
}: {
  giTag?: GiTagInfo | null;
  showModalTrigger?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);

  if (!giTag) return null;

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            if (showModalTrigger) {
              e.stopPropagation();
              setOpen(true);
            }
          }}
          className={`inline-flex items-center gap-1.5 border border-[#0d6234] bg-[#f0fdf4] font-bold text-[#0d6234] transition hover:bg-[#dcfce7] ${
            size === "sm"
              ? "px-2 py-0.5 text-[10px]"
              : size === "lg"
                ? "px-3.5 py-1.5 text-xs"
                : "px-2.5 py-1 text-[11px]"
          }`}
          title="Click to view Government of India Geographical Indication Certificate"
        >
          <Award size={size === "sm" ? 11 : 14} className="text-[#0d6234] shrink-0" />
          <span className="uppercase tracking-wider">GI Certified</span>
          <span className="font-mono text-[10px] opacity-75">
            #{giTag.tag_number.replace("GI-IN-", "")}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg border-2 border-[#0d6234] bg-[#faf6ee] p-6 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with National Heritage Framing */}
            <div className="flex items-start justify-between border-b border-[#0d6234]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border border-[#0d6234] bg-[#0d6234] text-white">
                  <Landmark size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0d6234]">
                    Government of India • Ministry of Commerce & Industry
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#1f1a17]">
                    GI Certificate of Authenticity
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-[#e6dfd5] bg-white p-1 text-[#6e6258] hover:text-[#1f1a17]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Certificate Details */}
            <div className="mt-5 space-y-4 text-sm">
              <div className="border border-[#0d6234]/20 bg-white p-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6e6258] uppercase tracking-wider font-semibold">
                      Registered Craft
                    </span>
                    <p className="font-bold text-sm text-[#1f1a17] mt-0.5">{giTag.craft_name}</p>
                  </div>
                  <div>
                    <span className="text-[#6e6258] uppercase tracking-wider font-semibold">
                      GI Registry Number
                    </span>
                    <p className="font-mono font-bold text-sm text-[#0d6234] mt-0.5">
                      {giTag.tag_number}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6e6258] uppercase tracking-wider font-semibold">
                      State of Origin
                    </span>
                    <p className="font-semibold text-[#1f1a17] mt-0.5">{giTag.state}, India</p>
                  </div>
                  <div>
                    <span className="text-[#6e6258] uppercase tracking-wider font-semibold">
                      Registration Year
                    </span>
                    <p className="font-semibold text-[#1f1a17] mt-0.5">{giTag.registered_year}</p>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-[#0d6234] bg-[#f0fdf4] p-3 text-xs text-[#064e3b]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck size={14} className="text-[#0d6234]" />
                  <span>Statutory Legal Protection</span>
                </div>
                <p>
                  Protected under the{" "}
                  <strong>
                    Geographical Indications of Goods (Registration & Protection) Act, 1999
                  </strong>
                  . Unlawful reproduction or commercial imitation carries strict civil & criminal
                  penalties.
                </p>
              </div>

              <div className="border border-[#e6dfd5] bg-[#fffbf2] p-3 text-xs text-[#5c4d3c]">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-[#a8320a]">
                  <BookOpen size={14} />
                  <span>Artisan Guild Heritage Seal</span>
                </div>
                <p>{giTag.heritage_seal}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd5] text-xs">
                <span className="flex items-center gap-1 text-[#0d6234] font-semibold">
                  <CheckCircle2 size={13} />
                  Registry Database Verified
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-[#0d6234] bg-[#0d6234] px-4 py-1.5 font-bold text-white transition hover:brightness-110"
                >
                  Close Seal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
