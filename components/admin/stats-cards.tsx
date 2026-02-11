"use client";

import { Activity, Package, TrendingUp, Pencil, Check, Truck } from "lucide-react";

interface StatsCardsProps {
  mode: "build" | "tracking";
  siteContent?: {
    homepageViewCount: number;
  } | null; // ✅ ADD NULL
  products?: any[];
  orderStats?: {
    Pending: number;
    Confirmed: number;
    Shipped: number;
    Delivered: number;
  };
}

export function StatsCards({ mode, siteContent, products, orderStats }: StatsCardsProps) {
  if (mode === "build") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Homepage Views</p>
              <p className="text-3xl font-bold mt-2">
                {siteContent?.homepageViewCount?.toLocaleString() || 0}
              </p>
            </div>
            <Activity className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-2">{products?.length || 0}</p>
            </div>
            <Package className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Products</p>
              <p className="text-3xl font-bold mt-2">
                {products?.filter((p) => p.status === "Active").length || 0}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Draft Products</p>
              <p className="text-3xl font-bold mt-2">
                {products?.filter((p) => p.status === "Draft").length || 0}
              </p>
            </div>
            <Pencil className="h-12 w-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>
    );
  }

  // Tracking Mode Stats
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold mt-2">{orderStats?.Pending || 0}</p>
          </div>
          <Package className="h-10 w-10 text-yellow-200 opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Confirmed</p>
            <p className="text-3xl font-bold mt-2">{orderStats?.Confirmed || 0}</p>
          </div>
          <Check className="h-10 w-10 text-blue-200 opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium">Shipped</p>
            <p className="text-3xl font-bold mt-2">{orderStats?.Shipped || 0}</p>
          </div>
          <Truck className="h-10 w-10 text-indigo-200 opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Delivered</p>
            <p className="text-3xl font-bold mt-2">{orderStats?.Delivered || 0}</p>
          </div>
          <Check className="h-10 w-10 text-green-200 opacity-80" />
        </div>
      </div>
    </div>
  );
}
