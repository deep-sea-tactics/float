<script lang="ts">
	import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
	// TODO: use chart.js tree-shaking
	import { Chart } from 'chart.js/auto';
	import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
	import dayjs from 'dayjs';
	import type { AppRouter } from 'receiver';
	import { onMount } from 'svelte';
	import { transform } from 'cloud-url-resolver';

	let canvas: HTMLCanvasElement;
	let count = 0;

	function addData(chart: Chart<'line', number[], string>, label: string, newData: number) {
		chart.data.labels?.push(label);
		for (const dataset of chart.data.datasets) {
			dataset.data.push(newData);
		}
		chart.update();
	}

	onMount(() => {
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
			},
			options: {
				scales: {
					x: {
						type: 'time',
						time: {
							tooltipFormat: 'mm:ss',
							unit: 'second',
							displayFormats: {
								second: 'm:ss'
							}
						},
						ticks: {
							source: 'data'
						},
						title: {
							display: true,
							text: 'Time'
						}
					},
					y: {
						title: {
							display: true,
							text: 'Depth'
						}
					}
				}
			}
		});

		trpc.onAdd.subscribe(undefined, {
			onData: (data) => {
				addData(chart, dayjs(new Date(data.timestamp)).toISOString(), data.pressure);
				count++;
			},
			onError: (error) => {
				console.error(error);
			}
		});
	});
</script>

<canvas bind:this={canvas} />

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
