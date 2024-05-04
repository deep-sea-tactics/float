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

async function listenXbee() {
	const { default: SerialPort } = await import('serialport');
	const xbee_api = await import('xbee-api');

	const xbeeAPI = new xbee_api.XBeeAPI({
		api_mode: 1
	});

	const serialport = new SerialPort("/dev/serial0", {
		parser: xbeeAPI.rawParser(),
		baudRate: 9600,
	});

	serialport.on("open", function () {
		var frame_obj = {
			type: 0x10, 

			id: 0x01, 

			destination64: "0013A200407A25A7",
			broadcastRadius: 0x00,
			options: 0x00, 
			data: "Hello world" 
		};
		
		serialport.write(xbeeAPI.buildFrame(frame_obj));
		console.log('Sent to serial port.');
	});

	serialport.on('data', function (data) {
		console.log('data received: ' + data);
	});

	// All frames parsed by the XBee will be emitted here
	xbeeAPI.on("frame_object", function (frame) {
		console.log(">>", frame);
	});
}

const isMock = process.env.MOCK === 'true';

if (!isMock) {
	listenXbee();
}

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
