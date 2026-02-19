"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { OrderTable } from "./order-table";

type ArchiveFilter = "all" | "Delivered" | "Retour" | "Cancelled";

const FILTER_OPTIONS: { value: ArchiveFilter; label: string }[] = [
  { value: "all",       label: "All Terminal" },
  { value: "Delivered", label: "Delivered"    },
  { value: "Retour",    label: "Retour"       },
  { value: "Cancelled", label: "Cancelled"    },
];

interface OrderArchiveProps {
  orders: any[]; // pass-through to OrderTable — typed loosely to avoid duplication
  stats: {
    Delivered?: number;
    Retour?: number;
    Cancelled?: number;
  };
  onOrderClick: (id: Id<"orders">) => void;
}

export function OrderArchive({ orders, stats, onOrderClick }: OrderArchiveProps) {
  const [filter, setFilter] = useState<ArchiveFilter>("all");

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">

      {/* ─ Stat bar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
        <div className="flex flex-wrap items-center gap-8">

          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {stats.Delivered ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Delivered</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-3">
            <RotateCcw className="h-6 w-6 text-slate-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {stats.Retour ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Retour</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {stats.Cancelled ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Cancelled</p>
            </div>
          </div>

          <div className="ml-auto text-xs text-gray-400">
            {(stats.Delivered ?? 0) + (stats.Retour ?? 0) + (stats.Cancelled ?? 0)} total
            terminal orders
          </div>

        </div>
      </div>

      {/* ─ Filter chips ────────────────────────────────────────────────────────── */}
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

      {/* ─ Table ─────────────────────────────────────────────────────────────────── */}
      <OrderTable orders={filtered} onOrderClick={onOrderClick} />

    </div>
  );
}
