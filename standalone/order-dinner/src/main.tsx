import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DinnerApp } from "./ui/dinner-app";
import "./style.css";

createRoot(document.getElementById("root")!).render(<StrictMode><DinnerApp /></StrictMode>);
