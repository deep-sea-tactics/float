<script lang="ts">
	import Chart from "$lib/Chart.svelte";
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	
	let chartSymbol = Symbol();

	function showSettings() {
		pushState('', {
			showingModal: true
		})
	}
</script>

<main>
	{#if $page.state.showingModal}
		<button class="modal" on:click|self={() => history.back()}>
			<div class="container">
				<h1>Settings</h1>
				<button on:click={() => chartSymbol = Symbol()}>Reset All Data</button>
			</div>
		</button>
	{/if}

	<button class="settings" on:click={showSettings}>Settings</button>
	
	{#key chartSymbol}
		<Chart />
	{/key}
</main>

<style>
	button.settings {
		top: 0;
		left: 0;
		margin: 1rem;
		position: fixed;
		padding: 0.5rem 1rem;
		border: 2px solid black;
		z-index: 0;
	}

	div.container {
		background-color: white;
		padding: 1rem;
		border-radius: 1rem;
		max-width: 50%;
	}

	button.modal {
		position: fixed;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
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
