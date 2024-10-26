import {
	type Component,
	createSignal,
	createContext,
	useContext,
	createEffect,
	createMemo,
	onCleanup,
	type JSX,
	type ParentProps,
	splitProps,
	mergeProps,
	Show,
} from "solid-js";
import { cva } from "class-variance-authority";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Dynamic } from "solid-js/web";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextType = {
	state: () => "expanded" | "collapsed";
	open: () => boolean;
	setOpen: (open: boolean) => void;
	openMobile: () => boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: () => boolean;
	toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType>();

function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a Sidebar.");
	}
	return context;
}

type SidebarProviderProps = ParentProps<{
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	class?: string;
	style?: JSX.CSSProperties;
}>;

export const SidebarProvider: Component<SidebarProviderProps> = (props) => {
	const [local, others] = splitProps(props, [
		"defaultOpen",
		"open",
		"onOpenChange",
		"children",
		"class",
		"style",
	]);

	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = createSignal(false);
	const [_open, _setOpen] = createSignal(local.defaultOpen ?? true);

	// Create accessor function to match context type
	const getOpen = () => local.open ?? _open();

	const setOpen = (value: boolean) => {
		if (local.onOpenChange) {
			local.onOpenChange(value);
		} else {
			_setOpen(value);
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		}
	};

	const toggleSidebar = () => {
		return isMobile() ? setOpenMobile(!openMobile()) : setOpen(!getOpen());
	};

	createEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				toggleSidebar();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});

	const state = createMemo(() => (getOpen() ? "expanded" : "collapsed"));

	// Create context value with proper types
	const contextValue: SidebarContextType = {
		state: () => state(), // Ensure memo is accessed as function
		open: getOpen,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar,
	};

	return (
		<SidebarContext.Provider value={contextValue}>
			<div
				style={{
					"--sidebar-width": SIDEBAR_WIDTH,
					"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
					...local.style,
				}}
				class={cn(
					"group/sidebar-wrapper flex min-h-svh w-full text-sidebar-foreground has-[[data-variant=inset]]:bg-sidebar",
					local.class,
				)}
				{...others}
			>
				{local.children}
			</div>
		</SidebarContext.Provider>
	);
};

type SidebarProps = ParentProps<{
	side?: "left" | "right";
	variant?: "sidebar" | "floating" | "inset";
	collapsible?: "offcanvas" | "icon" | "none";
	class?: string;
}>;

export const Sidebar: Component<SidebarProps> = (props) => {
	const ctx = useSidebar();
	const [local, others] = splitProps(props, [
		"side",
		"variant",
		"collapsible",
		"children",
		"class",
	]);

	const side = local.side || "left";
	const variant = local.variant || "sidebar";
	const collapsible = local.collapsible || "offcanvas";

	const renderedChildren = createMemo(() => local.children);

	if (collapsible === "none") {
		return (
			<div
				class={cn(
					"flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
					local.class,
				)}
				{...others}
			>
				{renderedChildren()}
			</div>
		);
	}

	if (ctx.isMobile()) {
		return (
			<Sheet open={ctx.openMobile()} onOpenChange={ctx.setOpenMobile}>
				<SheetContent
					data-sidebar="sidebar"
					data-mobile="true"
					class="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
					style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
					position={side}
				>
					<div class="flex h-full w-full flex-col">{renderedChildren()}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			class="group peer hidden md:block"
			data-state={ctx.state()}
			data-collapsible={ctx.state() === "collapsed" ? collapsible : ""}
			data-variant={variant}
			data-side={side}
			{...others}
		>
			<div
				class={cn(
					"relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
					"group-data-[collapsible=offcanvas]:w-0",
					"group-data-[side=right]:rotate-180",
					variant === "floating" || variant === "inset"
						? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
						: "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
				)}
			/>
			<div
				class={cn(
					"fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
					side === "left"
						? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
						: "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
					variant === "floating" || variant === "inset"
						? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
						: "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
					local.class,
				)}
			>
				<div
					data-sidebar="sidebar"
					class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
				>
					<Show when={renderedChildren()}>{renderedChildren()}</Show>
				</div>
			</div>
		</div>
	);
};

export const SidebarTrigger: Component<
	JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
	const { toggleSidebar } = useSidebar();
	const [local, others] = splitProps(props, ["class", "onClick"]);

	return (
		<Button
			data-sidebar="trigger"
			variant="ghost"
			size="icon"
			class={cn(
				"h-9 w-9",
				"[&>svg]:size-4 [&>svg]:shrink-0",
				"text-sidebar-foreground",
				"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				"focus-visible:ring-sidebar-ring",
				local.class,
			)}
			onClick={(event: MouseEvent) => {
				if (typeof local.onClick === "function") {
					local.onClick(event);
				}
				toggleSidebar();
			}}
			{...others}
		>
			<IconPhSidebarSimple />
			<span class="sr-only">Toggle Sidebar</span>
		</Button>
	);
};

