import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { A } from "@solidjs/router";
import { createSignal, For, JSX, onMount } from "solid-js";

export default function Page(props: { children: JSX.Element }) {
  const { children } = props;
  return (
    <div>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "350px",
          } as JSX.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-2.5">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator class="hidden md:block" />
                <BreadcrumbItem>Journal</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div class="flex flex-1 flex-col gap-4 p-4">{props.children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
