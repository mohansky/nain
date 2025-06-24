import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

const headingVariants = cva("text-3xl font-bold mb-14", {
  variants: {
    variant: {
      default: "text-foreground text-xl font-semibold mb-3",
      sectiontitle:
        "text-center mb-14 relative before:absolute before:content-[''] before:h-0.5 before:w-32 before:-bottom-2.5 before:left-1/2 before:-translate-x-1/2 before:bg-primary after:absolute after:content-[''] after:h-2.5 after:w-2.5 after:rounded-full after:bg-background after:border-2 after:border-primary after:shadow-[0_0_0_5px_rgba(0,0,0)] after:shadow-background after:-bottom-3.5 after:left-1/2 after:-translate-x-1/2",
      sectiontitlehalf:
        "mb-14 relative before:absolute before:content-[''] before:h-0.5 before:w-16 before:-bottom-2.5 before:left-6 before:bg-primary after:absolute after:content-[''] after:h-2.5 after:w-2.5 after:rounded-full after:bg-transparent after:border-2 after:border-primary after:shadow-[0_0_0_5px_rgba(0,0,0)] after:shadow-transparent after:-bottom-3.5 after:left-2",
      sectiontitlesm: "bg-primary/20 text-foreground shadow",
    },
    size: {
      xxxl: "text-6xl md:text-9xl",
      xxl: "text-5xl md:text-8xl",
      xl: "text-4xl md:text-7xl",
      lg: "text-3xl md:text-5xl",
      md: "text-2xl md:text-4xl",
      sm: "text-xl md:text-2xl",
      xs: "text-xs md:text-base",
      xxs: "text-xs md:text-sm",
      xxxs: "text-[0.5rem] md:text-xs",
    },
    fontweight: {
      black: "font-black",
      bold: "font-bold",
      semibold: "font-semibold",
      normal: "font-normal",
      medium: "font-medium",
      light: "font-light",
      extralight: "font-extralight",
      thin: "font-thin",
    },
    fontstyle: {
      notoSans: "font-notoSans",
      openSans: "font-openSans",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    fontweight: "bold",
    fontstyle: "notoSans",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  asChild?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      children,
      className,
      variant,
      size,
      fontweight,
      fontstyle,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "h2";
    return (
      <Comp
        className={cn(
          headingVariants({ variant, size, fontweight, fontstyle, className })
        )}
        {...props}
        ref={ref}
      >
        {children}
      </Comp>
    );
  }
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
