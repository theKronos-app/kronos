import { cn } from "@/libs/cn";
import { Component, JSX } from "solid-js";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

const Input: Component<InputProps> = (props) => {
  const { class: className, type, ref, ...rest } = props;

  return (
    <input
      type={type}
      class={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
};

export { Input };
