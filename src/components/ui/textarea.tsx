import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-[#E1E6EC] bg-white px-3 py-2.5 text-[14.5px] text-[#121317] transition-all duration-200 outline-none placeholder:text-[#6A6A71] focus-visible:border-[#3279F9] focus-visible:ring-[3px] focus-visible:ring-[rgba(50,121,249,0.1)] disabled:cursor-not-allowed disabled:bg-[#F8F9FC] disabled:opacity-50 aria-invalid:border-[#FF0000] aria-invalid:ring-[3px] aria-invalid:ring-[rgba(255,0,0,0.06)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
