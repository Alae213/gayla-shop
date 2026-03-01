"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Home, Edit2, Save, X } from "lucide-react";
import type { Order } from "../types";

interface CustomerFormData {
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  customerCommune: string;
  customerAddress: string;
  deliveryCost: number;
}

interface OrderDrawerCustomerProps {
  order: Order;
  isEditing: boolean;
  formData: CustomerFormData;
  isSaving: boolean;
  onEditToggle: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFormChange: (updates: Partial<CustomerFormData>) => void;
}

/**
 * OrderDrawer Customer Section
 * 
 * Displays and edits customer information (name, phone, address).
 * Switches between view and edit modes.
 */
export function OrderDrawerCustomer({
  order,
  isEditing,
  formData,
  isSaving,
  onEditToggle,
  onCancel,
  onSave,
  onFormChange,
}: OrderDrawerCustomerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" /> Customer
        </h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onEditToggle} className="gap-1.5">
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onCancel}>
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5">
              {isSaving ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4 bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cn" className="text-xs flex items-center gap-1">
                <User className="h-3 w-3" /> Name
              </Label>
              <Input
                id="cn"
                value={formData.customerName}
                onChange={(e) => onFormChange({ customerName: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cp" className="text-xs flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <Input
                id="cp"
                value={formData.customerPhone}
                onChange={(e) => onFormChange({ customerPhone: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ca" className="text-xs flex items-center gap-1">
              <Home className="h-3 w-3" /> Address
            </Label>
            <Input
              id="ca"
              value={formData.customerAddress}
              onChange={(e) => onFormChange({ customerAddress: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3 bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
          <Row icon={<User />} label="Name" value={order.customerName} />
          <Row
            icon={<Phone />}
            label="Phone"
            value={
              <a
                href={`tel:${order.customerPhone}`}
                className="font-medium text-indigo-600 hover:underline"
              >
                {order.customerPhone}
              </a>
            }
          />
          <Row icon={<Home />} label="Address" value={order.customerAddress} />
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-gray-400 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium text-gray-900 text-sm mt-0.5">{value}</div>
      </div>
    </div>
  );
}
