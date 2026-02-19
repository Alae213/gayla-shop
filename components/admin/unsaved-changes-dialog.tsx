"use client";

/**
 * UnsavedChangesDialog
 * M1 Task 1.2 — shown when the admin tries to leave Build Mode
 * while the hero editor has unsaved changes.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TriangleAlert } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onLeave: () => void;
  onStay:  () => void;
}

export function UnsavedChangesDialog({
  open,
  onLeave,
  onStay,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onStay(); }}
    >
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <TriangleAlert className="h-5 w-5 shrink-0" />
            <AlertDialogTitle className="text-amber-700">
              Unsaved changes
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Your hero section has unsaved changes. If you leave now they will
            be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>Stay &amp; save</AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeave}
            className="bg-gray-900 hover:bg-gray-700 text-white"
          >
            Leave anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
