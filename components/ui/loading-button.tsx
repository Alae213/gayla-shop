import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Phase 1 - T1.7: LoadingButton Component
// Extends Button with loading state and spinner

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={loading || disabled}
        className={cn(className)}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Loader2
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}
        {loading ? loadingText || children : children}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
