"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

// Default wilaya data used when seeding for the first time
const DEFAULT_WILAYAS = [
  { id: 1,  name: "Adrar",           stopdeskCost: 700,  domicileCost: 900  },
  { id: 2,  name: "Chlef",           stopdeskCost: 500,  domicileCost: 700  },
  { id: 3,  name: "Laghouat",        stopdeskCost: 600,  domicileCost: 800  },
  { id: 4,  name: "Oum El Bouaghi",  stopdeskCost: 500,  domicileCost: 700  },
  { id: 5,  name: "Batna",           stopdeskCost: 500,  domicileCost: 700  },
  { id: 6,  name: "Béjaïa",          stopdeskCost: 500,  domicileCost: 700  },
  { id: 7,  name: "Biskra",          stopdeskCost: 550,  domicileCost: 750  },
  { id: 8,  name: "Béchar",          stopdeskCost: 700,  domicileCost: 900  },
  { id: 9,  name: "Blida",           stopdeskCost: 400,  domicileCost: 600  },
  { id: 10, name: "Bouira",          stopdeskCost: 450,  domicileCost: 650  },
  { id: 11, name: "Tamanrasset",     stopdeskCost: 900,  domicileCost: 1100 },
  { id: 12, name: "Tébessa",         stopdeskCost: 550,  domicileCost: 750  },
  { id: 13, name: "Tlemcen",         stopdeskCost: 550,  domicileCost: 750  },
  { id: 14, name: "Tiaret",          stopdeskCost: 550,  domicileCost: 750  },
  { id: 15, name: "Tizi Ouzou",      stopdeskCost: 450,  domicileCost: 650  },
  { id: 16, name: "Alger",           stopdeskCost: 350,  domicileCost: 550  },
  { id: 17, name: "Djelfa",          stopdeskCost: 550,  domicileCost: 750  },
  { id: 18, name: "Jijel",           stopdeskCost: 500,  domicileCost: 700  },
  { id: 19, name: "Sétif",           stopdeskCost: 500,  domicileCost: 700  },
  { id: 20, name: "Saïda",           stopdeskCost: 600,  domicileCost: 800  },
  { id: 21, name: "Skikda",          stopdeskCost: 500,  domicileCost: 700  },
  { id: 22, name: "Sidi Bel Abbès",  stopdeskCost: 550,  domicileCost: 750  },
  { id: 23, name: "Annaba",          stopdeskCost: 500,  domicileCost: 700  },
  { id: 24, name: "Guelma",          stopdeskCost: 500,  domicileCost: 700  },
  { id: 25, name: "Constantine",     stopdeskCost: 450,  domicileCost: 650  },
  { id: 26, name: "Médéa",          stopdeskCost: 450,  domicileCost: 650  },
  { id: 27, name: "Mostaganem",      stopdeskCost: 500,  domicileCost: 700  },
  { id: 28, name: "M'Sila",          stopdeskCost: 550,  domicileCost: 750  },
  { id: 29, name: "Mascara",         stopdeskCost: 550,  domicileCost: 750  },
  { id: 30, name: "Ouargla",         stopdeskCost: 650,  domicileCost: 850  },
  { id: 31, name: "Oran",            stopdeskCost: 400,  domicileCost: 600  },
  { id: 32, name: "El Bayadh",       stopdeskCost: 700,  domicileCost: 900  },
  { id: 33, name: "Illizi",          stopdeskCost: 1000, domicileCost: 1200 },
  { id: 34, name: "Bordj Bou Arréridj", stopdeskCost: 500, domicileCost: 700 },
  { id: 35, name: "Boumerdès",       stopdeskCost: 400,  domicileCost: 600  },
  { id: 36, name: "El Tarf",         stopdeskCost: 500,  domicileCost: 700  },
  { id: 37, name: "Tindouf",         stopdeskCost: 1000, domicileCost: 1200 },
  { id: 38, name: "Tissemsilt",      stopdeskCost: 600,  domicileCost: 800  },
  { id: 39, name: "El Ouéd",         stopdeskCost: 650,  domicileCost: 850  },
  { id: 40, name: "Khenchela",       stopdeskCost: 550,  domicileCost: 750  },
  { id: 41, name: "Souk Ahras",      stopdeskCost: 550,  domicileCost: 750  },
  { id: 42, name: "Tipaza",          stopdeskCost: 400,  domicileCost: 600  },
  { id: 43, name: "Mila",            stopdeskCost: 500,  domicileCost: 700  },
  { id: 44, name: "Aïn Defla",       stopdeskCost: 500,  domicileCost: 700  },
  { id: 45, name: "Naâma",           stopdeskCost: 700,  domicileCost: 900  },
  { id: 46, name: "Aïn Témouchent",  stopdeskCost: 550,  domicileCost: 750  },
  { id: 47, name: "Ghardaïa",        stopdeskCost: 650,  domicileCost: 850  },
  { id: 48, name: "Relizane",        stopdeskCost: 550,  domicileCost: 750  },
  { id: 49, name: "Timimoun",        stopdeskCost: 800,  domicileCost: 1000 },
  { id: 50, name: "Bordj Badji Mokhtar", stopdeskCost: 1000, domicileCost: 1200 },
  { id: 51, name: "Ouéd Djemaâ",    stopdeskCost: 800,  domicileCost: 1000 },
  { id: 52, name: "In Salah",        stopdeskCost: 900,  domicileCost: 1100 },
  { id: 53, name: "In Guezzam",      stopdeskCost: 1000, domicileCost: 1200 },
  { id: 54, name: "Touggourt",       stopdeskCost: 650,  domicileCost: 850  },
  { id: 55, name: "Djanet",          stopdeskCost: 1000, domicileCost: 1200 },
  { id: 56, name: "El M'Ghair",      stopdeskCost: 650,  domicileCost: 850  },
  { id: 57, name: "El Meniaa",       stopdeskCost: 750,  domicileCost: 950  },
  { id: 58, name: "Dra El Mizane",   stopdeskCost: 450,  domicileCost: 650  },
];

interface DeliverySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeliverySettingsModal({ isOpen, onClose }: DeliverySettingsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editedCosts, setEditedCosts] = useState<Record<string, { domicile: number; stopdesk: number }>>({});
  const [isSaving,    setIsSaving]    = useState(false);

  const deliveryCosts     = useQuery(api.deliveryCosts.list);
  // upsert = create-or-update by wilayaId+wilayaName
  const upsertCost        = useMutation(api.deliveryCosts.upsert);
  // seedDefaults = insert missing wilayas without overriding existing ones
  const seedDefaults      = useMutation(api.deliveryCosts.seedDefaults);

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

  const handleSave = async (costId: string) => {
    const row = deliveryCosts?.find((c) => c._id === costId);
    if (!row || !editedCosts[costId]) return;
    setIsSaving(true);
    try {
      await upsertCost({
        wilayaId:     row.wilayaId,
        wilayaName:   row.wilayaName,
        domicileCost: editedCosts[costId].domicile,
        stopdeskCost: editedCosts[costId].stopdesk,
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
      const result = await seedDefaults({
        wilayas: DEFAULT_WILAYAS.map((w) => ({
          id:           w.id,
          name:         w.name,
          stopdeskCost: w.stopdeskCost,
          domicileCost: w.domicileCost,
        })),
      });
      toast.success(`Initialized ${result.seeded} wilaya${result.seeded !== 1 ? "s" : ""}!`);
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Wilaya</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Home Delivery (DA)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stopdesk (DA)</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
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
