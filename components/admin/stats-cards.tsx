"use client";

import {
  Activity,
  Package,
  TrendingUp,
  Pencil,
  Truck,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

interface StatsCardsProps {
  mode: "build" | "tracking";
  siteContent?: { homepageViewCount: number } | null;
  products?: any[];
  /**
   * Returned by api.orders.getStats (Phase 1).
   * Includes both per-status counts and aggregate groups.
   */
  orderStats?: {
    // Per-status
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
    // Aggregates added in Phase 1
    active?: number;       // Pending + Calling + Confirmed
    readyToShip?: number;  // Packaged
    inTransit?: number;    // Shipped
    completed?: number;    // Delivered + Retour + Cancelled
  } | null;
}

export function StatsCards({
  mode,
  siteContent,
  products,
  orderStats,
}: StatsCardsProps) {

  // ────────────────────────────────────────────────────────────────────
  // BUILD MODE
  // ────────────────────────────────────────────────────────────────────
  if (mode === "build") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Homepage Views</p>
              <p className="text-3xl font-bold mt-2">
                {siteContent?.homepageViewCount?.toLocaleString() || 0}
              </p>
            </div>
            <Activity className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-2">{products?.length || 0}</p>
            </div>
            <Package className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Products</p>
              <p className="text-3xl font-bold mt-2">
                {products?.filter((p) => p.status === "Active").length || 0}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Draft Products</p>
              <p className="text-3xl font-bold mt-2">
                {products?.filter((p) => p.status === "Draft").length || 0}
              </p>
            </div>
            <Pencil className="h-12 w-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────
  // TRACKING MODE — uses aggregate groups from getStats
  // ────────────────────────────────────────────────────────────────────

  const active      = orderStats?.active      ?? 0;
  const readyToShip = orderStats?.readyToShip ?? 0;
  const inTransit   = orderStats?.inTransit   ?? 0;
  const delivered   = orderStats?.Delivered   ?? 0;

  // Sub-breakdown for Active card
  const pending   = orderStats?.Pending             ?? 0;
  const called    =
    (orderStats?.["Called 01"]           ?? 0) +
    (orderStats?.["Called 02"]           ?? 0) +
    (orderStats?.["Called no respond"]   ?? 0);

  // Sub-breakdown for Delivered card
  const cancelled = orderStats?.Cancelled ?? 0;
  const retour    = orderStats?.Retour    ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* ─ Active Orders ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-amber-100 text-sm font-medium">Active Orders</p>
            <p className="text-3xl font-bold mt-1">{active}</p>
            <p className="text-amber-200 text-xs mt-1.5">
              {pending} pending · {called} calling
            </p>
          </div>
          <PhoneCall className="h-10 w-10 text-amber-200 opacity-80 shrink-0" />
        </div>
      </div>

      {/* ─ Ready to Ship ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Ready to Ship</p>
            <p className="text-3xl font-bold mt-1">{readyToShip}</p>
            <p className="text-purple-200 text-xs mt-1.5">Packaged, awaiting courier</p>
          </div>
          <Package className="h-10 w-10 text-purple-200 opacity-80 shrink-0" />
        </div>
      </div>

      {/* ─ In Transit ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium">In Transit</p>
            <p className="text-3xl font-bold mt-1">{inTransit}</p>
            <p className="text-indigo-200 text-xs mt-1.5">Currently shipped</p>
          </div>
          <Truck className="h-10 w-10 text-indigo-200 opacity-80 shrink-0" />
        </div>
      </div>

      {/* ─ Delivered ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Delivered</p>
            <p className="text-3xl font-bold mt-1">{delivered}</p>
            <p className="text-green-200 text-xs mt-1.5">
              {cancelled} cancelled · {retour} retour
            </p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-green-200 opacity-80 shrink-0" />
        </div>
      </div>
    </div>
  );
}
