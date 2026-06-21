import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[9999px] text-[14.5px] font-medium leading-[21.02px] transition-all duration-200 outline-none focus-visible:outline-2 focus-visible:outline-[#3279F9] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:text-[#AAB1CC] disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-[#45474D] border border-transparent hover:bg-[rgba(183,191,217,0.09)] hover:text-[#121317] active:bg-[rgba(183,191,217,0.15)] active:text-[#121317]",
        destructive:
          "bg-[#FF0000] text-white border border-[#FF0000] hover:bg-red-600 hover:border-red-600 active:bg-red-700 active:border-red-700",
        outline:
          "border border-[#E1E6EC] bg-white text-[#45474D] hover:bg-[rgba(183,191,217,0.09)] hover:text-[#121317] active:bg-[rgba(183,191,217,0.15)]",
        secondary:
          "bg-transparent text-[#45474D] border border-transparent hover:bg-[rgba(183,191,217,0.09)] hover:text-[#121317]",
        ghost:
          "bg-transparent text-[#45474D] border-none hover:bg-[rgba(183,191,217,0.09)] hover:text-[#121317] active:bg-[rgba(183,191,217,0.15)]",
        link: "text-[#45474D] underline-offset-4 bg-transparent border-none hover:underline hover:text-[#121317]",
        cta:
          "bg-[#121317] text-white border border-[#121317] hover:bg-[#212226] hover:border-[#212226] active:bg-[#18191D] active:border-[#18191D]",
      },
      size: {
        default: "h-9 px-4 py-1.5",
        sm: "h-8 px-3 py-1",
        lg: "h-10 px-5 py-2.5 rounded-[45px]",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
