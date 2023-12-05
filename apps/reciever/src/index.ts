import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "sender";

const isMock = process.env.MOCK === "true";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

if (isMock) {
  const random = (min: number, y: number) => Math.random() * (y - min + 1) + min;

  setInterval(() => {
    trpc.add.mutate({
      company: "TEST01",
      timestamp: new Date().toISOString(),
      pressure: random(1, 100),
    })
  }, 5000)
} else {
  console.error("Unimplemented!")
  process.exit(1);
}
