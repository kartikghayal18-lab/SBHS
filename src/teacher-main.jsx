import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TeacherApp from "./teacher-app";
import "./admin.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TeacherApp />
  </StrictMode>
);
