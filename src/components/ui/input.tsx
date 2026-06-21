import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-[#E1E6EC] bg-white px-3 py-2 text-[14.5px] text-[#121317] transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#121317] placeholder:text-[#6A6A71] focus-visible:border-[#3279F9] focus-visible:ring-[3px] focus-visible:ring-[rgba(50,121,249,0.1)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F8F9FC] disabled:opacity-50 aria-invalid:border-[#FF0000] aria-invalid:ring-[3px] aria-invalid:ring-[rgba(255,0,0,0.06)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
