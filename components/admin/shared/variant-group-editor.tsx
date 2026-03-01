"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export interface VariantGroup {
  id: string;
  name: string;
  values: {
    label: string;
    enabled: boolean;
    order: number;
  }[];
}

interface VariantGroupEditorProps {
  variantGroups: VariantGroup[];
  onChange: (groups: VariantGroup[]) => void;
}

export function VariantGroupEditor({
  variantGroups,
  onChange,
}: VariantGroupEditorProps) {
  const [newOption, setNewOption] = useState<{ [key: string]: string }>({});

  const handleAddGroup = () => {
    const newGroup: VariantGroup = {
      id: `group-${Date.now()}`,
      name: "",
      values: [],
    };
    onChange([...variantGroups, newGroup]);
    toast.success("Variant group added");
  };

  const handleRemoveGroup = (index: number) => {
    onChange(variantGroups.filter((_, i) => i !== index));
  };

  const handleGroupNameChange = (index: number, name: string) => {
    const newGroups = [...variantGroups];
    newGroups[index] = { ...newGroups[index], name };
    onChange(newGroups);
  };

  const handleAddOption = (groupIndex: number) => {
    const optionValue = newOption[groupIndex];
    if (optionValue?.trim()) {
      const newGroups = [...variantGroups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        values: [
          ...newGroups[groupIndex].values,
          {
            label: optionValue.trim(),
            enabled: true,
            order: newGroups[groupIndex].values.length,
          },
        ],
      };
      onChange(newGroups);
      setNewOption({ ...newOption, [groupIndex]: "" });
      toast.success("Option added");
    }
  };

  const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      values: newGroups[groupIndex].values
        .filter((_, i) => i !== optionIndex)
        .map((value, i) => ({ ...value, order: i })),
    };
    onChange(newGroups);
  };

  const handleOptionChange = (groupIndex: number, optionIndex: number, value: string) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex].values[optionIndex] = {
      ...newGroups[groupIndex].values[optionIndex],
      label: value,
    };
    onChange(newGroups);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Variant Groups</Label>
        <Button variant="outline" size="sm" onClick={handleAddGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {variantGroups.map((group, groupIndex) => (
        <div key={group.id} className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor={`name-${group.id}`}>Variant Name</Label>
              <Input
                id={`name-${group.id}`}
                value={group.name}
                onChange={(e) => handleGroupNameChange(groupIndex, e.target.value)}
                placeholder="e.g., Size, Color"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveGroup(groupIndex)}
              className="ml-2 mt-6"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {group.values.map((value, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    value={value.label}
                    onChange={(e) => handleOptionChange(groupIndex, optionIndex, e.target.value)}
                    placeholder="Option value"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(groupIndex, optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center gap-2">
                <Input
                  value={newOption[groupIndex] || ""}
                  onChange={(e) => setNewOption({ ...newOption, [groupIndex]: e.target.value })}
                  placeholder="Add new option"
                  onKeyPress={(e) => e.key === "Enter" && handleAddOption(groupIndex)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddOption(groupIndex)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {variantGroups.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No variant groups yet</p>
          <p className="text-sm mt-1">Click "Add Group" to create your first variant group</p>
        </div>
      )}
    </div>
  );
}
