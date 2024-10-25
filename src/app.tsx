import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Toaster } from "@/components/ui/sonner";

import "./styles.css";
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
import { A, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, JSX, onMount } from "solid-js";
import { getCurrentKronosphere } from "@/lib/file-system/kronospheres";

function Layout(props: { children: JSX.Element }) {
  const { children } = props;
  const navigate = useNavigate();

  onMount(async () => {
    const currentKronosphere = await getCurrentKronosphere();
    console.log("current kronosphere:", currentKronosphere);
    if (!currentKronosphere) {
      navigate("/kronosphere");
    }
  });

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
          <div class="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function App() {
  return (
    <Router root={(props) => <Layout>{props.children} </Layout>}>
      <FileRoutes />
      <Toaster position="top-right" expand={true} richColors closeButton />
    </Router>
  );
}
