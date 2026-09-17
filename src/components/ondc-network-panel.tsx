import { useState } from "react";
import {
  Network,
  CheckCircle2,
  RefreshCw,
  Send,
  Truck,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { MarketplaceProduct } from "@/lib/types";

export function OndcNetworkPanel({
  products,
  publishedCount,
}: {
  products?: MarketplaceProduct[];
  publishedCount?: number;
}) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("Just now");

  const effectiveCount =
    publishedCount ??
    (products ? products.filter((p) => p.status === "published").length || products.length : 4);

  const buyerApps = [
    { name: "Paytm Shopping", active: true, orders: 12 },
    { name: "Mystore Exporter", active: true, orders: 9 },
    { name: "PhonePe Pincode", active: true, orders: 15 },
    { name: "Magicpin Crafts", active: true, orders: 6 },
  ];

  function triggerSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync("Just now");
    }, 1200);
  }

  return (
    <div className="border border-[#0b2559] bg-[#f0f9ff] p-4 sm:p-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0b2559]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#0b2559] bg-[#0b2559] text-white">
            <Network size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0b2559]">
                National Commerce Infrastructure
              </span>
              <span className="bg-[#dcfce7] border border-[#0d6234] px-1.5 py-0.5 text-[9px] font-bold text-[#0d6234]">
                ONDC Beckn v1.2 Live
              </span>
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-[#1f1a17] mt-0.5">
              Open Network for Digital Commerce (ONDC) Syndication
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerSync}
          disabled={syncing}
          className="flex w-full sm:w-auto justify-center items-center gap-1.5 border border-[#0b2559] bg-white px-3.5 py-2 sm:py-1.5 text-xs font-bold text-[#0b2559] transition hover:bg-[#e0f2fe] active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
          <span>{syncing ? "Syncing Network..." : "Broadcast Catalog"}</span>
        </button>
      </div>

      {/* Network Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="border border-[#0b2559]/20 bg-white p-3">
          <span className="text-[10px] uppercase font-bold text-[#6e6258] block">
            Live Catalogues
          </span>
          <span className="text-base font-bold text-[#0b2559]">
            {effectiveCount} SKUs Published
          </span>
        </div>
        <div className="border border-[#0b2559]/20 bg-white p-3">
          <span className="text-[10px] uppercase font-bold text-[#6e6258] block">
            Network Reach
          </span>
          <span className="text-base font-bold text-[#0d6234]">100M+ Buyers</span>
        </div>
        <div className="border border-[#0b2559]/20 bg-white p-3">
          <span className="text-[10px] uppercase font-bold text-[#6e6258] block">
            Logistics Partner
          </span>
          <span className="text-base font-bold text-[#1f1a17]">India Post DNK</span>
        </div>
        <div className="border border-[#0b2559]/20 bg-white p-3">
          <span className="text-[10px] uppercase font-bold text-[#6e6258] block">
            Settlement Channel
          </span>
          <span className="text-base font-bold text-[#c84218]">Direct UPI / DBT</span>
        </div>
      </div>

      {/* Active Buyer Network Gateways */}
      <div className="mt-4 border-t border-[#0b2559]/20 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e6258] block mb-2">
          Connected Buyer Apps Receiving Real-time Inventory:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {buyerApps.map((app) => (
            <div
              key={app.name}
              className="flex items-center justify-between border border-[#e6dfd5] bg-white px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#0d6234]" />
                <span className="font-semibold text-[#1f1a17]">{app.name}</span>
              </div>
              <span className="text-[10px] font-mono text-[#6e6258]">{app.orders} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
