"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-white transition-all duration-300 focus-visible:outline-none ",
  {
    variants: {
      variant: {
        default: "bg-accent text-[#06111c] shadow-lg shadow-accent/15 hover:bg-accent-hover hover:shadow-accent/25",
        primary: "bg-[#0d1727] text-[#e8eef8] border border-white/8 hover:bg-[#121f31]",
        outline: "border border-accent bg-transparent text-accent hover:bg-accent hover:text-[#06111c]",
      },

      size: {
        default: "h-[40px] px-6",
        md: "h-[44px] px-6",
        lg: "h-[48px] px-8 text-sm uppercase tracking-[2px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
