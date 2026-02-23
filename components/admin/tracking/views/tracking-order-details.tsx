"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrackingButton } from "../ui/tracking-button";
import { StatusPill } from "../ui/status-pill";
import { format } from "date-fns";
import { toast } from "sonner";
import { Phone, MapPin, Edit2, Check, X, Box, ArrowRight } from "lucide-react";
import { Order } from "./tracking-kanban-board";

interface TrackingOrderDetailsProps {
  order: Order;
  onClose: () => void;
}

export function TrackingOrderDetails({ order, onClose }: TrackingOrderDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress || "",
    customerWilaya: order.customerWilaya,
    customerCommune: order.customerCommune || "",
    notes: order.notes || ""
  });

  const updateCustomerInfo = useMutation(api.orders.updateCustomerInfo);
  const logCallOutcome = useMutation(api.orders.logCallOutcome);
  const updateStatus = useMutation(api.orders.updateStatus);

  const handleSave = async () => {
    try {
      await updateCustomerInfo({
        id: order._id,
        ...editForm
      });
      setIsEditing(false);
      toast.success("Order updated successfully");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleCallLog = async (outcome: "answered" | "no answer" | "wrong number" | "refused") => {
    try {
      const result = await logCallOutcome({
        orderId: order._id,
        outcome
      });
      
      toast.success(`Logged: ${outcome}`);
      
      if (result.autoCanceled) {
        toast.error("Order auto-canceled", {
          description: result.cancelReason,
          duration: 6000,
        });
        onClose();
      }
    } catch (error) {
      toast.error("Failed to log call");
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    try {
      await updateStatus({
        id: order._id,
        status: newStatus
      });
      toast.success(`Order marked as ${newStatus}`);
      if (newStatus === "canceled") onClose();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full pb-24" role="region" aria-label={`Order details for ${order.orderNumber}`}>
      {/* Header Info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <StatusPill status={order.status} />
          <span className="text-[13px] text-[#AAAAAA]" aria-label="Creation date">
            {format(order._creationTime, "MMM d, yyyy 'at' HH:mm")}
          </span>
        </div>
        
        <div>
          <h1 className="text-[24px] font-semibold text-[#3A3A3A] mb-1">{order.customerName}</h1>
          <div className="flex items-center gap-2 text-[#AAAAAA] text-[15px]">
            <span className="font-mono bg-[#F5F5F5] px-2 py-0.5 rounded-md" aria-label={`Order number: ${order.orderNumber}`}>{order.orderNumber}</span>
          </div>
        </div>
      </div>

      {/* Customer Details Form */}
      <section className="flex flex-col gap-4 bg-[#F7F7F7] p-6 rounded-tracking-card border border-[#ECECEC]" aria-labelledby="customer-details-heading">
        <div className="flex items-center justify-between mb-2">
          <h3 id="customer-details-heading" className="text-[14px] font-semibold text-[#AAAAAA] uppercase tracking-wider">Customer Details</h3>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-1.5 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]"
              aria-label="Edit customer details"
            >
              <Edit2 className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-1.5 text-rose-500 hover:bg-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]"
                aria-label="Cancel editing"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
              <button 
                onClick={handleSave} 
                className="p-1.5 text-emerald-600 hover:bg-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]"
                aria-label="Save customer details"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-[#AAAAAA] mt-0.5 shrink-0" aria-hidden="true" />
            {isEditing ? (
              <input 
                type="text" 
                value={editForm.customerPhone}
                onChange={e => setEditForm(prev => ({...prev, customerPhone: e.target.value}))}
                aria-label="Customer phone number"
                className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
              />
            ) : (
              <span className="text-[15px] font-medium text-[#3A3A3A]">{order.customerPhone}</span>
            )}
          </div>

          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-[#AAAAAA] mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex flex-col gap-2 w-full">
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    placeholder="Address"
                    value={editForm.customerAddress}
                    onChange={e => setEditForm(prev => ({...prev, customerAddress: e.target.value}))}
                    aria-label="Customer address"
                    className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Commune"
                      value={editForm.customerCommune}
                      onChange={e => setEditForm(prev => ({...prev, customerCommune: e.target.value}))}
                      aria-label="Customer commune"
                      className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                    />
                    <input 
                      type="text" 
                      placeholder="Wilaya"
                      value={editForm.customerWilaya}
                      onChange={e => setEditForm(prev => ({...prev, customerWilaya: e.target.value}))}
                      aria-label="Customer wilaya"
                      className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                    />
                  </div>
                </>
              ) : (
                <span className="text-[15px] text-[#3A3A3A] leading-relaxed">
                  {order.customerAddress && `${order.customerAddress}, `}
                  {order.customerCommune && `${order.customerCommune}, `}
                  {order.customerWilaya}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Order Summary */}
      <section className="flex flex-col gap-4" aria-labelledby="order-summary-heading">
        <h3 id="order-summary-heading" className="text-[14px] font-semibold text-[#AAAAAA] uppercase tracking-wider">Order Summary</h3>
        <div className="flex items-center gap-4 bg-white border border-[#ECECEC] rounded-tracking-card p-4">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center shrink-0" aria-hidden="true">
            <Box className="w-6 h-6 text-[#AAAAAA]" />
          </div>
          <div className="flex-1">
            <h4 className="text-[15px] font-medium text-[#3A3A3A]">{order.productName || "Product Name Missing"}</h4>
            {order.selectedVariant && (
              <p className="text-[13px] text-[#AAAAAA] mt-1">
                {order.selectedVariant.size && `Size: ${order.selectedVariant.size}`}
                {order.selectedVariant.size && order.selectedVariant.color && " | "}
                {order.selectedVariant.color && `Color: ${order.selectedVariant.color}`}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-[16px] font-semibold text-[#3A3A3A]">{order.totalAmount} DZD</div>
            <div className="text-[12px] text-[#AAAAAA]">incl. delivery</div>
          </div>
        </div>
      </section>

      {/* Contextual Actions Panel (Fixed at Bottom) */}
      <div 
        className="fixed bottom-0 right-0 w-[480px] bg-white border-t border-[#ECECEC] p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.04)] z-50 flex flex-col gap-3"
        role="group"
        aria-label="Order actions"
      >
        
        {/* NEW STATE: Call Logging */}
        {order.status === "new" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-[#AAAAAA]" aria-live="polite">Call Attempts: {order.callAttempts || 0}/2</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TrackingButton variant="secondary" onClick={() => handleCallLog("no answer")}>No Answer</TrackingButton>
              <TrackingButton variant="secondary" onClick={() => handleCallLog("wrong number")} className="text-rose-600 hover:text-rose-700">Wrong Num</TrackingButton>
              <TrackingButton variant="secondary" onClick={() => handleCallLog("refused")} className="text-rose-600 hover:text-rose-700">Refused</TrackingButton>
              <TrackingButton variant="primary" onClick={() => handleStatusChange("confirmed")} className="gap-2">
                Confirm <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </TrackingButton>
            </div>
          </div>
        )}

        {/* CONFIRMED STATE: Dispatch */}
        {order.status === "confirmed" && (
          <div className="flex gap-3">
            <TrackingButton variant="secondary" onClick={() => handleStatusChange("canceled")} className="flex-1 text-rose-600 hover:text-rose-700">Cancel Order</TrackingButton>
            <TrackingButton variant="primary" onClick={() => handleStatusChange("packaged")} className="flex-[2] gap-2">
              Send to Yalidin <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

        {/* PACKAGED STATE: Print & Ship */}
        {order.status === "packaged" && (
          <div className="flex gap-3">
            <TrackingButton variant="secondary" onClick={() => {}} className="flex-[2]">Print Label</TrackingButton>
            <TrackingButton variant="primary" onClick={() => handleStatusChange("shipped")} className="flex-1 gap-2">
              Ship <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </TrackingButton>
          </div>
        )}

      </div>
    </div>
  );
}