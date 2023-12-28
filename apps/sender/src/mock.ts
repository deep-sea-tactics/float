import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import type { AppRouter } from 'receiver';
import WebSocket from 'ws';
import { companyID } from './constants.js';

const random = (min: number, max: number) => Math.random() * (max - min + 1) + min;
let x = random(1, 1000000);

export function mock() {
	const wsClient = createWSClient({
		url: `ws://localhost:3000`,
		WebSocket
	});

	const trpc = createTRPCProxyClient<AppRouter>({
		links: [
			wsLink({
				client: wsClient
			})
		]
	});

	const seed = Math.random();
	setInterval(() => {
		trpc.addData.mutate({
			company: companyID,
			timestamp: Date.now(),
			pressure: Math.sin(2 * x) + Math.sin(Math.PI * x)
		});
		x += seed;
	}, 5000);
}
