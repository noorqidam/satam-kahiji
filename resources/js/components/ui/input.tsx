import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, autoComplete = "off", onClick, onFocus, ...props }: React.ComponentProps<"input">) {
  const handleDateTimeClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (type === "datetime-local" || type === "date" || type === "time") {
      // Use showPicker if available (modern browsers), otherwise rely on browser default behavior
      try {
        if ('showPicker' in e.currentTarget && typeof e.currentTarget.showPicker === 'function') {
          e.currentTarget.showPicker();
        }
      } catch (error) {
        // Ignore errors if showPicker is not supported
        console.debug('showPicker not supported or failed:', error);
      }
    }
    onClick?.(e);
  };

  const handleDateTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === "datetime-local" || type === "date" || type === "time") {
      // Small delay to ensure the input is focused before showing picker
      setTimeout(() => {
        try {
          if ('showPicker' in e.currentTarget && typeof e.currentTarget.showPicker === 'function') {
            e.currentTarget.showPicker();
          }
        } catch (error) {
          // Ignore errors if showPicker is not supported
          console.debug('showPicker not supported or failed:', error);
        }
      }, 100);
    }
    onFocus?.(e);
  };

  return (
    <input
      type={type}
      autoComplete={autoComplete}
      data-slot="input"
      onClick={handleDateTimeClick}
      onFocus={handleDateTimeFocus}
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Enhanced styling for datetime inputs
        type === "datetime-local" || type === "date" || type === "time" ? 
          "cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-80 [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-datetime-edit]:cursor-pointer hover:bg-accent/50 focus:bg-accent/30" : "",
        className
      )}
      {...props}
    />
  )
}

export { Input }
