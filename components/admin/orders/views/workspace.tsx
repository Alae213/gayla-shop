"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Panel } from "../components/panel";
import { Search, LayoutGrid, LayoutList, Ban, ArrowDownUp, Filter, DatabaseZap } from "lucide-react";
import { KanbanBoard } from "./kanban-board";
import { ListView } from "./list-view";
import { OrderDetails } from "./order-details";
import { BulkActionBar } from "./bulk-action-bar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type TrackingView = "kanban" | "list" | "blacklist";
type MVPStatus = "new" | "confirmed" | "packaged" | "shipped" | "canceled" | "blocked" | "hold";
type SortField = "date_asc" | "date_desc" | "amount_asc" | "amount_desc";

function normalizeLegacyStatus(status: string | undefined): MVPStatus {
  switch (status) {
    case "new":       return "new";
    case "confirmed": return "confirmed";
    case "packaged":  return "packaged";
    case "shipped":   return "shipped";
    case "canceled":  return "canceled";
    case "blocked":   return "blocked";
    case "hold":      return "hold";
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

const ACTIVE_STATUSES   = new Set<MVPStatus>(["new", "confirmed", "packaged", "shipped", "hold"]);
const TERMINAL_STATUSES = new Set<MVPStatus>(["canceled", "blocked"]);

export function Workspace() {
  const [view, setView]                   = useState<TrackingView>("kanban");
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<Id<"orders">>>(new Set());
  const [isProcessing, setIsProcessing]   = useState(false);
  const [isMigrating, setIsMigrating]     = useState(false);
  const [sortOrder, setSortOrder]         = useState<SortField>("date_desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [listStatusFilter, setListStatusFilter] = useState<MVPStatus | "all">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showBulkCancelDialog, setShowBulkCancelDialog] = useState(false);

  const sortDropdownRef   = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showSortDropdown &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSortDropdown(false);
      }
      if (
        showFilterDropdown &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };
    if (showSortDropdown || showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown, showFilterDropdown]);

  useEffect(() => {
    setShowSortDropdown(false);
    setShowFilterDropdown(false);
  }, [view]);

  const panelRequestCloseRef = useRef<(() => void) | null>(null);

  const handleRegisterRequestClose = useCallback((fn: () => void) => {
    panelRequestCloseRef.current = fn;
  }, []);

  const handlePanelRequestClose = useCallback(() => {
    if (panelRequestCloseRef.current) {
      panelRequestCloseRef.current();
    } else {
      setSelectedOrderId(null);
    }
  }, []);

  const handlePanelClose = useCallback(() => {
    panelRequestCloseRef.current = null;
    setSelectedOrderId(null);
  }, []);

  const handleSelectOrder = useCallback((id: Id<"orders">) => {
    panelRequestCloseRef.current = null;
    setSelectedOrderId(id);
  }, []);

  const orders = useQuery(api.orders.list, {});
  const selectedOrder = useQuery(
    api.orders.getById,
    selectedOrderId ? { id: selectedOrderId } : "skip"
  );

  useEffect(() => {
    if (!selectedOrder) return;
    const normalized = normalizeLegacyStatus(selectedOrder.status);
    if (TERMINAL_STATUSES.has(normalized)) {
      if (!panelRequestCloseRef.current) {
        setSelectedOrderId(null);
      }
    }
  }, [selectedOrder?.status]);

  const bulkConfirm          = useMutation(api.orders.bulkConfirm);
  const bulkCancel           = useMutation(api.orders.bulkCancel);
  const bulkUnblock          = useMutation(api.orders.bulkUnblock);
  const migrateOrderStatuses = useMutation(api.orders.migrateOrderStatuses);

  const enrichedOrders = orders?.map(o => ({
    ...o,
    _normalizedStatus: normalizeLegacyStatus(o.status),
  }));

  const MVP_STATUSES = ["new", "confirmed", "packaged", "shipped", "canceled", "blocked", "hold"];
  const hasLegacyOrders = orders?.some(o => !MVP_STATUSES.includes(o.status ?? ""));

  const activeOrders    = enrichedOrders?.filter(o => ACTIVE_STATUSES.has(o._normalizedStatus));
  const blacklistOrders = enrichedOrders?.filter(o => TERMINAL_STATUSES.has(o._normalizedStatus));

  const query = searchQuery.toLowerCase();
  const applySearch = (list: typeof enrichedOrders) =>
    list?.filter(o =>
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      (o.customerPhone || "").includes(searchQuery)
    );

  const filteredActive    = applySearch(activeOrders);
  const filteredBlacklist = applySearch(blacklistOrders);

  const sortFn = (a: any, b: any) => {
    switch (sortOrder) {
      case "date_asc":    return a._creationTime - b._creationTime;
      case "date_desc":   return b._creationTime - a._creationTime;
      case "amount_asc":  return (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
      case "amount_desc": return (b.totalAmount ?? 0) - (a.totalAmount ?? 0);
    }
  };
  const sortedActive = filteredActive ? [...filteredActive].sort(sortFn) : [];

  const filteredForList = listStatusFilter === "all"
    ? sortedActive
    : sortedActive.filter(o => o._normalizedStatus === listStatusFilter);

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

  const handleBulkConfirm = async () => {
    if (!selectedOrderIds.size) return;
    setIsProcessing(true);
    try {
      const results = await bulkConfirm({ ids: Array.from(selectedOrderIds) });
      if (results.failed === 0) toast.success(`\u2713 ${results.success} orders confirmed`);
      else toast.warning(`${results.success} confirmed, ${results.failed} failed`);
      handleClearSelection();
    } catch {
      toast.error("Bulk confirm failed", {
        action: { label: "Retry", onClick: handleBulkConfirm },
      });
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

  const handleBulkCancel = () => {
    if (!selectedOrderIds.size) return;
    setShowBulkCancelDialog(true);
  };

  const executeBulkCancel = async () => {
    setShowBulkCancelDialog(false);
    setIsProcessing(true);
    try {
      const results = await bulkCancel({
        ids: Array.from(selectedOrderIds),
        reason: "Bulk canceled by admin",
      });
      const parts: string[] = [];
      if (results.success > 0) parts.push(`${results.success} canceled`);
      if (results.skipped  > 0) parts.push(`${results.skipped} already terminal`);
      if (results.failed   > 0) parts.push(`${results.failed} failed`);
      if (results.failed > 0) {
        toast.warning(parts.join(" \u00b7 "));
      } else {
        toast.success(`\u2713 ${parts.join(" \u00b7 ")}`);
      }
      handleClearSelection();
    } catch {
      toast.error("Bulk cancel failed", {
        action: { label: "Retry", onClick: executeBulkCancel },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUnblock = async () => {
    if (!selectedOrderIds.size) return;
    setIsProcessing(true);
    try {
      const results = await bulkUnblock({ ids: Array.from(selectedOrderIds) });
      if (results.failed === 0) toast.success(`\u2713 ${results.success} customers unblocked`);
      else toast.warning(`${results.success} unblocked, ${results.failed} failed`);
      handleClearSelection();
    } catch {
      toast.error("Bulk unblock failed", {
        action: { label: "Retry", onClick: handleBulkUnblock },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateOrderStatuses({});
      if (result.migrated > 0) {
        toast.success(`\u2713 Migration complete: ${result.migrated} orders updated, ${result.skipped} already up-to-date`);
      } else {
        toast.success(`All ${result.skipped} orders already use MVP statuses`);
      }
    } catch {
      toast.error("Migration failed \u2014 check Convex logs");
    } finally {
      setIsMigrating(false);
    }
  };

  const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: "date_desc",   label: "Newest first" },
    { value: "date_asc",    label: "Oldest first" },
    { value: "amount_desc", label: "Highest value first" },
    { value: "amount_asc",  label: "Lowest value first" },
  ];

  const FILTER_OPTIONS: { value: MVPStatus | "all"; label: string }[] = [
    { value: "all",       label: "All statuses" },
    { value: "new",       label: "New" },
    { value: "confirmed", label: "Confirmed" },
    { value: "packaged",  label: "Packaged" },
    { value: "shipped",   label: "Shipped" },
    { value: "hold",      label: "Hold" },
  ];

  return (
    <div className="relative flex flex-col h-full w-full bg-background">

      <AlertDialog open={showBulkCancelDialog} onOpenChange={setShowBulkCancelDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <Trash2 className="h-5 w-5 shrink-0" />
              <AlertDialogTitle className="text-destructive">
                Cancel {selectedOrderIds.size} order{selectedOrderIds.size !== 1 ? "s" : ""}?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This will move all selected orders to <strong>Canceled</strong>. Shipped orders will be skipped. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep them</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkCancel}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, cancel all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {hasLegacyOrders && (
        <div className="flex items-center justify-between gap-4 px-8 py-3 bg-warning/10 border-b border-warning/20 text-warning-foreground text-sm">
          <div className="flex items-center gap-2">
            <DatabaseZap className="w-4 h-4 shrink-0" />
            <span>
              <strong>
                {orders?.filter(o => !MVP_STATUSES.includes(o.status ?? "")).length} orders
              </strong>{" "}
              have legacy statuses. Run migration to permanently update them.
            </span>
          </div>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex items-center gap-1.5 shrink-0 bg-warning text-warning-foreground text-sm font-medium px-4 py-1.5 rounded-full hover:bg-warning/90 disabled:opacity-60 transition-colors"
          >
            {isMigrating
              ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <DatabaseZap className="w-3.5 h-3.5" />}
            {isMigrating ? "Migrating..." : "Run Migration"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
        <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
          {(["kanban", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === v
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "kanban"
                ? <LayoutGrid className="w-4 h-4" />
                : <LayoutList className="w-4 h-4" />}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <div className="w-[1px] h-4 bg-border mx-2" />
          <button
            onClick={() => setView("blacklist")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "blacklist"
                ? "bg-card text-destructive shadow-sm"
                : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <Ban className="w-4 h-4" /> Blacklist
            {blacklistOrders && blacklistOrders.length > 0 && (
              <span className="ml-1 bg-destructive/10 text-destructive text-xs font-bold px-1.5 py-0.5 rounded-full">
                {blacklistOrders.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search orders"
              className="pl-9 pr-4 py-2 w-[280px] bg-muted border border-input rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div ref={sortDropdownRef} className="relative">
            <button
              aria-label="Sort orders"
              aria-expanded={showSortDropdown}
              aria-haspopup="listbox"
              title="Sort"
              onClick={() => { setShowSortDropdown(p => !p); setShowFilterDropdown(false); }}
              className={`p-2 rounded-full transition-colors ${
                showSortDropdown
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ArrowDownUp className="w-5 h-5" />
            </button>
            {showSortDropdown && (
              <div
                role="listbox"
                aria-label="Sort options"
                className="absolute right-0 top-11 bg-card border border-border rounded-xl shadow-md p-2 z-50 flex flex-col gap-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={sortOrder === opt.value}
                    onClick={() => { setSortOrder(opt.value); setShowSortDropdown(false); }}
                    className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      sortOrder === opt.value
                        ? "bg-secondary font-semibold text-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {view === "list" && (
            <div ref={filterDropdownRef} className="relative">
              <button
                aria-label="Filter orders"
                aria-expanded={showFilterDropdown}
                aria-haspopup="listbox"
                title="Filter"
                onClick={() => { setShowFilterDropdown(p => !p); setShowSortDropdown(false); }}
                className={`p-2 rounded-full transition-colors ${
                  showFilterDropdown
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              {showFilterDropdown && (
                <div
                  role="listbox"
                  aria-label="Filter options"
                  className="absolute right-0 top-11 bg-card border border-border rounded-xl shadow-md p-2 z-50 flex flex-col gap-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-150"
                >
                  {FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      role="option"
                      aria-selected={listStatusFilter === opt.value}
                      onClick={() => { setListStatusFilter(opt.value); setShowFilterDropdown(false); }}
                      className={`text-left px-3 py-2 text-sm rounded-lg transition-colors capitalize ${
                        listStatusFilter === opt.value
                          ? "bg-secondary font-semibold text-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {orders === undefined ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-full p-8 min-w-[1200px]">
            {(view === "kanban" || view === "list") && (
              sortedActive.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-24">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <LayoutGrid className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No active orders</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Orders placed from the public store will appear here.
                  </p>
                </div>
              ) : view === "kanban" ? (
                <KanbanBoard
                  orders={sortedActive}
                  selectedIds={selectedOrderIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOrderClick={handleSelectOrder}
                  blacklistCount={blacklistOrders?.length ?? 0}
                />
              ) : (
                <ListView
                  orders={filteredForList}
                  selectedIds={selectedOrderIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOrderClick={handleSelectOrder}
                />
              )
            )}
            {view === "blacklist" && (
              <ListView
                orders={filteredBlacklist ?? []}
                selectedIds={selectedOrderIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOrderClick={handleSelectOrder}
                isBlacklist
              />
            )}
          </div>
        )}
      </div>

      {selectedOrderIds.size > 0 && (
        <BulkActionBar
          selectedIds={selectedOrderIds}
          onClearSelection={handleClearSelection}
          onBulkConfirm={handleBulkConfirm}
          onBulkDispatch={handleBulkDispatch}
          onBulkPrint={handleBulkPrint}
          onBulkCancel={handleBulkCancel}
          onBulkUnblock={handleBulkUnblock}
          isProcessing={isProcessing}
          isBlacklist={view === "blacklist"}
        />
      )}

      <Panel
        isOpen={selectedOrderId !== null}
        onClose={handlePanelClose}
        onRequestClose={handlePanelRequestClose}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Loading..."}
      >
        {selectedOrder ? (
          <OrderDetails
            order={{ ...selectedOrder, _normalizedStatus: normalizeLegacyStatus(selectedOrder.status) }}
            onClose={handlePanelClose}
            onRegisterRequestClose={handleRegisterRequestClose}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        )}
      </Panel>
    </div>
  );
}
