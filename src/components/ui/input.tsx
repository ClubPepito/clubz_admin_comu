import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, size = "default", ...props }: React.ComponentProps<"input"> & { size?: "default" | "lg" }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-xl border-2 border-transparent bg-muted/20 px-4 font-bold transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary/30 focus-visible:bg-muted/30 disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "h-10 text-sm px-3",
        size === "lg" && "h-12 text-base rounded-xl px-4",
        className
      )}
      {...props}
    />
  )
}

export { Input }
