import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { publicProcedure, router } from "./trpc.js";

interface DataPoint {
  timestamp: Date;
  pressure: number;
}

const data: DataPoint[] = [];

const packet = z.object({
  company: z.string(),
  timestamp: z.string(),
  pressure: z.number(),
});

const appRouter = router({
  add: publicProcedure
    .input(packet)
    .mutation(({ input }) => {
      data.push({
        timestamp: new Date(),
        pressure: input.pressure,
      });
      return data;
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({ router: appRouter });

server.listen(3000);
