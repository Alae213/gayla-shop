"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Legacy Build Mode Components
import { HeroEditor }           from "@/components/admin/hero-editor";
import { DndProductGrid }       from "@/components/admin/dnd-product-grid";
import { ProductDrawer }        from "@/components/admin/product-drawer";
import { UnsavedChangesDialog } from "@/components/admin/unsaved-changes-dialog";

// New Tracking Mode MVP Workspace
import { TrackingWorkspace } from "@/components/admin/tracking/views/tracking-workspace";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminMode = "build" | "tracking";

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  const [mode,              setMode]              = useState<AdminMode>("build");
  const [isBuildDirty,      setIsBuildDirty]      = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<AdminMode | null>(null);
  
  const [drawerOpen,        setDrawerOpen]        = useState(false);
  const [editingProductId,  setEditingProductId]  = useState<Id<"products"> | null>(null);
  const [isAddingProduct,   setIsAddingProduct]   = useState(false);
  const [isDeliverySettingsOpen, setIsDeliverySettingsOpen] = useState(false);

  const siteContent    = useQuery(api.siteContent.get);
  const products       = useQuery(api.products.list, {});
  
  const editingProduct = useQuery(
    api.products.getById,
    editingProductId ? { id: editingProductId } : "skip",
  );

  const deleteProduct  = useMutation(api.products.remove);
  const restoreProduct = useMutation(api.products.restore);
  const createEmpty    = useMutation(api.products.createEmpty);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isBuildDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isBuildDirty]);

  useEffect(() => {
    document.title = mode === "build"
      ? "Build — Gayla Admin"
      : "Tracking — Gayla Admin";
  }, [mode]);

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
    setTimeout(() => setEditingProductId(null), 350);
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

  if (siteContent === undefined || products === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-brand-200 mx-auto" />
            <Sparkles className="h-6 w-6 text-brand-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-foreground font-medium">Loading Admin Panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${mode === "tracking" ? "bg-muted flex flex-col" : "bg-background"}`}>

      {/* ══ Top Bar (Global Shell) ═════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-brand-200" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Gayla Admin</h1>
                  <p className="text-xs text-muted-foreground">Control Panel</p>
                </div>
              </div>

              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => handleModeChange(value as AdminMode)}
                className="border border-border rounded-lg p-1"
              >
                <ToggleGroupItem
                  value="build"
                  className="data-[state=on]:bg-brand-50 data-[state=on]:text-brand-200 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Build Mode
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="tracking"
                  className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground gap-2 transition-colors"
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

      {/* ══ Main Content ════════════════════════════════════════════════════════════ */}
      <main className={`flex-1 ${mode === "tracking" ? "flex flex-col overflow-hidden" : ""}`}>
        
        {/* ── BUILD MODE ──────────────────────────────────────────────────────────── */}
        {mode === "build" && (
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
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

        {/* ── TRACKING MODE (MVP Redesign) ────────────────────────────────────────── */}
        {mode === "tracking" && (
          <div className="h-[calc(100vh-80px)]"> 
            <TrackingWorkspace />
          </div>
        )}
      </main>

      {/* ══ Overlays ══════════════════════════════════════════════════════════════ */}
      {mode === "build" && (
        <ProductDrawer
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          product={(editingProduct as any) ?? null}
          onSuccess={() => {}}
        />
      )}

      <DeliverySettingsModal
        isOpen={isDeliverySettingsOpen}
        onClose={() => setIsDeliverySettingsOpen(false)}
      />

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