import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import type { AppRouter } from 'receiver';
import WebSocket from 'ws';
import { companyID } from './constants.js';

const random = (min: number, y: number) => Math.random() * (y - min + 1) + min;

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

	setInterval(() => {
		trpc.addData.mutate({
			company: companyID,
			timestamp: new Date().toISOString(),
			pressure: random(1, 100)
		});
	}, 5000);
}
