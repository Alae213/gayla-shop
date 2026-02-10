"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { WILAYAS } from "@/lib/constants";

export default function SettingsPage() {
  const deliveryCosts = useQuery(api.deliveryCosts.list);

  if (!deliveryCosts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage delivery costs and system settings</p>
      </div>

      {/* Delivery Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Costs by Wilaya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 font-semibold text-sm border-b pb-2">
              <span>Wilaya ID</span>
              <span>Wilaya Name</span>
              <span>Home Delivery</span>
              <span>Stopdesk</span>
            </div>

            {WILAYAS.slice(0, 10).map((wilaya) => {
              const cost = deliveryCosts.find((c) => c.wilayaId === wilaya.id);
              return (
                <div key={wilaya.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                  <span className="text-muted-foreground">{wilaya.id}</span>
                  <span>{wilaya.name}</span>
                  <span>{cost?.domicileCost || 600} DZD</span>
                  <span>{cost?.stopdeskCost || 400} DZD</span>
                </div>
              );
            })}

            <p className="text-xs text-muted-foreground pt-4">
              Showing 10 of 58 wilayas. Default costs: 600 DZD (Home), 400 DZD (Stopdesk)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
