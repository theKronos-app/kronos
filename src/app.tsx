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
import { type JSX, onMount } from "solid-js";
import { getCurrentKronosphere } from "@/lib/file-system/kronospheres";
import Header from "./components/header";

function Layout(props: { children: JSX.Element }) {
  const { children } = props;
  const navigate = useNavigate();
  const location = useLocation();

  createEffect(() => {
    console.log("location", location.pathname);
  });

  onMount(async () => {
    const currentKronosphere = await getCurrentKronosphere();
    if (!currentKronosphere) {
      navigate("/kronosphere");
    }
  });

  return (
    <Show
      when={location.pathname === "/kronosphere"}
      fallback={
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
              <Header />
              <div class="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      }
    >
      <Suspense>{children}</Suspense>
    </Show>
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
