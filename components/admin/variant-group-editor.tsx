"use client";

/**
 * VariantGroupEditor - Admin UI for managing product variant groups
 * Supports drag-and-drop reordering, inline editing, enable/disable toggles
 */

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VariantValue {
  label: string;
  enabled: boolean;
  order: number;
}

export interface VariantGroup {
  name: string;
  values: VariantValue[];
}

interface VariantGroupEditorProps {
  variantGroups: VariantGroup[];
  onChange: (groups: VariantGroup[]) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

// ─── Common Variant Suggestions ───────────────────────────────────────────────

const VARIANT_SUGGESTIONS = [
  { name: "Size", values: ["XS", "S", "M", "L", "XL", "XXL"] },
  { name: "Color", values: ["Black", "White", "Red", "Blue", "Green", "Yellow"] },
  { name: "Material", values: ["Cotton", "Polyester", "Wool", "Silk", "Leather"] },
  { name: "Style", values: ["Classic", "Modern", "Vintage", "Casual", "Formal"] },
];

// ─── Sortable Variant Value Item ──────────────────────────────────────────────

interface SortableValueItemProps {
  value: VariantValue;
  groupIndex: number;
  valueIndex: number;
  onUpdate: (groupIndex: number, valueIndex: number, updates: Partial<VariantValue>) => void;
  onRemove: (groupIndex: number, valueIndex: number) => void;
}

function SortableValueItem({
  value,
  groupIndex,
  valueIndex,
  onUpdate,
  onRemove,
}: SortableValueItemProps) {
  const id = `${groupIndex}-${valueIndex}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(value.label);

  const handleSave = () => {
    if (editLabel.trim() && editLabel !== value.label) {
      onUpdate(groupIndex, valueIndex, { label: editLabel.trim() });
    }
    setIsEditing(false);
  };

  const handleToggle = () => {
    onUpdate(groupIndex, valueIndex, { enabled: !value.enabled });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Value Label (Inline Edit) */}
      {isEditing ? (
        <Input
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditLabel(value.label);
              setIsEditing(false);
            }
          }}
          autoFocus
          className="h-8 flex-1"
        />
      ) : (
        <Badge
          variant={value.enabled ? "default" : "outline"}
          className={cn(
            "flex-1 justify-center cursor-pointer transition-colors",
            !value.enabled && "opacity-50"
          )}
          onClick={() => setIsEditing(true)}
        >
          {value.label}
        </Badge>
      )}

      {/* Enable/Disable Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleToggle}
        title={value.enabled ? "Disable" : "Enable"}
      >
        {value.enabled ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(groupIndex, valueIndex)}
      >
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function VariantGroupEditor({
  variantGroups,
  onChange,
  onDirtyChange,
}: VariantGroupEditorProps) {
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddGroup = (templateName?: string) => {
    const template = VARIANT_SUGGESTIONS.find((s) => s.name === templateName);
    const newGroup: VariantGroup = {
      name: template?.name || "New Variant",
      values: template
        ? template.values.map((v, i) => ({
            label: v,
            enabled: true,
            order: i,
          }))
        : [],
    };
    onChange([...variantGroups, newGroup]);
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    onChange(variantGroups.filter((_, i) => i !== groupIndex));
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleUpdateGroupName = (groupIndex: number, name: string) => {
    const updated = [...variantGroups];
    updated[groupIndex] = { ...updated[groupIndex], name };
    onChange(updated);
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleAddValue = (groupIndex: number) => {
    const label = newValueInputs[groupIndex]?.trim();
    if (!label) return;

    const updated = [...variantGroups];
    const group = updated[groupIndex];
    const newValue: VariantValue = {
      label,
      enabled: true,
      order: group.values.length,
    };
    updated[groupIndex] = {
      ...group,
      values: [...group.values, newValue],
    };
    onChange(updated);
    setNewValueInputs({ ...newValueInputs, [groupIndex]: "" });
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleUpdateValue = (
    groupIndex: number,
    valueIndex: number,
    updates: Partial<VariantValue>
  ) => {
    const updated = [...variantGroups];
    updated[groupIndex].values[valueIndex] = {
      ...updated[groupIndex].values[valueIndex],
      ...updates,
    };
    onChange(updated);
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleRemoveValue = (groupIndex: number, valueIndex: number) => {
    const updated = [...variantGroups];
    updated[groupIndex].values = updated[groupIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    // Reorder remaining values
    updated[groupIndex].values.forEach((v, i) => (v.order = i));
    onChange(updated);
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleDragEnd = (event: DragEndEvent, groupIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const updated = [...variantGroups];
    const values = updated[groupIndex].values;
    const oldIndex = values.findIndex(
      (_, i) => `${groupIndex}-${i}` === active.id
    );
    const newIndex = values.findIndex(
      (_, i) => `${groupIndex}-${i}` === over.id
    );

    const reordered = arrayMove(values, oldIndex, newIndex);
    reordered.forEach((v, i) => (v.order = i));
    updated[groupIndex].values = reordered;
    onChange(updated);
    if (onDirtyChange) onDirtyChange(true);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Product Variants</Label>
        <Select onValueChange={(value) => handleAddGroup(value)}>
          <SelectTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Variant Group
            </Button>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Custom Group
              </span>
            </SelectItem>
            <Separator className="my-1" />
            {VARIANT_SUGGESTIONS.map((suggestion) => (
              <SelectItem key={suggestion.name} value={suggestion.name}>
                {suggestion.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {variantGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No variants configured</p>
            <p className="text-sm mt-2">
              Add variant groups like Size, Color, or Material
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {variantGroups.map((group, groupIndex) => (
            <Card key={groupIndex}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={group.name}
                    onChange={(e) =>
                      handleUpdateGroupName(groupIndex, e.target.value)
                    }
                    className="font-semibold"
                    placeholder="Group Name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveGroup(groupIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Variant Values */}
                {group.values.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, groupIndex)}
                  >
                    <SortableContext
                      items={group.values.map((_, i) => `${groupIndex}-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {group.values.map((value, valueIndex) => (
                          <SortableValueItem
                            key={`${groupIndex}-${valueIndex}`}
                            value={value}
                            groupIndex={groupIndex}
                            valueIndex={valueIndex}
                            onUpdate={handleUpdateValue}
                            onRemove={handleRemoveValue}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Add New Value */}
                <div className="flex gap-2 pt-2">
                  <Input
                    value={newValueInputs[groupIndex] || ""}
                    onChange={(e) =>
                      setNewValueInputs({
                        ...newValueInputs,
                        [groupIndex]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddValue(groupIndex);
                    }}
                    placeholder="Add new value..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAddValue(groupIndex)}
                    disabled={!newValueInputs[groupIndex]?.trim()}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
