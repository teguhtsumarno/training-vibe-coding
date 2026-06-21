import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-[#3279F9] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#121317] text-white border-transparent [a]:hover:bg-[#212226]",
        secondary:
          "bg-[#EFF2F7] text-[#45474D] border-transparent [a]:hover:bg-[#E6EAF0]",
        destructive:
          "bg-red-50 text-red-600 border-red-200 [a]:hover:bg-red-100",
        outline:
          "border-[#E1E6EC] text-[#45474D] bg-white [a]:hover:bg-[#F8F9FC]",
        ghost:
          "border-transparent bg-transparent text-[#45474D] hover:bg-[rgba(183,191,217,0.09)]",
        link: "border-transparent text-[#3279F9] underline-offset-4 hover:underline bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
