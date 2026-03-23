<script>
  import { toast } from '$lib/toast.svelte.js';
</script>

<div id="toast-container">
  {#each $toast as t (t.id)}
    <div 
      class="toast {t.type} show" 
      role="button"
      tabindex="0"
      onclick={() => toast.remove(t.id)}
      onkeydown={(e) => e.key === 'Enter' && toast.remove(t.id)}
    >
      {t.message}
    </div>
  {/each}
</div>

<style>
  #toast-container {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3000000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    pointer-events: none;
  }
  .toast {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--r);
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    pointer-events: auto;
    cursor: pointer;
    animation: toastScaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transition: all 0.2s;
  }
  .toast.ok { border-color: var(--green); color: var(--green); }
  .toast.err { border-color: var(--rose); color: var(--rose); }

  @keyframes toastScaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
