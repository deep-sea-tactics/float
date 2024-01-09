<script lang="ts">
	import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
	// TODO: use chart.js tree-shaking
	import { Chart } from 'chart.js/auto';
	import type { AppRouter } from 'receiver';
	import { onMount } from 'svelte';
	import { transform } from 'cloud-url-resolver';

	let canvas: HTMLCanvasElement;
	let count = 0;
	let startTS = Date.now();

	function addData(chart: Chart<'line', number[], string>, label: string, newData: number) {
		chart.data.labels?.push(label);
		for (const dataset of chart.data.datasets) {
			dataset.data.push(newData);
		}
		chart.update();
	}

	onMount(() => {
		startTS = Date.now();
		const wsClient = createWSClient({
			url: transform(3000, 'ws')
		});

		const trpc = createTRPCProxyClient<AppRouter>({
			links: [
				wsLink({
					client: wsClient
				})
			]
		});

		const chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Depth',
						data: [],
						tension: 0.2
					}
				]
			}
		});

		trpc.onAdd.subscribe(undefined, {
			onData: (data) => {
				const timestamp = data.timestamp - startTS;
				// 5 mins, 5 seconds after running should be represented as 05:05
				const minutes = Math.floor(timestamp / 1000 / 60);
				const seconds = Math.floor((timestamp / 1000) % 60);

				const timestampString = `${minutes.toString().padStart(2, '0')}:${seconds
					.toString()
					.padStart(2, '0')}`;

				addData(chart, timestampString, data.pressure);

				//addData(chart, data.timestamp, data.pressure);
				count++;
			},
			onError: (error) => {
				console.error(error);
			}
		});
	});
</script>

<main>
	<canvas bind:this={canvas} />
</main>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
</style>
