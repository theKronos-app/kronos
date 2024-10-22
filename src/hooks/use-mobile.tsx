import { createSignal, createEffect, onCleanup } from "solid-js";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = createSignal(
    window.innerWidth < MOBILE_BREAKPOINT,
  );

  createEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);

    // Cleanup is handled by onCleanup in Solid
    onCleanup(() => mql.removeEventListener("change", onChange));
  });

  // In Solid, we return the signal directly
  return isMobile;
}

// Usage example:
// const isMobile = useIsMobile()
// <div>{isMobile() ? "Mobile" : "Desktop"}</div>
