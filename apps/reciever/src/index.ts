import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "sender";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});
