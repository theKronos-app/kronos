import {
  Component,
  JSX,
  mergeProps,
  splitProps,
  createMemo,
  ValidComponent,
  children,
} from "solid-js";

// Helper type to extract props from a component
type ElementProps<T> = T extends Component<infer P> ? P : never;

type SlotProps = {
  children?: JSX.Element;
} & JSX.HTMLAttributes<any>;

// Type guard for Solid components
function isSolidElement(child: any): child is { props: any; type: any } {
  return (
    child && typeof child === "object" && "props" in child && "type" in child
  );
}

export const Slot: Component<SlotProps> = (props) => {
  const [local, others] = splitProps(props, ["children"]);

  const child = createMemo(() => {
    // Use Solid's children helper to resolve the child
    const resolved = children(() => local.children);
    const childArray = children(() => resolved());

    // Get the first child
    let firstChild = Array.isArray(childArray())
      ? childArray()[0]
      : childArray();

    // If no children or invalid child, return null
    if (!firstChild) return null;

    // Handle non-element children
    if (typeof firstChild !== "object") return firstChild;

    // Type guard check
    if (!isSolidElement(firstChild)) return firstChild;

    // Merge the props
    const mergedProps = mergeProps(firstChild.props || {}, others);

    // Return the cloned element with merged props
    return typeof firstChild.type === "function"
      ? firstChild.type(mergedProps)
      : firstChild.type(mergedProps);
  });

  return child();
};

// Usage Example
const Example: Component = () => {
  return (
    <Slot class="external" onClick={() => console.log("clicked")}>
      <button class="internal">Click me</button>
    </Slot>
  );
};
