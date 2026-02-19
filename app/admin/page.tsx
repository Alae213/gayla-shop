"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeliverySettingsModal } from "@/components/admin/delivery-settings-modal";
import { Settings } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Sparkles,
  Package,
  LogOut,
  Search,
  LayoutGrid,
  LayoutList,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { StatsCards }           from "@/components/admin/stats-cards";
import { HeroEditor }           from "@/components/admin/hero-editor";
import { DndProductGrid }       from "@/components/admin/dnd-product-grid";
import { ProductDrawer }        from "@/components/admin/product-drawer";
import { OrderKanban }          from "@/components/admin/order-kanban";
import { OrderTable }           from "@/components/admin/order-table";
import { OrderArchive }         from "@/components/admin/order-archive";
import { OrderDrawer }          from "@/components/admin/order-drawer";
import { UnsavedChangesDialog } from "@/components/admin/unsaved-changes-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminMode    = "build" | "tracking";
type TrackingView = "kanban" | "table" | "archive";

type OrderStatus =
  | "Pending" | "Confirmed" | "Called no respond"
  | "Called 01" | "Called 02" | "Cancelled"
  | "Packaged" | "Shipped" | "Delivered" | "Retour";

type DateFilter = "all" | "today" | "week" | "month";

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all",   label: "All"        },
  { value: "today", label: "Today"      },
  { value: "week",  label: "This week"  },
  { value: "month", label: "This month" },
];

const TERMINAL_STATUSES: OrderStatus[] = ["Delivered", "Retour", "Cancelled"];

