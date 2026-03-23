<script>
  import "../../lib/styles/app.css";
  import "../../lib/styles/dashboard.css";
  import Sidebar from "../../lib/components/Sidebar.svelte";
  import Header from "../../lib/components/Header.svelte";
  import Toast from "../../lib/components/Toast.svelte";
  import AIIndicator from "../../lib/components/AIIndicator.svelte";
  import { onMount } from 'svelte';
  import { initRealtime } from '$lib/realtime.svelte';

  let { children } = $props();

  onMount(initRealtime);
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
  <title>Plano</title>
</svelte:head>

<div class="shell">
  <Header />

  <div class="body">
    <Sidebar />

    <main class="main">
      {@render children()}
      <Toast />
      <AIIndicator />
    </main>
  </div>
</div>

<style>
  /* ID-specific styles from legacy index.css might be needed later for Editor */
</style>
