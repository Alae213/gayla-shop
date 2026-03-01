"use client";

import { Shield, Info, AlertTriangle } from "lucide-react";
import type { Order } from "../types";

interface OrderDrawerRiskProps {
  order: Order;
  isBanning: boolean;
  onToggleBan: () => void;
}

/**
 * OrderDrawer Risk Section
 * 
 * Displays fraud score and ban toggle for customer risk management.
 */
export function OrderDrawerRisk({ order, isBanning, onToggleBan }: OrderDrawerRiskProps) {
  const fraudScore = order.fraudScore ?? 0;
  const isBanned = order.isBanned ?? false;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Shield className="h-4 w-4 text-gray-500" /> Customer Risk
      </h3>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Fraud score:</span>
          <span
            className={`font-bold text-sm ${
              fraudScore >= 3 ? "text-red-600" : fraudScore >= 1 ? "text-orange-500" : "text-green-600"
            }`}
          >
            {fraudScore}
          </span>
          <span
            className={`text-xs ${
              fraudScore >= 3 ? "text-red-500" : fraudScore >= 1 ? "text-orange-400" : "text-green-500"
            }`}
          >
            {fraudScore >= 3 ? "— High Risk" : fraudScore >= 1 ? "— Caution" : "— Safe"}
          </span>
          <span className="relative group cursor-help">
            <Info className="h-3.5 w-3.5 text-gray-400" />
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-gray-900 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-50">
              Increments when orders from this phone are cancelled or returned repeatedly.
            </span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{isBanned ? "Banned" : "Active"}</span>
            <button
              onClick={onToggleBan}
              disabled={isBanning}
              aria-label={isBanned ? "Unban this customer" : "Ban this customer"}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400
                disabled:opacity-60 ${isBanned ? "bg-red-500" : "bg-gray-300"}`}
            >
              <span
                className={`mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm
                transform transition-transform duration-200 ${
                  isBanned ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <p
            className={`text-xs max-w-[160px] text-right leading-snug ${
              isBanned ? "text-red-600" : "text-gray-400"
            }`}
          >
            {isBanned
              ? "Future orders from this number are auto-cancelled."
              : "Banning blocks all future orders from this number."}
          </p>
        </div>
      </div>
      {order.courierError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">Courier error: {order.courierError}</p>
        </div>
      )}
    </div>
  );
}
