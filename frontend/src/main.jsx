import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { DeferredToaster } from "./components/DeferredToaster.jsx";

const client = new QueryClient();

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={client}>
    <App />
    <DeferredToaster />
  </QueryClientProvider>,
);
