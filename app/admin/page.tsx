"use client";

import { useState } from "react";
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

// Components
import { StatsCards }   from "@/components/admin/stats-cards";
import { HeroEditor }   from "@/components/admin/hero-editor";
import { ProductGrid }  from "@/components/admin/product-grid";
import { ProductModal } from "@/components/admin/product-modal";
import { OrderKanban }  from "@/components/admin/order-kanban";
import { OrderTable }   from "@/components/admin/order-table";
import { OrderArchive } from "@/components/admin/order-archive";
import { OrderDrawer }  from "@/components/admin/order-drawer";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminMode    = "build" | "tracking";
type TrackingView = "kanban" | "table" | "archive";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Called 01"
  | "Called 02"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered"
  | "Retour";

type DateFilter = "all" | "today" | "week" | "month";

/** F4 — date filter config */
const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all",   label: "All"        },
  { value: "today", label: "Today"      },
  { value: "week",  label: "This week"  },
  { value: "month", label: "This month" },
];

/** Terminal statuses shown only in the Archive tab, never on the active board. */
const TERMINAL_STATUSES: OrderStatus[] = ["Delivered", "Retour", "Cancelled"];

// ─── F4: date boundary helpers ────────────────────────────────────────────────

function getDateBoundary(filter: DateFilter): number | null {
  if (filter === "all") return null;
  const now = new Date();
  if (filter === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return start.getTime();
  }
  if (filter === "week") {
    // Last Monday 00:00 local
    const day  = now.getDay(); // 0=Sun … 6=Sat
    const diff = (day === 0 ? 6 : day - 1); // days since Monday
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    return monday.getTime();
  }
  if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return start.getTime();
  }
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  // ─ Mode & View state ────────────────────────────────────────────────────────
  const [mode,         setMode]         = useState<AdminMode>("build");
  const [trackingView, setTrackingView] = useState<TrackingView>("kanban");

  // ─ Order state ───────────────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [dateFilter,      setDateFilter]      = useState<DateFilter>("week"); // F4 default
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);

  // ─ Product modal state ───────────────────────────────────────────────────────
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId,   setEditingProductId]   = useState<Id<"products"> | null>(null);

  // ─ Delivery settings state ───────────────────────────────────────────────────
  const [isDeliverySettingsOpen, setIsDeliverySettingsOpen] = useState(false);

  // ─ Convex queries ────────────────────────────────────────────────────────────
  const siteContent    = useQuery(api.siteContent.get);
  const products       = useQuery(api.products.list, {});
  const orders         = useQuery(api.orders.list, {});
  const orderStats     = useQuery(api.orders.getStats);
  const selectedOrder  = useQuery(
    api.orders.getById,
    selectedOrderId ? { id: selectedOrderId } : "skip",
  );
  const editingProduct = useQuery(
    api.products.getById,
    editingProductId ? { id: editingProductId } : "skip",
  );

  // ─ Mutations ─────────────────────────────────────────────────────────────────
  const deleteProduct = useMutation(api.products.remove);

  // ─ Handlers ──────────────────────────────────────────────────────────────────
  const handleAddProduct = () => {
    setEditingProductId(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (productId: Id<"products">) => {
    setEditingProductId(productId);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setTimeout(() => setEditingProductId(null), 300);
  };

  const handleDeleteProduct = async (productId: Id<"products">) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct({ id: productId });
      toast.success("Product deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  // ─ F4: filter orders by date + search ────────────────────────────────────────
  const dateBoundary = getDateBoundary(dateFilter);

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesDate =
      dateBoundary === null || order._creationTime >= dateBoundary;
    return matchesSearch && matchesDate;
  });

  // Active pipeline — feeds Kanban and Table views
  const activeOrders  = filteredOrders?.filter(
    (o) => !TERMINAL_STATUSES.includes(o.status as OrderStatus),
  );
  // Archive — feeds the Archive tab
  const archiveOrders = filteredOrders?.filter(
    (o) => TERMINAL_STATUSES.includes(o.status as OrderStatus),
  );

  // ─ Loading ───────────────────────────────────────────────────────────────────
  if (siteContent === undefined || products === undefined || orders === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
            <Sparkles className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* ══ Top Bar ═════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gayla Admin</h1>
                  <p className="text-xs text-gray-500">Control Panel</p>
                </div>
              </div>

              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => value && setMode(value as AdminMode)}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Main Content ════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ══ BUILD MODE ══════════════════════════════════════════════════════ */}
        {mode === "build" && (
          <div className="space-y-8">
            <StatsCards mode="build" siteContent={siteContent} products={products} />
            <HeroEditor siteContent={siteContent} onSave={() => {}} />
            <ProductGrid
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAdd={handleAddProduct}
            />
          </div>
        )}

        {/* ══ TRACKING MODE ═══════════════════════════════════════════════════ */}
        {mode === "tracking" && (
          <div className="space-y-6">
            <StatsCards mode="tracking" orderStats={orderStats} />

            {/* ─ Toolbar ────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 flex-wrap">

              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, phone or order #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* F4 — date filter chips (replaces old status <Select>) */}
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

              {/* View toggle */}
              <div className="ml-auto">
                <ToggleGroup
                  type="single"
                  value={trackingView}
                  onValueChange={(value) =>
                    value && setTrackingView(value as TrackingView)
                  }
                  className="border border-gray-200 rounded-lg p-1"
                >
                  <ToggleGroupItem value="kanban" className="gap-1.5 text-xs">
                    <LayoutGrid className="h-4 w-4" />
                    Kanban
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" className="gap-1.5 text-xs">
                    <LayoutList className="h-4 w-4" />
                    Table
                  </ToggleGroupItem>
                  <ToggleGroupItem value="archive" className="gap-1.5 text-xs">
                    <Archive className="h-4 w-4" />
                    Archive
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* ─ Active pipeline views ──────────────────────────────────────── */}
            {trackingView === "kanban" && (
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

            {/* ─ Archive tab ─────────────────────────────────────────────────── */}
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

      {/* ══ Overlays ════════════════════════════════════════════════════════════ */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        product={editingProduct ?? null}
        onSuccess={() => {}}
      />

      <OrderDrawer
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        order={(selectedOrder as any) ?? null}
        onSuccess={() => {}}
      />

      <DeliverySettingsModal
        isOpen={isDeliverySettingsOpen}
        onClose={() => setIsDeliverySettingsOpen(false)}
      />
    </div>
  );
}