function getDateBoundary(filter: DateFilter): number | null {
  if (filter === "all") return null;
  const now = new Date();
  if (filter === "today")
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (filter === "week") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff).getTime();
  }
  if (filter === "month")
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  // ── Mode & view
  const [mode,              setMode]              = useState<AdminMode>("build");
  const [trackingView,      setTrackingView]      = useState<TrackingView>("kanban");

  // ── Unsaved-state guard for HeroEditor
  const [isBuildDirty,      setIsBuildDirty]      = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<AdminMode | null>(null);

  // ── Order state
  const [searchQuery,     setSearchQuery]     = useState("");
  const [dateFilter,      setDateFilter]      = useState<DateFilter>("week");
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);

  // ── Product drawer state
  const [drawerOpen,       setDrawerOpen]       = useState(false);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);
  const [isAddingProduct,  setIsAddingProduct]  = useState(false);

  // ── Delivery settings
  const [isDeliverySettingsOpen, setIsDeliverySettingsOpen] = useState(false);

  // ── Convex queries
  const siteContent   = useQuery(api.siteContent.get);
  const products      = useQuery(api.products.list, {});
  const orders        = useQuery(api.orders.list, {});
  const orderStats    = useQuery(api.orders.getStats);
  const selectedOrder = useQuery(
    api.orders.getById,
    selectedOrderId ? { id: selectedOrderId } : "skip",
  );
  const editingProduct = useQuery(
    api.products.getById,
    editingProductId ? { id: editingProductId } : "skip",
  );

  // ── Mutations
  const deleteProduct  = useMutation(api.products.remove);
  const restoreProduct = useMutation(api.products.restore);
  const createEmpty    = useMutation(api.products.createEmpty);

  // ── beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isBuildDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isBuildDirty]);

  // ── Reactive document.title
  useEffect(() => {
    document.title = mode === "build"
      ? "Build — Gayla Admin"
      : "Tracking — Gayla Admin";
  }, [mode]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  /**
   * "+ Add Product" card click:
   * 1. Fire createEmpty mutation → instant Draft DB record.
   * 2. Open ProductDrawer pointing at the new record.
   * The spinner on the + card stays while mutation is in flight.
   */
  const handleAddProduct = async () => {
    setIsAddingProduct(true);
    try {
      const { id } = await createEmpty();
      setEditingProductId(id);
      setDrawerOpen(true);
    } catch (err: any) {
      toast.error(err.message ?? "Could not create product");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleEditProduct = (productId: Id<"products">) => {
    setEditingProductId(productId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setEditingProductId(null), 350); // wait for slide-out
  };

  const handleDeleteProduct = async (productId: Id<"products">) => {
    try {
      await deleteProduct({ id: productId });
      toast("Product removed from catalog", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await restoreProduct({ id: productId });
              toast.success("Product restored!");
            } catch (e: any) {
              toast.error(e.message || "Failed to restore");
            }
          },
        },
        duration: 5000,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  // Gated mode switch — shows UnsavedChangesDialog if HeroEditor has open edits
  const handleModeChange = (newMode: AdminMode) => {
    if (!newMode) return;
    if (mode === "build" && isBuildDirty) {
      setPendingModeSwitch(newMode);
      return;
    }
    setMode(newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  // ── Order filters
  const dateBoundary = getDateBoundary(dateFilter);
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesDate = dateBoundary === null || order._creationTime >= dateBoundary;
    return matchesSearch && matchesDate;
  });
  const activeOrders  = filteredOrders?.filter((o) => !TERMINAL_STATUSES.includes(o.status as OrderStatus));
  const archiveOrders = filteredOrders?.filter((o) =>  TERMINAL_STATUSES.includes(o.status as OrderStatus));

  // ── Loading
  if (siteContent === undefined || products === undefined || orders === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
            <Sparkles className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading Admin Panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* ══ Top Bar ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gayla Admin</h1>
                  <p className="text-xs text-gray-500">Control Panel</p>
                </div>
              </div>

              {/* Mode toggle */}
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => handleModeChange(value as AdminMode)}
                className="border border-gray-200 rounded-lg p-1"
              >
                <ToggleGroupItem
                  value="build"
                  className="data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Build Mode
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="tracking"
                  className="data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 gap-2"
                >
                  <Package className="h-4 w-4" />
                  Tracking Mode
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex items-center gap-3">
              {mode === "tracking" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeliverySettingsOpen(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Delivery Settings
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Main Content ═════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── BUILD MODE ──────────────────────────────────────────────────── */}
        {mode === "build" && (
          <div className="space-y-8">
            <HeroEditor
              siteContent={siteContent}
              onDirtyChange={setIsBuildDirty}
            />

            <DndProductGrid
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAdd={handleAddProduct}
              isAddingProduct={isAddingProduct}
            />
          </div>
        )}

        {/* ── TRACKING MODE ───────────────────────────────────────────────── */}
        {mode === "tracking" && (
          <div className="space-y-6">
            <StatsCards mode="tracking" orderStats={orderStats} />

            {/* Search + date filter + view toggle */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, phone or order #…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {DATE_FILTER_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDateFilter(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      dateFilter === value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="ml-auto">
                <ToggleGroup
                  type="single"
                  value={trackingView}
                  onValueChange={(value) => value && setTrackingView(value as TrackingView)}
                  className="border border-gray-200 rounded-lg p-1"
                >
                  <ToggleGroupItem value="kanban"  className="gap-1.5 text-xs">
                    <LayoutGrid className="h-4 w-4" />Kanban
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table"   className="gap-1.5 text-xs">
                    <LayoutList className="h-4 w-4" />Table
                  </ToggleGroupItem>
                  <ToggleGroupItem value="archive" className="gap-1.5 text-xs">
                    <Archive className="h-4 w-4" />Archive
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {trackingView === "kanban"  && (
              <OrderKanban
                orders={activeOrders ?? []}
                onOrderClick={(id) => setSelectedOrderId(id)}
              />
            )}
            {trackingView === "table" && (
              <OrderTable
                orders={activeOrders ?? []}
                onOrderClick={(id) => setSelectedOrderId(id)}
              />
            )}
            {trackingView === "archive" && (
              <OrderArchive
                orders={archiveOrders ?? []}
                stats={{
                  Delivered: orderStats?.Delivered,
                  Retour:    orderStats?.Retour,
                  Cancelled: orderStats?.Cancelled,
                }}
                onOrderClick={(id) => setSelectedOrderId(id)}
              />
            )}
          </div>
        )}
      </div>

      {/* ══ Overlays ══════════════════════════════════════════════════════════ */}

      {/* Product drawer — replaces ProductModal */}
      <ProductDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        product={(editingProduct as any) ?? null}
        onSuccess={() => {}}
      />

      {/* Order drawer */}
      <OrderDrawer
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        order={(selectedOrder as any) ?? null}
        onSuccess={() => {}}
      />

      {/* Delivery settings */}
      <DeliverySettingsModal
        isOpen={isDeliverySettingsOpen}
        onClose={() => setIsDeliverySettingsOpen(false)}
      />

      {/* Unsaved-changes guard */}
      <UnsavedChangesDialog
        open={pendingModeSwitch !== null}
        onLeave={() => {
          setIsBuildDirty(false);
          setMode(pendingModeSwitch!);
          setPendingModeSwitch(null);
        }}
        onStay={() => setPendingModeSwitch(null)}
      />
    </div>
  );
}
