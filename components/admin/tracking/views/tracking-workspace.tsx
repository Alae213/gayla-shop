"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingPanel } from "@/components/admin/tracking/ui/tracking-panel";
import { Search, LayoutGrid, LayoutList, Ban, ArrowDownUp, Filter, DatabaseZap } from "lucide-react";
import { TrackingKanbanBoard } from "@/components/admin/tracking/views/tracking-kanban-board";
import { TrackingListView } from "@/components/admin/tracking/views/tracking-list-view";
import { TrackingOrderDetails } from "@/components/admin/tracking/views/tracking-order-details";
import { TrackingBulkActionBar } from "@/components/admin/tracking/views/tracking-bulk-action-bar";
import { toast } from "sonner";

type TrackingView = "kanban" | "list" | "blacklist";
type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked";

// ─── Client-side status normalizer (mirrors convex/orders.ts) ───────────────────
function normalizeLegacyStatus(status: string | undefined): MVPStatus {
  switch (status) {
    case "new":       return "new";
    case "confirmed": return "confirmed";
    case "packaged":  return "packaged";
    case "shipped":   return "shipped";
    case "canceled":  return "canceled";
    case "blocked":   return "blocked";
    // Legacy
    case "Pending":          return "new";
    case "Confirmed":         return "confirmed";
    case "Called no respond": return "new";
    case "Called 01":         return "new";
    case "Called 02":         return "new";
    case "Packaged":          return "packaged";
    case "Shipped":           return "shipped";
    case "Delivered":         return "shipped";
    case "Retour":            return "canceled";
    case "Cancelled":         return "canceled";
    default:                  return "new";
  }
}

const ACTIVE_STATUSES  = new Set<MVPStatus>(["new", "confirmed", "packaged", "shipped"]);
const TERMINAL_STATUSES = new Set<MVPStatus>(["canceled", "blocked"]);

