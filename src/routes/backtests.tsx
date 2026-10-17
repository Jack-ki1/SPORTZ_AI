import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/backtests")({
  beforeLoad: () => {
    throw redirect({ to: "/settings" });
  },
});
