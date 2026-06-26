import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CA Raju Koyyala & Associates — Chartered Accountants, Hanamkonda" },
      { name: "description", content: "Hanamkonda-based CA firm: GST, ITR, audit, company registration, tax planning & bookkeeping. 500+ clients served, 12+ years experience." },
      { property: "og:title", content: "CA Raju Koyyala & Associates — Chartered Accountants" },
      { property: "og:description", content: "Your financial partner in every decision." },
    ],
  }),
  component: Home,
});
