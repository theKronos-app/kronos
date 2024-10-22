import { Component, JSX, ParentProps, splitProps } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { cn } from "@/libs/cn";

type BreadcrumbProps = ParentProps<{
  class?: string;
}>;

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <nav aria-label="Breadcrumb" class={cn("flex", local.class)} {...others}>
      {local.children}
    </nav>
  );
};

export const BreadcrumbList: Component<BreadcrumbProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <ol
      class={cn(
        "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </ol>
  );
};

export const BreadcrumbItem: Component<BreadcrumbProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <li class={cn("inline-flex items-center gap-2", local.class)} {...others}>
      {local.children}
    </li>
  );
};

type BreadcrumbLinkProps = ParentProps<{
  href: string;
  class?: string;
  onClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
}>;

export const BreadcrumbLink: Component<BreadcrumbLinkProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <a
      class={cn("transition-colors hover:text-foreground", local.class)}
      {...others}
    >
      {local.children}
    </a>
  );
};

export const BreadcrumbPage: Component<BreadcrumbProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <span
      aria-current="page"
      class={cn("font-medium text-foreground", local.class)}
      {...others}
    >
      {local.children}
    </span>
  );
};

export const BreadcrumbSeparator: Component<
  JSX.HTMLAttributes<HTMLSpanElement>
> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <span
      role="separator"
      aria-hidden="true"
      class={cn("text-muted-foreground", local.class)}
      {...others}
    >
      <ChevronRight class="h-4 w-4" />
    </span>
  );
};
