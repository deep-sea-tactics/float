import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import { z } from 'zod';
import { publicProcedure, router } from './trpc.js';

const packet = z.object({
	company: z.string(),
	timestamp: z.number(),
	pressure: z.number()
});

type Packet = z.infer<typeof packet>;

const eventEmitter = new EventEmitter();
const data: Packet[] = [];

const appRouter = router({
	addData: publicProcedure.input(packet).mutation(({ input }) => {
		data.push({ ...input });
		eventEmitter.emit('add', input);
		return data;
	}),
	onAdd: publicProcedure.subscription(() => {
		return observable<Packet>((emit) => {
			const onAdd = (data: Packet) => emit.next(data);

			eventEmitter.on('add', onAdd);
			return () => eventEmitter.off('add', onAdd);
		});
	}),
	getData: publicProcedure.query(() => data)
});

export type AppRouter = typeof appRouter;

const wss = new WebSocketServer({
	port: 3000
});

const handler = applyWSSHandler({ wss, router: appRouter });
wss.on('connection', (ws) => {
	console.log(`➕ Connection (${wss.clients.size})`);
	ws.once('close', () => {
		console.log(`➖ Connection (${wss.clients.size})`);
	});
});

console.log('✅ WebSocket Server listening on ws://localhost:3000');

function close() {
	handler.broadcastReconnectNotification();
	wss.close();
}

process.on('SIGTERM', close);
process.on('SIGINT', close);
