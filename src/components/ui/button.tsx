import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const buttonVariants = {
  default: "bg-homehelp-900 text-white hover:bg-homehelp-800",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  info: "bg-blue-500 text-white hover:bg-blue-600",
  sizes: {
    sm: "h-9 px-3 text-sm",
    md: "h-10 py-2 px-4",
    lg: "h-11 px-8"
  }
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-homehelp-900 text-white hover:bg-homehelp-800": variant === "default",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "bg-green-600 text-white hover:bg-green-700": variant === "success",
            "bg-yellow-500 text-white hover:bg-yellow-600": variant === "warning",
            "bg-blue-500 text-white hover:bg-blue-600": variant === "info",
          },
          {
            "h-9 px-3 text-sm": size === "sm",
            "h-10 py-2 px-4": size === "md",
            "h-11 px-8": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
