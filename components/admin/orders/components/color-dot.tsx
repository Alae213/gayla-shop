import * as React from "react";

interface ColorDotProps {
  color: string;
  size?: number;
  className?: string;
}

export function ColorDot({ color, size = 12, className = "" }: ColorDotProps) {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
      }}
      aria-label={`Color: ${color}`}
    />
  );
}