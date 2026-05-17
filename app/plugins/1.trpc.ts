import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";
import type { AppRouter } from "#server/trpc/routes/index";

export default defineNuxtPlugin(() => {
  const trpc = createTRPCNuxtClient<AppRouter>({
    links: [httpBatchLink({ url: "/api/trpc" })],
  });

  return {
    provide: {
      trpc,
    },
  };
});
