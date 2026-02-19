"use client";

import { AlertTriangle } from "lucide-react";
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

interface UnsavedChangesDialogProps {
  open: boolean;
  onLeave: () => void;
  onStay: () => void;
}

export function UnsavedChangesDialog({
  open,
  onLeave,
  onStay,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved edits in the Hero section. If you leave now, your
            changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>
            Stay &amp; save
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeave}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Leave anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
