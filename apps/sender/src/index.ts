import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { router } from "./trpc";

const appRouter = router({

});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({ router: appRouter });

server.listen(3000);
