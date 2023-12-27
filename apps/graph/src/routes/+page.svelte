<script lang="ts">
	import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
	import { Chart } from 'chart.js/auto';
	import { AppRouter } from 'sender';
	import './app.css';

	let canvas: HTMLCanvasElement;
	let count = 0;

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

        function addData(chart: Chart<'line', number[], string>, label: string, newData: number) {
            chart.data.labels?.push(label);
            for (const dataset of chart.data.datasets) {
                dataset.data.push(newData);
            }
            chart.update();
        }

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

<canvas bind:this={canvas} />
