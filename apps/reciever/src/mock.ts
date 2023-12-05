import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "sender";
import { companyID } from "./constants.js";

const random = (min: number, y: number) => Math.random() * (y - min + 1) + min;

export function mock() {
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000",
      }),
    ],
  });

  setInterval(() => {
    trpc.add.mutate({
      company: companyID,
      timestamp: new Date().toISOString(),
      pressure: random(1, 100),
    });
  }, 5000);
}
