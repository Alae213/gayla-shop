"use client";

import {
  Package,
  TrendingUp,
  ImageOff,
  Clock,
  Truck,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(ts: number | undefined): string {
  if (!ts) return "Never";
  const diff = Math.floor((Date.now() - ts) / 1000); // seconds
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsCardsProps {
  mode: "build" | "tracking";
  // Build mode
  siteContent?: { homepageViewCount: number; updatedAt?: number } | null;
  products?: any[];
  /** M2 Task 2.2 — called when admin clicks the "No Image" card */
  onNoImageClick?: () => void;
  // Tracking mode
  orderStats?: {
    total?: number;
    Pending?: number;
    Confirmed?: number;
    Shipped?: number;
    Delivered?: number;
    Cancelled?: number;
    Retour?: number;
    Packaged?: number;
    "Called 01"?: number;
    "Called 02"?: number;
    "Called no respond"?: number;
    active?: number;
    readyToShip?: number;
    inTransit?: number;
    completed?: number;
  } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatsCards({
  mode,
  siteContent,
  products,
  onNoImageClick,
  orderStats,
}: StatsCardsProps) {

  // ── BUILD MODE ─────────────────────────────────────────────────────────────
  if (mode === "build") {
    const total   = products?.length ?? 0;
    const active  = products?.filter((p) => p.status === "Active").length ?? 0;
    const noImage = products?.filter((p) => !p.images || p.images.length === 0).length ?? 0;
    const heroUpdated = siteContent?.updatedAt;
    const noImageAlert = noImage > 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Total Products */}
        <div className="bg-gradient-to-br from-brand-200 to-brand-300 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-2">{total}</p>
              <p className="text-white/70 text-xs mt-1">{active} active</p>
            </div>
            <Package className="h-12 w-12 text-white/70 opacity-80" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-gradient-to-br from-success to-success/80 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Active Products</p>
              <p className="text-3xl font-bold mt-2">{active}</p>
              <p className="text-white/70 text-xs mt-1">Visible in storefront</p>
            </div>
            <TrendingUp className="h-12 w-12 text-white/70 opacity-80" />
          </div>
        </div>

        {/* No Image — warning/destructive if > 0, clickable to filter */}
        <button
          type="button"
          onClick={noImageAlert ? onNoImageClick : undefined}
          className={`rounded-xl p-6 text-white shadow-lg text-left w-full transition-transform ${
            noImageAlert
              ? "bg-gradient-to-br from-warning to-destructive hover:scale-[1.02] cursor-pointer"
              : "bg-muted cursor-default"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">No Image</p>
              <p className="text-3xl font-bold mt-2">{noImage}</p>
              <p className="text-white/70 text-xs mt-1">
                {noImageAlert ? "Click to filter ↗" : "All products have images"}
              </p>
            </div>
            <ImageOff className="h-12 w-12 text-white/40" />
          </div>
        </button>

        {/* Hero Last Updated */}
        <div className="bg-gradient-to-br from-brand-200 to-brand-300 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Hero Last Saved</p>
              <p className="text-2xl font-bold mt-2 leading-tight">{relativeTime(heroUpdated)}</p>
              <p className="text-white/70 text-xs mt-1">Hero section</p>
            </div>
            <Clock className="h-12 w-12 text-white/70 opacity-80" />
          </div>
        </div>

      </div>
    );
  }

  // ── TRACKING MODE ──────────────────────────────────────────────────────────
  const active      = orderStats?.active      ?? 0;
  const readyToShip = orderStats?.readyToShip ?? 0;
  const inTransit   = orderStats?.inTransit   ?? 0;
  const delivered   = orderStats?.Delivered   ?? 0;
  const pending     = orderStats?.Pending             ?? 0;
  const called =
    (orderStats?.["Called 01"]         ?? 0) +
    (orderStats?.["Called 02"]         ?? 0) +
    (orderStats?.["Called no respond"] ?? 0);
  const cancelled = orderStats?.Cancelled ?? 0;
  const retour    = orderStats?.Retour    ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-warning to-warning/80 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Active Orders</p>
            <p className="text-3xl font-bold mt-1">{active}</p>
            <p className="text-white/70 text-xs mt-1.5">{pending} pending · {called} calling</p>
          </div>
          <PhoneCall className="h-10 w-10 text-white/70 opacity-80 shrink-0" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-brand-200 to-brand-300 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Ready to Ship</p>
            <p className="text-3xl font-bold mt-1">{readyToShip}</p>
            <p className="text-white/70 text-xs mt-1.5">Packaged, awaiting courier</p>
          </div>
          <Package className="h-10 w-10 text-white/70 opacity-80 shrink-0" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-brand-200 to-brand-300 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">In Transit</p>
            <p className="text-3xl font-bold mt-1">{inTransit}</p>
            <p className="text-white/70 text-xs mt-1.5">Currently shipped</p>
          </div>
          <Truck className="h-10 w-10 text-white/70 opacity-80 shrink-0" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-success to-success/80 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Delivered</p>
            <p className="text-3xl font-bold mt-1">{delivered}</p>
            <p className="text-white/70 text-xs mt-1.5">{cancelled} cancelled · {retour} retour</p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-white/70 opacity-80 shrink-0" />
        </div>
      </div>
    </div>
  );
}
