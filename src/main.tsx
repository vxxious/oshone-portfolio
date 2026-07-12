import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Toaster position="bottom-right" richColors closeButton />
    <Layout>
      <AnimatedRoutes />
    </Layout>
  </BrowserRouter>
);
