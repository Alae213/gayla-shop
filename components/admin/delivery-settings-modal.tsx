"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface DeliverySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeliverySettingsModal({ isOpen, onClose }: DeliverySettingsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editedCosts, setEditedCosts] = useState<Record<string, { domicile: number; stopdesk: number }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const deliveryCosts = useQuery(api.deliveryCosts.list);
  const updateCost = useMutation(api.deliveryCosts.update);
  const initializeDefaults = useMutation(api.deliveryCosts.initializeDefaults);

  useEffect(() => {
    if (deliveryCosts) {
      const costs: Record<string, { domicile: number; stopdesk: number }> = {};
      deliveryCosts.forEach((cost) => {
        costs[cost._id] = {
          domicile: cost.domicileCost,
          stopdesk: cost.stopdeskCost,
        };
      });
      setEditedCosts(costs);
    }
  }, [deliveryCosts]);

  const filteredCosts = deliveryCosts?.filter((cost) =>
    cost.wilayaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (id: string) => {
    if (!editedCosts[id]) return;

    setIsSaving(true);
    try {
      await updateCost({
        id: id as any,
        domicileCost: editedCosts[id].domicile,
        stopdeskCost: editedCosts[id].stopdesk,
      });
      toast.success("Delivery cost updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitialize = async () => {
    if (!confirm("Initialize default costs for all wilayas? (Won't override existing)")) return;

    try {
      const result = await initializeDefaults();
      toast.success(`Initialized ${result.created} wilayas!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings className="h-6 w-6 text-indigo-600" />
            Delivery Costs Settings
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Manage delivery prices for all 58 wilayas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search wilaya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleInitialize} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Initialize Defaults
            </Button>
          </div>

          {/* Costs Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Wilaya
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Home Delivery (DA)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Stopdesk (DA)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCosts && filteredCosts.length > 0 ? (
                  filteredCosts.map((cost) => (
                    <tr key={cost._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {cost.wilayaName}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={editedCosts[cost._id]?.domicile ?? cost.domicileCost}
                          onChange={(e) =>
                            setEditedCosts((prev) => ({
                              ...prev,
                              [cost._id]: {
                                ...prev[cost._id],
                                domicile: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-28"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={editedCosts[cost._id]?.stopdesk ?? cost.stopdeskCost}
                          onChange={(e) =>
                            setEditedCosts((prev) => ({
                              ...prev,
                              [cost._id]: {
                                ...prev[cost._id],
                                stopdesk: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-28"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleSave(cost._id)}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                      {deliveryCosts?.length === 0
                        ? "No delivery costs set. Click 'Initialize Defaults' to add all wilayas."
                        : "No results found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
