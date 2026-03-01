"use client";

import * as React from "react";
import { Phone, MapPin, Edit2, Check, X, FileText } from "lucide-react";

interface CustomerDetailsSectionProps {
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
  
  // Display values
  customerPhone: string;
  customerAddress?: string;
  customerCommune?: string;
  customerWilaya?: string;
  notes?: string;
  
  // Edit form
  editForm: {
    customerPhone: string;
    customerAddress: string;
    customerCommune: string;
    customerWilaya: string;
    notes: string;
  };
  onEditFormChange: (field: string, value: string) => void;
  onPhoneBlur: (value: string) => void;
  
  addressInputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Customer Details Section
 * 
 * Displays and allows editing:
 * - Phone number (with DZ formatting)
 * - Address (street, commune, wilaya)
 * - Order notes
 * 
 * Phase 5: Standardized card padding (p-6) and button spacing (gap-3)
 */
export function CustomerDetailsSection({
  isEditing,
  onStartEdit,
  onSave,
  onDiscard,
  customerPhone,
  customerAddress,
  customerCommune,
  customerWilaya,
  notes,
  editForm,
  onEditFormChange,
  onPhoneBlur,
  addressInputRef,
}: CustomerDetailsSectionProps) {
  return (
    <>
      <section aria-labelledby="customer-heading">
        <div className="flex items-center justify-between mb-4">
          <h3
            id="customer-heading"
            className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider"
          >
            Customer Details
          </h3>
          {!isEditing ? (
            <button
              onClick={onStartEdit}
              className="p-1.5 text-[#AAAAAA] hover:text-[#3A3A3A] hover:bg-[#F5F5F5] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAAAAA]"
              aria-label="Edit customer details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onSave}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                aria-label="Save changes"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onDiscard}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                aria-label="Discard changes"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#F7F7F7] rounded-lg">
              <Phone className="w-4 h-4 text-[#AAAAAA]" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.customerPhone}
                  onChange={e => onEditFormChange("customerPhone", e.target.value)}
                  onBlur={e => onPhoneBlur(e.target.value)}
                  aria-label="Phone"
                  className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                />
              ) : (
                <span className="text-[15px] text-[#3A3A3A] font-medium tracking-wide">
                  {customerPhone}
                </span>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#F7F7F7] rounded-lg">
              <MapPin className="w-4 h-4 text-[#AAAAAA]" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    ref={addressInputRef}
                    type="text"
                    placeholder="Address"
                    value={editForm.customerAddress}
                    onChange={e => onEditFormChange("customerAddress", e.target.value)}
                    aria-label="Address"
                    className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Commune"
                      value={editForm.customerCommune}
                      onChange={e => onEditFormChange("customerCommune", e.target.value)}
                      aria-label="Commune"
                      className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                    />
                    <input
                      type="text"
                      placeholder="Wilaya"
                      value={editForm.customerWilaya}
                      onChange={e => onEditFormChange("customerWilaya", e.target.value)}
                      aria-label="Wilaya"
                      className="bg-white border border-[#ECECEC] rounded-md px-3 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-[15px] text-[#3A3A3A] leading-relaxed">
                  {customerAddress && `${customerAddress}, `}
                  {customerCommune && `${customerCommune}, `}
                  {customerWilaya}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      {(isEditing || notes) && (
        <section aria-labelledby="notes-heading" className="mt-6">
          <h3
            id="notes-heading"
            className="text-[14px] font-semibold text-[#3A3A3A] uppercase tracking-wider mb-4"
          >
            Notes
          </h3>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#F7F7F7] rounded-lg">
              <FileText className="w-4 h-4 text-[#AAAAAA]" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <textarea
                  value={editForm.notes}
                  onChange={e => onEditFormChange("notes", e.target.value)}
                  placeholder="Add order notes..."
                  rows={3}
                  aria-label="Order Notes"
                  className="w-full bg-white border border-[#ECECEC] rounded-md px-3 py-2 text-[15px] text-[#3A3A3A] placeholder-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#AAAAAA] leading-relaxed"
                />
              ) : (
                <p className="text-[15px] text-[#3A3A3A] leading-relaxed whitespace-pre-wrap">
                  {notes}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
