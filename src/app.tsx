import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Toaster } from "@/components/ui/sonner";

import "./styles.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
import { A, useNavigate } from "@solidjs/router";
import { type JSX, onMount, ParentComponent } from "solid-js";
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
    <ThemeProvider>
      <Router root={(props) => <Layout>{props.children} </Layout>}>
        <FileRoutes />
        <Toaster position="top-right" expand={true} richColors closeButton />
      </Router>
    </ThemeProvider>
  );
}

type ThemeContextType = {
  isDark: () => boolean;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextType>();

export const ThemeProvider: ParentComponent = (props) => {
  const [isDark, setIsDark] = createSignal(false);

  const toggleDark = () => {
    setIsDark(!isDark());
    document.documentElement.classList.toggle("dark");
  };

  // Check system preference on mount
  if (typeof window !== "undefined") {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(darkMode);
    document.documentElement.classList.toggle("light", darkMode);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
