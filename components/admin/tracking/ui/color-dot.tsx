import * as React from "react";
import { cn } from "@/lib/utils";

interface ColorDotProps {
  color: string; // Hex color (e.g., "#FF5733")
  size?: number; // Size in pixels (default 8)
  className?: string;
}

export function ColorDot({ color, size = 8, className }: ColorDotProps) {
  return (
    <div
      className={cn(
        "rounded-full border border-gray-300 shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      role="img"
      aria-label={`Color: ${color}`}
      title={color}
    />
  );
}
