"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Phase 1 - T1.8: ThemeToggle Component
// Provides light/dark mode toggle with two variants

export interface ThemeToggleProps {
  variant?: "icon" | "labeled";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <Button
        variant="ghost"
        size={variant === "icon" ? "icon" : "default"}
        disabled
        className={cn("opacity-0", className)}
        aria-label="Loading theme toggle"
      >
        {variant === "icon" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <span>Theme</span>
        )}
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (variant === "labeled") {
    return (
      <Button
        variant="outline"
        size="default"
        onClick={toggleTheme}
        className={cn("gap-2", className)}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="ml-2">
          {theme === "dark" ? "Dark" : "Light"} Mode
        </span>
      </Button>
    );
  }

  // Icon variant (default)
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
