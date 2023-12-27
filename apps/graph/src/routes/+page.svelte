<script lang="ts">
	import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
	import { Chart } from 'chart.js/auto';
	import type { AppRouter } from 'receiver';
	import { onMount } from 'svelte';

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
            url: `ws://localhost:3000`
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
                addData(chart, data.timestamp, data.pressure);
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
