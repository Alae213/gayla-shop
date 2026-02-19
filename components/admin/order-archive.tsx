"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CheckCircle2, RotateCcw, XCircle,
  Trash2, AlertTriangle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { OrderTable } from "./order-table";
import { toast } from "sonner";

type ArchiveFilter = "all" | "Delivered" | "Retour" | "Cancelled";

const FILTER_OPTIONS: { value: ArchiveFilter; label: string }[] = [
  { value: "all",       label: "All Terminal" },
  { value: "Delivered", label: "Delivered"    },
  { value: "Retour",    label: "Retour"       },
  { value: "Cancelled", label: "Cancelled"    },
];

interface OrderArchiveProps {
  orders: any[];
  stats: { Delivered?: number; Retour?: number; Cancelled?: number };
  onOrderClick: (id: Id<"orders">) => void;
}

export function OrderArchive({ orders, stats, onOrderClick }: OrderArchiveProps) {
  const [filter,      setFilter]      = useState<ArchiveFilter>("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCleaning,  setIsCleaning]  = useState(false);

  // E2+E3: live preview data from Convex
  const preview        = useQuery(api.orders.getArchiveCleanupPreview);
  const purgeOldArchive = useMutation(api.orders.purgeOldArchive);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // E4: purge horizon helpers
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const oldestDate = preview?.oldestCreationTime
    ? new Date(preview.oldestCreationTime).toLocaleDateString("en-US", { dateStyle: "medium" })
    : null;

  const daysUntilPurge = preview?.oldestCreationTime
    ? Math.max(
        0,
        Math.ceil((preview.oldestCreationTime + SIXTY_DAYS_MS - now) / (24 * 60 * 60 * 1000))
      )
    : null;

  const handleForceClean = async () => {
    setIsCleaning(true);
    try {
      const result = await purgeOldArchive();
      toast.success(
        result.deleted > 0
          ? `🗑️ Deleted ${result.deleted} order${result.deleted !== 1 ? "s" : ""} older than 60 days.`
          : "No eligible orders to purge."
      );
      setShowConfirm(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to purge archive");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ─ Stat bar ──────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
        <div className="flex flex-wrap items-center gap-6">

          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats.Delivered ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Delivered</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-3">
            <RotateCcw className="h-6 w-6 text-slate-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats.Retour ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Retour</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stats.Cancelled ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Cancelled</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          {/* E4 — purge horizon */}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              {oldestDate ? (
                <>
                  <p className="text-xs text-gray-600 font-medium">Oldest: {oldestDate}</p>
                  <p className={`text-xs mt-0.5 ${
                    (daysUntilPurge ?? 999) === 0
                      ? "text-red-500 font-medium"
                      : (daysUntilPurge ?? 999) <= 7
                      ? "text-amber-500"
                      : "text-gray-400"
                  }`}>
                    {daysUntilPurge === 0
                      ? "⚠️ Eligible for purge now"
                      : `Auto-purge in ${daysUntilPurge}d`}
                  </p>
                </>
              ) : (
                <p className="text-xs text-green-600 font-medium">✓ No orders pending purge</p>
              )}
            </div>
          </div>

          {/* E3 — Force Clean button */}
          <div className="ml-auto flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400">
              {(stats.Delivered ?? 0) + (stats.Retour ?? 0) + (stats.Cancelled ?? 0)} total
            </span>

            {!showConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Force Clean
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-xs text-red-800 font-medium whitespace-nowrap">
                  Delete {preview?.eligibleCount ?? 0} orders older than 60 days?
                </p>
                <Button
                  size="sm"
                  onClick={handleForceClean}
                  disabled={isCleaning || (preview?.eligibleCount ?? 0) === 0}
                  className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs px-3 shrink-0"
                >
                  {isCleaning ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirm(false)}
                  className="h-7 text-xs px-2 shrink-0"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─ Filter chips ────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filter === value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-1">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ─ Table ───────────────────────────────────────────────────────────────────────── */}
      <OrderTable orders={filtered} onOrderClick={onOrderClick} />

    </div>
  );
}
