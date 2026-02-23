"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TrackingPanel } from "@/components/admin/tracking/ui/tracking-panel";
import { Search, LayoutGrid, LayoutList, Ban, ArrowDownUp, Filter } from "lucide-react";
import { TrackingKanbanBoard } from "@/components/admin/tracking/views/tracking-kanban-board";
import { TrackingListView } from "@/components/admin/tracking/views/tracking-list-view";
import { TrackingOrderDetails } from "@/components/admin/tracking/views/tracking-order-details";

type TrackingView = "kanban" | "list" | "blacklist";

export function TrackingWorkspace() {
  const [view, setView] = useState<TrackingView>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<Id<"orders">>>(new Set());

  // Fetch raw MVP orders
  const orders = useQuery(api.orders.list, {});
  const selectedOrder = useQuery(
    api.orders.getById,
    selectedOrderId ? { id: selectedOrderId } : "skip"
  );

  const activeOrders = orders?.filter(o => ["new", "confirmed", "packaged", "shipped"].includes(o.status ?? ""));
  const blacklistedOrders = orders?.filter(o => ["canceled", "blocked"].includes(o.status ?? ""));

  // Derived filtered state based on search query
  const filteredActiveOrders = activeOrders?.filter(o => 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerPhone.includes(searchQuery)
  );

  const filteredBlacklistedOrders = blacklistedOrders?.filter(o => 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerPhone.includes(searchQuery)
  );

  // Bulk selection handlers
  const handleToggleSelect = (id: Id<"orders">) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: Id<"orders">[]) => {
    // If all provided ids are selected, deselect them. Otherwise, select all.
    const allSelected = ids.every(id => selectedOrderIds.has(id));
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F5]">
      {/* ── View Controls Toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#ECECEC]">
        
        {/* Left: View Toggles */}
        <div className="flex items-center bg-[#F7F7F7] p-1 rounded-tracking-input border border-[#ECECEC]">
          <button 
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-tracking-input text-[14px] font-medium transition-colors ${view === "kanban" ? "bg-white text-[#3A3A3A] shadow-sm" : "text-[#AAAAAA] hover:text-[#3A3A3A]"}`}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban
          </button>
          <button 
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-tracking-input text-[14px] font-medium transition-colors ${view === "list" ? "bg-white text-[#3A3A3A] shadow-sm" : "text-[#AAAAAA] hover:text-[#3A3A3A]"}`}
          >
            <LayoutList className="w-4 h-4" /> List
          </button>
          <div className="w-[1px] h-4 bg-[#ECECEC] mx-2" />
          <button 
            onClick={() => setView("blacklist")}
            className={`flex items-center gap-2 px-4 py-2 rounded-tracking-input text-[14px] font-medium transition-colors ${view === "blacklist" ? "bg-white text-rose-600 shadow-sm" : "text-[#AAAAAA] hover:text-rose-600"}`}
          >
            <Ban className="w-4 h-4" /> Blacklist
          </button>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#AAAAAA]" />
            <input 
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* ── Main Content Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {orders === undefined ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-[#ECECEC] border-t-[#3A3A3A] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-full p-8 min-w-[1200px]">
            {view === "kanban" && (
              <TrackingKanbanBoard 
                orders={filteredActiveOrders ?? []} 
                selectedIds={selectedOrderIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOrderClick={setSelectedOrderId}
              />
            )}
            {view === "list" && (
              <TrackingListView 
                orders={filteredActiveOrders ?? []} 
                selectedIds={selectedOrderIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOrderClick={setSelectedOrderId}
              />
            )}
            {view === "blacklist" && (
              <TrackingListView 
                orders={filteredBlacklistedOrders ?? []} 
                selectedIds={selectedOrderIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOrderClick={setSelectedOrderId}
                isBlacklist={true}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Right Panel: Progressive Disclosure ──────────────────────────────── */}
      <TrackingPanel 
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Loading..."}
      >
        {selectedOrder ? (
          <TrackingOrderDetails 
            order={selectedOrder as any} 
            onClose={() => setSelectedOrderId(null)} 
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-3 border-[#ECECEC] border-t-[#3A3A3A] rounded-full animate-spin" />
          </div>
        )}
      </TrackingPanel>
    </div>
  )
}