import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Toaster } from "@/components/ui/sonner";

import "./styles.css";

export default function App() {
  return (
    <Router>
      <FileRoutes />
      <Toaster position="top-right" expand={true} richColors closeButton />
    </Router>
  );
}
