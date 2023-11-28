import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { publicProcedure, router } from "./trpc.js";

const appRouter = router({
    ping: publicProcedure.query(() => `Pong! ${Math.random()}`),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({ router: appRouter });

server.listen(3000);
