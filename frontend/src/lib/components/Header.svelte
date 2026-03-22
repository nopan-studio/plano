<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  let projects = $state([]);

  onMount(async () => {
    try {
      const resp = await fetch('/api/projects');
      projects = await resp.json();
    } catch (e) {}
  });

  let breadcrumbs = $derived.by(() => {
    const path = page.url.pathname;
    const parts = path.split('/').filter(Boolean);
    const crumbs = [{ label: 'Overview', href: '/' }];
    
    if (parts[0] === 'projects' && parts[1]) {
      const p = projects.find(x => x.id == parts[1]);
      crumbs.push({ label: p ? p.name : `Project ${parts[1]}`, href: `/projects/${parts[1]}` });
      if (parts[2]) {
        const label = parts[2].charAt(0).toUpperCase() + parts[2].slice(1).replace('-', ' ');
        crumbs.push({ label });
      }
    } else if (parts[0] === 'ideas') {
      crumbs.push({ label: 'Ideas' });
    }
    return crumbs;
  });
</script>

<div class="topbar">
  <div class="logo-wrap" style="display:flex; align-items:center;">
    <a href="/" style="text-decoration:none; color:inherit">
      <div class="logo">
        <img src="/static/logo.png" style="height:24px; vertical-align:middle; margin-right:8px;" alt="Plano"/>
        Plano
      </div>
    </a>
    <div class="breadcrumb" id="breadcrumb" style="margin-left:14px; display:flex; align-items:center; gap:6px;">
      {#each breadcrumbs as c, i}
        {#if i > 0}<span class="sep" style="color:var(--text-dim); font-size:12px; margin:0 4px;">›</span>{/if}
        {#if i === breadcrumbs.length - 1}
          <span style="color:var(--accent); font-size:13px; font-weight:700; text-shadow: 0 0 10px var(--accent-glow);">{c.label}</span>
        {:else if c.href}
          <a href={c.href} style="text-decoration:none; color:var(--text-mid); font-size:13px; font-weight:500;">{c.label}</a>
        {:else}
          <span style="color:var(--text-mid); font-size:13px; font-weight:500;">{c.label}</span>
        {/if}
      {/each}
    </div>
  </div>

  <div class="top-nav">
  </div>
</div>

<style>
  /* Use global dashboard.css */
</style>