export const SidebarRail: Component<
	JSX.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
	const { toggleSidebar } = useSidebar();
	const [local, others] = splitProps(props, ["class"]);

	return (
		<button
			data-sidebar="rail"
			aria-label="Toggle Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			class={cn(
				"absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
				"[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
				"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
				"group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
				"[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
				"[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
				local.class,
			)}
			{...others}
		/>
	);
};

export const SidebarInset: Component<JSX.HTMLAttributes<HTMLElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<main
			class={cn(
				"relative flex min-h-svh flex-1 flex-col bg-background",
				"peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
				local.class,
			)}
			{...others}
		/>
	);
};

export interface SidebarInputProps
	extends JSX.InputHTMLAttributes<HTMLInputElement> {
	ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

export const SidebarInput: Component<SidebarInputProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "ref"]);

	return (
		<Input
			data-sidebar="input"
			class={cn(
				"h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
				local.class,
			)}
			ref={local.ref}
			{...others}
		/>
	);
};

export const SidebarHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			data-sidebar="header"
			class={cn("flex flex-col gap-2 p-2", local.class)}
			{...others}
		/>
	);
};

export const SidebarFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			data-sidebar="footer"
			class={cn("flex flex-col gap-2 p-2", local.class)}
			{...others}
		/>
	);
};

export const SidebarSeparator: Component<JSX.HTMLAttributes<HTMLHRElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<Separator
			data-sidebar="separator"
			class={cn("mx-2 w-auto bg-sidebar-border", local.class)}
			{...others}
		/>
	);
};

export const SidebarContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			data-sidebar="content"
			class={cn(
				"flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
				local.class,
			)}
			{...others}
		/>
	);
};

export const SidebarGroup: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			data-sidebar="group"
			class={cn("relative flex w-full min-w-0 flex-col p-2", local.class)}
			{...others}
		/>
	);
};

export const SidebarGroupLabel: Component<
	JSX.HTMLAttributes<HTMLDivElement> & {
		as?: keyof JSX.IntrinsicElements | Component;
	}
> = (props) => {
	const [local, others] = splitProps(props, ["class", "as"]);

	return (
		<Dynamic
			component={local.as || "div"}
			data-sidebar="group-label"
			class={cn(
				"flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
				"group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
				local.class,
			)}
			{...others}
		/>
	);
};

// SidebarGroupAction Component
export const SidebarGroupAction: Component<
	JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
		as?: keyof JSX.IntrinsicElements | Component;
	}
> = (props) => {
	const [local, others] = splitProps(props, ["class", "as"]);

	return (
		<Dynamic
			component={local.as || "button"}
			data-sidebar="group-action"
			class={cn(
				"absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
				"after:absolute after:-inset-2 after:md:hidden",
				"group-data-[collapsible=icon]:hidden",
				local.class,
			)}
			{...others}
		/>
	);
};

export const SidebarGroupContent: Component<
	JSX.HTMLAttributes<HTMLDivElement>
> = (props) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			data-sidebar="group-content"
			class={cn("w-full text-sm", local.class)}
			{...others}
		/>
	);
};

export const SidebarMenu: Component<JSX.HTMLAttributes<HTMLUListElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<ul
			data-sidebar="menu"
			class={cn("flex w-full min-w-0 flex-col gap-1", local.class)}
			{...others}
		/>
	);
};

export const SidebarMenuItem: Component<JSX.HTMLAttributes<HTMLLIElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<li
			data-sidebar="menu-item"
			class={cn("group/menu-item relative", local.class)}
			{...others}
		/>
	);
};