export function TrackingWorkspace() {
  const [view, setView] = useState<TrackingView>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<Id<"orders">>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const orders = useQuery(api.orders.list, {});
  const selectedOrder = useQuery(
    api.orders.getById,
    selectedOrderId ? { id: selectedOrderId } : "skip"
  );

  const bulkConfirm          = useMutation(api.orders.bulkConfirm);
  const migrateOrderStatuses = useMutation(api.orders.migrateOrderStatuses);

  // ── Normalize + partition all orders ─────────────────────────────────────────
  const enrichedOrders = orders?.map(o => ({
    ...o,
    _normalizedStatus: normalizeLegacyStatus(o.status),
  }));

  // Check if any order has a legacy status that needs migration
  const MVP_STATUSES = ["new", "confirmed", "packaged", "shipped", "canceled", "blocked"];
  const hasLegacyOrders = orders?.some(o => !MVP_STATUSES.includes(o.status ?? ""));

  const activeOrders    = enrichedOrders?.filter(o => ACTIVE_STATUSES.has(o._normalizedStatus));
  const blacklistOrders = enrichedOrders?.filter(o => TERMINAL_STATUSES.has(o._normalizedStatus));

  // Search filter
  const query = searchQuery.toLowerCase();
  const filteredActive = activeOrders?.filter(o =>
    o.orderNumber.toLowerCase().includes(query) ||
    o.customerName.toLowerCase().includes(query) ||
    (o.customerPhone || "").includes(searchQuery)
  );
  const filteredBlacklist = blacklistOrders?.filter(o =>
    o.orderNumber.toLowerCase().includes(query) ||
    o.customerName.toLowerCase().includes(query) ||
    (o.customerPhone || "").includes(searchQuery)
  );

  // ── Selection handlers ───────────────────────────────────────────────────
  const handleToggleSelect = (id: Id<"orders">) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: Id<"orders">[]) => {
    const allSelected = ids.every(id => selectedOrderIds.has(id));
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (allSelected) ids.forEach(id => next.delete(id));
      else             ids.forEach(id => next.add(id));
      return next;
    });
  };

  const handleClearSelection = () => setSelectedOrderIds(new Set());

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulkConfirm = async () => {
    if (!selectedOrderIds.size) return;
    setIsProcessing(true);
    try {
      const results = await bulkConfirm({ ids: Array.from(selectedOrderIds) });
      if (results.failed === 0) toast.success(`✓ ${results.success} orders confirmed`);
      else toast.warning(`${results.success} confirmed, ${results.failed} skipped (not in “new” status)`);
      handleClearSelection();
    } catch {
      toast.error("Bulk confirm failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDispatch = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    toast.info("Yalidin integration coming soon");
    setIsProcessing(false);
  };

  const handleBulkPrint = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    toast.info("PDF label generation coming soon");
    setIsProcessing(false);
  };

  const handleBulkCancel = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    toast.error("Bulk cancel endpoint coming soon");
    setIsProcessing(false);
  };

  // ── One-time migration ────────────────────────────────────────────────────
  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateOrderStatuses({});
      if (result.migrated > 0) {
        toast.success(`✓ Migration complete: ${result.migrated} orders updated, ${result.skipped} already up-to-date`);
      } else {
        toast.success(`All ${result.skipped} orders already use MVP statuses`);
      }
    } catch (e) {
      toast.error("Migration failed — check Convex logs");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[#F5F5F5]">

      {/* ── MIGRATION BANNER (auto-shown when legacy orders detected) ────────────── */}
      {hasLegacyOrders && (
        <div className="flex items-center justify-between gap-4 px-8 py-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-[13px]">
          <div className="flex items-center gap-2">
            <DatabaseZap className="w-4 h-4 shrink-0" />
            <span><strong>{orders?.filter(o => !MVP_STATUSES.includes(o.status ?? "")).length} orders</strong> have legacy statuses from the old system. They are displayed below with their normalized status. Run migration to permanently update them.</span>
          </div>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex items-center gap-1.5 shrink-0 bg-amber-800 text-white text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-amber-900 disabled:opacity-60 transition-colors"
          >
            {isMigrating ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <DatabaseZap className="w-3.5 h-3.5" />}
            {isMigrating ? "Migrating..." : "Run Migration"}
          </button>
        </div>
      )}

      {/* ── View Controls Toolbar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#ECECEC]">
        <div className="flex items-center bg-[#F7F7F7] p-1 rounded-tracking-input border border-[#ECECEC]">
          {(["kanban", "list"] as const).map(v => (
            <button key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-tracking-input text-[14px] font-medium transition-colors ${view === v ? "bg-white text-[#3A3A3A] shadow-sm" : "text-[#AAAAAA] hover:text-[#3A3A3A]"}`}
            >
              {v === "kanban" ? <LayoutGrid className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <div className="w-[1px] h-4 bg-[#ECECEC] mx-2" />
          <button
            onClick={() => setView("blacklist")}
            className={`flex items-center gap-2 px-4 py-2 rounded-tracking-input text-[14px] font-medium transition-colors ${view === "blacklist" ? "bg-white text-rose-600 shadow-sm" : "text-[#AAAAAA] hover:text-rose-600"}`}
          >
            <Ban className="w-4 h-4" /> Blacklist
            {blacklistOrders && blacklistOrders.length > 0 && (
              <span className="ml-1 bg-rose-100 text-rose-600 text-[11px] font-bold px-1.5 py-0.5 rounded-full">{blacklistOrders.length}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-[280px] bg-[#F7F7F7] border border-[#ECECEC] rounded-tracking-input text-[14px] text-[#3A3A3A] placeholder-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] transition-all"
            />
          </div>
          <button className="p-2 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-[#F7F7F7] rounded-full transition-colors" title="Sort">
            <ArrowDownUp className="w-5 h-5" />
          </button>
          {view === "list" && (
            <button className="p-2 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-[#F7F7F7] rounded-full transition-colors" title="Filter">
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {orders === undefined ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-[#ECECEC] border-t-[#3A3A3A] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-full p-8 min-w-[1200px]">
            {(view === "kanban" || view === "list") && (
              filteredActive?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-24">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 text-[#AAAAAA]">
                    <LayoutGrid className="w-8 h-8" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-[#3A3A3A]">No active orders</h3>
                  <p className="text-[14px] text-[#AAAAAA] mt-2 max-w-sm">
                    Orders placed from the public store will appear here.
                    {hasLegacyOrders ? " Click \"Run Migration\" above to import existing orders." : ""}
                  </p>
                </div>
              ) : view === "kanban" ? (
                <TrackingKanbanBoard
                  orders={filteredActive ?? []}
                  selectedIds={selectedOrderIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOrderClick={setSelectedOrderId}
                />
              ) : (
                <TrackingListView
                  orders={filteredActive ?? []}
                  selectedIds={selectedOrderIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOrderClick={setSelectedOrderId}
                />
              )
            )}
            {view === "blacklist" && (
              <TrackingListView
                orders={filteredBlacklist ?? []}
                selectedIds={selectedOrderIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOrderClick={setSelectedOrderId}
                isBlacklist
              />
            )}
          </div>
        )}
      </div>

      {/* ── Bulk Action Bar ───────────────────────────────────────────────── */}
      {selectedOrderIds.size > 0 && (
        <TrackingBulkActionBar
          selectedIds={selectedOrderIds}
          onClearSelection={handleClearSelection}
          onBulkConfirm={handleBulkConfirm}
          onBulkDispatch={handleBulkDispatch}
          onBulkPrint={handleBulkPrint}
          onBulkCancel={handleBulkCancel}
          isProcessing={isProcessing}
        />
      )}

      {/* ── Right Panel ─────────────────────────────────────────────────────── */}
      <TrackingPanel
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Loading..."}
      >
        {selectedOrder ? (
          <TrackingOrderDetails
            order={{ ...selectedOrder, _normalizedStatus: normalizeLegacyStatus(selectedOrder.status) }}
            onClose={() => setSelectedOrderId(null)}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#ECECEC] border-t-[#3A3A3A] rounded-full animate-spin" />
          </div>
        )}
      </TrackingPanel>
    </div>
  );
}