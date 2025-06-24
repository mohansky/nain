import { cn } from "@/lib/utils";
import { IconProps } from "@/types";
import React from "react";

export const DashboardIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  // variant = "default",
  color,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      // fill="none"
      // stroke="currentColor"
      // strokeWidth="2"
      // strokeLinecap="round"
      // strokeLinejoin="round"
      className={cn(
        " ",
        color && {
          "text-primary": color === "primary",
          "text-secondary": color === "secondary",
          "text-accent": color === "accent",
          // ... other colors
        },
        // variant === "filled" && "fill-current",
        className
      )}
      {...props}
    >
  <path d="M2 13H8V21H2V13ZM16 8H22V21H16V8ZM9 3H15V21H9V3ZM4 15V19H6V15H4ZM11 5V19H13V5H11ZM18 10V19H20V10H18Z"></path>
</svg>
  );
};

export default DashboardIcon;

{/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M2 13H8V21H2V13ZM16 8H22V21H16V8ZM9 3H15V21H9V3ZM4 15V19H6V15H4ZM11 5V19H13V5H11ZM18 10V19H20V10H18Z"></path>
</svg>; */}
