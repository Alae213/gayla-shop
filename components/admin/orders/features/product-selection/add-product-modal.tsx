"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, X } from "lucide-react";
import { LineItem } from "../line-items/line-item-row";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (item: LineItem) => void;
}

export function AddProductModal({ open, onClose, onAddProduct }: AddProductModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const products = useQuery(api.products.list, { status: "Active" });

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => p.title.toLowerCase().includes(query) || (p.category?.toLowerCase() || "").includes(query));
  }, [products, searchQuery]);

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    if (product.variantGroups && product.variantGroups.length > 0) {
      const initialVariants: Record<string, string> = {};
      product.variantGroups.forEach((group: any) => { const firstEnabled = group.values.find((v: any) => v.enabled); if (firstEnabled) initialVariants[group.name.toLowerCase()] = firstEnabled.label; });
      setSelectedVariants(initialVariants);
    } else setSelectedVariants({});
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;
    const lineItem: LineItem = {
      productId: selectedProduct._id, productName: selectedProduct.title, productSlug: selectedProduct.slug,
      quantity: 1, unitPrice: selectedProduct.price, lineTotal: selectedProduct.price,
      variants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
      thumbnail: selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0].url : undefined,
    };
    onAddProduct(lineItem);
    setSelectedProduct(null); setSelectedVariants({}); setSearchQuery("");
  };

  const handleClose = () => { setSelectedProduct(null); setSelectedVariants({}); setSearchQuery(""); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>Add Product to Order</DialogTitle></DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search active products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {!selectedProduct ? (
            <div className="space-y-2">
              {filteredProducts?.map((product) => (
                <button key={product._id} onClick={() => handleSelectProduct(product)} className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors text-left">
                  {product.images && product.images.length > 0 ? <img src={product.images[0].url} alt={product.title} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-muted-foreground text-[10px]">No image</div>}
                  <div className="flex-1 min-w-0"><h4 className="font-semibold text-sm text-foreground truncate">{product.title}</h4>{product.category && <p className="text-xs text-muted-foreground">{product.category}</p>}</div>
                  <span className="font-bold text-sm text-foreground whitespace-nowrap">{product.price.toLocaleString()} DZD</span>
                </button>
              ))}
              {filteredProducts?.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Search className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm">{searchQuery ? "No active products match your search" : "No active products available"}</p></div>}
              {!products && <div className="flex items-center justify-center py-12 text-muted-foreground"><div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" /></div>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {selectedProduct.images && selectedProduct.images.length > 0 ? <img src={selectedProduct.images[0].url} alt={selectedProduct.title} className="w-16 h-16 object-cover rounded" /> : <div className="w-16 h-16 bg-secondary rounded flex items-center justify-center text-muted-foreground text-[11px]">No image</div>}
                <div className="flex-1"><h3 className="font-bold text-base text-foreground">{selectedProduct.title}</h3><p className="text-sm text-muted-foreground font-semibold">{selectedProduct.price.toLocaleString()} DZD</p></div>
                <button onClick={() => setSelectedProduct(null)} className="p-1.5 hover:bg-card rounded transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              {selectedProduct.variantGroups && selectedProduct.variantGroups.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground uppercase tracking-wider">Select Options</p>
                  {selectedProduct.variantGroups.map((group: any) => {
                    const enabledValues = group.values.filter((v: any) => v.enabled);
                    if (enabledValues.length === 0) return null;
                    return (
                      <div key={group.name}>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">{group.name}</label>
                        <div className="flex flex-wrap gap-2">
                          {enabledValues.map((value: any) => {
                            const isSelected = selectedVariants[group.name.toLowerCase()] === value.label;
                            return (
                              <button key={value.label} onClick={() => setSelectedVariants(prev => ({ ...prev, [group.name.toLowerCase()]: value.label }))} className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${isSelected ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-muted-foreground"}`}>
                                {isSelected && <Check className="inline w-3 h-3 mr-1" />}{value.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          {selectedProduct && <Button onClick={handleAddToOrder} className="flex-[2] bg-foreground hover:bg-foreground/90"><Check className="w-4 h-4 mr-2" />Add to Order</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}