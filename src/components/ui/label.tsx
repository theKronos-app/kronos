import { Component, JSX } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/libs/cn";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

type LabelProps = JSX.LabelHTMLAttributes<HTMLLabelElement> &
  VariantProps<typeof labelVariants>;

const Label: Component<LabelProps> = (props) => {
  const { class: className, ...rest } = props;

  return <label class={cn(labelVariants(), className)} {...rest} />;
};

export { Label };
