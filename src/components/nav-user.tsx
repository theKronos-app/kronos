import { createEffect, createSignal, For, Show } from "solid-js";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	getAllKronospheres,
	type Kronosphere,
} from "@/lib/file-system/kronospheres";
import { useNavigate } from "@solidjs/router";

export default function NavUser() {
	const { isMobile } = useSidebar();
	const [kronospheres, setKronospheres] = createSignal<Kronosphere[]>([]);

	const navigate = useNavigate();

	createEffect(async () => {
		const kronospheres = await getAllKronospheres();
		setKronospheres(kronospheres);
	});

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger as={SidebarMenuButton}>
						<SidebarMenuButton
							size="lg"
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
						>
							<IconPhSphere class="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						// side={isMobile ? "bottom" : "right"}
						// align="end"
						// sideOffset={4}
					>
						<DropdownMenuLabel class="p-0 font-normal">
							<For each={kronospheres()}>
								{(item) => (
									<Show when={item.active}>
										<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
											<div class="grid flex-1 text-left text-sm leading-tight">
												<span class="truncate font-semibold">{item.name}</span>
											</div>
										</div>
									</Show>
								)}
							</For>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								class="flex items-center gap-2 text-left text-sm"
								onClick={() => navigate("/kronosphere")}
							>
								<IconPhSphere />
								Manage Kronospheres
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="flex items-center gap-2 text-left text-sm">
								<IconPhGear />
								Settings
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
