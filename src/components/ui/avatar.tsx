import { cn } from "@/libs/cn";
import { Component, JSX, Show, createSignal, splitProps } from "solid-js";

// Types
type AvatarProps = {
  class?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

type AvatarImageProps = {
  class?: string;
  src?: string;
  alt?: string;
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
} & JSX.ImgHTMLAttributes<HTMLImageElement>;

type AvatarFallbackProps = {
  class?: string;
  delayMs?: number;
} & JSX.HTMLAttributes<HTMLDivElement>;

// Components
export const Avatar: Component<AvatarProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <div
      class={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        props.class,
      )}
      {...rest}
    />
  );
};

export const AvatarImage: Component<AvatarImageProps> = (props) => {
  const [, rest] = splitProps(props, [
    "class",
    "src",
    "alt",
    "onLoadingStatusChange",
  ]);
  const [status, setStatus] = createSignal<"loading" | "loaded" | "error">(
    "loading",
  );

  const handleLoad = () => {
    setStatus("loaded");
    props.onLoadingStatusChange?.("loaded");
  };

  const handleError = () => {
    setStatus("error");
    props.onLoadingStatusChange?.("error");
  };

  return (
    <Show when={status() !== "error"}>
      <img
        class={cn("aspect-square h-full w-full", props.class)}
        src={props.src}
        alt={props.alt}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    </Show>
  );
};

export const AvatarFallback: Component<AvatarFallbackProps> = (props) => {
  const [, rest] = splitProps(props, ["class", "delayMs"]);
  const [isVisible, setIsVisible] = createSignal(false);

  // Handle delay showing fallback
  if (props.delayMs) {
    setTimeout(() => setIsVisible(true), props.delayMs);
  } else {
    setIsVisible(true);
  }

  return (
    <Show when={isVisible()}>
      <div
        class={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted",
          props.class,
        )}
        {...rest}
      />
    </Show>
  );
};

// Usage example:
/*
<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
*/