const sidebarMenuButtonVariants = cva(
	"peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				outline:
					"bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
			},
			size: {
				default: "h-8 text-sm",
				sm: "h-7 text-xs",
				lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type SidebarButtonSize = "default" | "sm" | "lg";
type SidebarButtonVariant = "default" | "outline";

type SidebarMenuButtonProps = {
	as?: keyof JSX.IntrinsicElements | Component;
	isActive?: boolean;
	tooltip?: string | JSX.Element;
	variant?: SidebarButtonVariant;
	size?: SidebarButtonSize;
	class?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const SidebarMenuButton: Component<SidebarMenuButtonProps> = (props) => {
	const [local, others] = splitProps(props, [
		"as",
		"isActive",
		"tooltip",
		"variant",
		"size",
		"class",
		"children",
	]);

	const { isMobile, state } = useSidebar();

	const button = (
		<Dynamic
			component={local.as || "button"}
			type={local.as === "button" ? "button" : undefined}
			data-sidebar="menu-button"
			data-size={local.size || "default"}
			data-active={local.isActive}
			class={cn(
				sidebarMenuButtonVariants({
					variant: local.variant,
					size: local.size,
				}),
				local.class,
			)}
			{...others}
		>
			{local.children}
		</Dynamic>
	);

	// Early return if no tooltip
	if (!local.tooltip) {
		return button;
	}

	// Show tooltip only when sidebar is collapsed and not on mobile
	const shouldShowTooltip = () => state() === "collapsed" && !isMobile();

	return (
		<Tooltip>
			<TooltipTrigger>{button}</TooltipTrigger>
			<Show when={shouldShowTooltip()}>
				<TooltipContent>
					<div class="text-sm">
						{typeof local.tooltip === "string" ? local.tooltip : local.tooltip}
					</div>
				</TooltipContent>
			</Show>
		</Tooltip>
	);
};

type SidebarMenuActionProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	as?: keyof JSX.IntrinsicElements | Component;
	showOnHover?: boolean;
};

export const SidebarMenuAction: Component<SidebarMenuActionProps> = (props) => {
	const [local, others] = splitProps(props, ["class", "as", "showOnHover"]);

	return (
		<Dynamic
			component={local.as || "button"}
			data-sidebar="menu-action"
			class={cn(
				// Base styles
				"text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				"peer-hover/menu-button:text-sidebar-accent-foreground",
				"absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center",
				"rounded-md p-0 outline-none transition-transform focus-visible:ring-2",
				"[&>svg]:size-4 [&>svg]:shrink-0",

				// Mobile touch target
				"after:absolute after:-inset-2 after:md:hidden",

				// Size variants based on parent
				"peer-data-[size=sm]/menu-button:top-1",
				"peer-data-[size=default]/menu-button:top-1.5",
				"peer-data-[size=lg]/menu-button:top-2.5",

				// Collapse state
				"group-data-[collapsible=icon]:hidden",

				// Hover visibility logic
				local.showOnHover && [
					"peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
					"group-focus-within/menu-item:opacity-100",
					"group-hover/menu-item:opacity-100",
					"data-[state=open]:opacity-100",
					"md:opacity-0",
				],

				// Custom classes
				local.class,
			)}
			{...others}
		/>
	);
};

export const SidebarMenuBadge: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<div
			data-sidebar="menu-badge"
			class={cn(
				"pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
				"peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
				"peer-data-[size=sm]/menu-button:top-1",
				"peer-data-[size=default]/menu-button:top-1.5",
				"peer-data-[size=lg]/menu-button:top-2.5",
				"group-data-[collapsible=icon]:hidden",
				local.class,
			)}
			{...others}
		/>
	);
};

export const SidebarMenuSkeleton: Component<
	JSX.HTMLAttributes<HTMLDivElement> & {
		showIcon?: boolean;
	}
> = (props) => {
	const [local, others] = splitProps(props, ["class", "showIcon"]);
	const width = createMemo(() => `${Math.floor(Math.random() * 40) + 50}%`);

	return (
		<div
			data-sidebar="menu-skeleton"
			class={cn("flex h-8 items-center gap-2 rounded-md px-2", local.class)}
			{...others}
		>
			{local.showIcon && (
				<Skeleton class="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
			)}
			<Skeleton
				class="h-4 max-w-[--skeleton-width] flex-1"
				data-sidebar="menu-skeleton-text"
				style={{ "--skeleton-width": width() }}
			/>
		</div>
	);
};

export const SidebarMenuSub: Component<JSX.HTMLAttributes<HTMLUListElement>> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<ul
			data-sidebar="menu-sub"
			class={cn(
				"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
				"group-data-[collapsible=icon]:hidden",
				local.class,
			)}
			{...others}
		/>
	);
};

export const SidebarMenuSubItem: Component<
	JSX.HTMLAttributes<HTMLLIElement>
> = (props) => {
	return <li {...props} />;
};

type MenuSize = "sm" | "md";

type SidebarMenuSubButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
	as?: keyof JSX.IntrinsicElements | Component;
	size?: MenuSize;
	isActive?: boolean;
};

export const SidebarMenuSubButton: Component<SidebarMenuSubButtonProps> = (
	props,
) => {
	const [local, others] = splitProps(props, [
		"class",
		"as",
		"size",
		"isActive",
	]);

	return (
		<Dynamic
			component={local.as || "a"}
			data-sidebar="menu-sub-button"
			data-size={local.size || "md"}
			data-active={local.isActive}
			class={cn(
				// Base styles
				"text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				"active:bg-sidebar-accent active:text-sidebar-accent-foreground",
				"flex h-7 min-w-0 -translate-x-px items-center gap-2 [&>svg]:text-sidebar-accent-foreground",
				"overflow-hidden rounded-md px-2 outline-none focus-visible:ring-2",
				// Disabled states
				"disabled:pointer-events-none disabled:opacity-50",
				"aria-disabled:pointer-events-none aria-disabled:opacity-50",
				// Child element styles
				"[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
				// Active state
				"data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
				// Size variants
				local.size === "sm" && "text-xs",
				local.size === "md" && "text-sm",
				// Collapsible state
				"group-data-[collapsible=icon]:hidden",
				// Custom classes
				local.class,
			)}
			{...others}
		/>
	);
};

export {
	useSidebar,
	type SidebarContextType,
	type SidebarProps,
	type SidebarMenuButtonProps,
};
