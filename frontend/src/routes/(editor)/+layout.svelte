<script>
  import { onMount } from 'svelte';
  import { initRealtime } from '$lib/realtime.svelte';
  import "$lib/styles/app.css";
  import "$lib/styles/dashboard.css";
  import Toast from "$lib/components/Toast.svelte";

  let { children } = $props();

  onMount(initRealtime);
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
  <title>Plano Editor</title>
</svelte:head>

{@render children()}
<Toast />

<style>
  /* Minimal styles for editor container */
</style>
