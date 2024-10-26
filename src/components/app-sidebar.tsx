import { Component, For, createSignal } from "solid-js";
import { Calendar1, Hourglass, Kanban, ListTodo, Notebook } from "lucide-solid";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Dynamic } from "solid-js/web";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Journal",
      url: "#",
      icon: Notebook,
      isActive: true,
    },
    {
      title: "Tasks",
      url: "#",
      icon: ListTodo,
      isActive: false,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar1,
      isActive: false,
    },
    {
      title: "Projects",
      url: "#",
      icon: Kanban,
      isActive: false,
    },
  ],
  mails: [
    {
      name: "July 12, 2023",
      subject: "Etc...",
      teaser:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem, temporibus.",
    },
  ],
};

type SidebarProps = {
  class?: string;
  [key: string]: any;
};

export const AppSidebar: Component<SidebarProps> = (props) => {
  const [activeItem, setActiveItem] = createSignal(data.navMain[0]);
  const [mails, setMails] = createSignal(data.mails);
  const { setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* First sidebar */}
      <Sidebar
        collapsible="none"
        class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground md:h-8 md:p-0"
              >
                <Hourglass class="size-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent class="px-1.5 md:px-0">
              <SidebarMenu>
                <For each={data.navMain}>
                  {(item) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={(e: MouseEvent) => {
                          setActiveItem(item);
                          const randomizedMails = [...data.mails].sort(
                            () => Math.random() - 0.5,
                          );
                          setMails(
                            randomizedMails.slice(
                              0,
                              Math.max(5, Math.floor(Math.random() * 10) + 1),
                            ),
                          );
                          setOpen(true);
                        }}
                        isActive={activeItem()?.title === item.title}
                        class="px-2.5 md:px-2"
                      >
                        <Dynamic component={item.icon} />
                        {/* <span>{item.title}</span> */}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </For>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      </Sidebar>

      {/* Second sidebar */}
      <Sidebar collapsible="none" class="hidden flex-1 md:flex">
        <SidebarHeader class="gap-3.5 border-b p-4">
          <div class="flex w-full items-center justify-between">
            <div class="text-base font-medium text-foreground">
              {activeItem().title}
            </div>
            {/* <Label class="flex items-center gap-2 text-sm"> */}
            {/*   <span>Unreads</span> */}
            {/*   <Switch class="shadow-none" /> */}
            {/* </Label> */}
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup class="px-0">
            <SidebarGroupContent>
              <For each={mails()}>
                {(mail) => (
                  <a
                    href="#"
                    class="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div class="flex w-full items-center gap-2">
                      <span>{mail.name}</span>{" "}
                      <span class="ml-auto text-xs">{mail.date}</span>
                    </div>
                    <span class="font-medium">{mail.subject}</span>
                    <span class="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                      {mail.teaser}
                    </span>
                  </a>
                )}
              </For>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
};
