import { createFileRoute } from "@tanstack/react-router";
import Admin from "@/pages/Admin/Admin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — CA Raju Koyyala & Associates" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});
