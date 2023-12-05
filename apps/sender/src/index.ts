import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { publicProcedure, router } from "./trpc.js";

const packet = z.object({
  company: z.string(),
  timestamp: z.string(),
  pressure: z.number(),
});

type Packet = z.infer<typeof packet>;

const eventEmitter = new EventEmitter();
const data: Packet[] = [];

const appRouter = router({
  add: publicProcedure
    .input(packet)
    .mutation(({ input }) => {
      data.push({ ...input });
      eventEmitter.emit("add", input);
      return data;
    }),
  onAdd: publicProcedure.subscription(() => {
    return observable<Packet>(emit => {
      const onAdd = (data: Packet) => emit.next(data);

      eventEmitter.on("add", onAdd);
      return () => eventEmitter.off("add", onAdd);
    });
  }),
  get: publicProcedure.query(() => data),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({ router: appRouter });

server.listen(3000);
