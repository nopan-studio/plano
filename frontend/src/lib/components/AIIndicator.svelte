<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { addRealtimeHandler } from '$lib/realtime.svelte.js';
  import Icon from './Icon.svelte';

  let activeTools = $state([]);

  function formatToolName(name) {
    if (!name) return 'AI Agent';
    return name.split('_').map(word => {
        if (word === 'mcp') return 'MCP';
        if (word === 'ai') return 'AI';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  onMount(() => {
    return addRealtimeHandler((event) => {
      if (event.type === 'mcp_tool_call') {
        const id = Math.random().toString(36).substring(2, 9);
        activeTools = [...activeTools, {
          id,
          tool: formatToolName(event.data.tool),
          rawTool: event.data.tool,
          status: 'active',
          timestamp: Date.now()
        }];
        setTimeout(() => {
          activeTools = activeTools.filter(t => t.id !== id);
        }, 15000); // Fail-safe 15s (Half from 30s)
      } else if (event.type === 'mcp_tool_finish') {
        activeTools = activeTools.map(t => {
          if (t.rawTool === event.data.tool && t.status === 'active') {
             return { ...t, status: 'done' };
          }
          return t;
        });
        setTimeout(() => {
           activeTools = activeTools.filter(t => !(t.rawTool === event.data.tool && t.status === 'done'));
        }, 4000); // Success stay 4s (Half from 8s)
      }
    });
  });
</script>

<div id="mcp-status-container">
  {#each activeTools as tool (tool.id)}
    <div 
      class="flat-indicator" 
      class:is-active={tool.status === 'active'}
      class:is-done={tool.status === 'done'}
      in:fly={{ x: 20, duration: 300 }} 
      out:fade={{ duration: 200 }}
    >
      <div class="indicator-header">
        <div class="status-badge" class:success={tool.status === 'done'}>
          <div class="status-dot"></div>
          {tool.status === 'done' ? 'TASK COMPLETE' : 'AI WORKING'}
        </div>
      </div>

      <div class="indicator-main">
        <div class="icon-box" class:success={tool.status === 'done'}>
          {#if tool.status === 'done'}
            <Icon name="check" size={14} color="var(--green)" stroke={3} />
          {:else}
            <Icon name="ai" size={14} color="var(--accent)" stroke={2.5} />
          {/if}
        </div>
        <div class="details">
          <div class="title-text">AI ACTION</div>
          <div class="value-text">{tool.tool}</div>
        </div>
      </div>

      {#if tool.status === 'active'}
        <div class="flat-progress">
          <div class="flat-bar"></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  #mcp-status-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    z-index: 9999999;
    pointer-events: none;
  }

  .flat-indicator {
    pointer-events: auto;
    width: 260px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--r);
    padding: 10px;
    box-shadow: var(--shadow-md);
    position: relative;
    transition: all 0.2s ease;
  }

  .flat-indicator.is-active {
    border-color: var(--accent);
  }

  .flat-indicator.is-done {
    border-color: var(--green);
  }

  .indicator-header {
    margin-bottom: 8px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    background: var(--surface2);
    color: var(--text-mid);
    border-radius: 4px;
    font-size: 9px;
    font-weight: 800;
    font-family: var(--mono);
    letter-spacing: 0.05em;
  }

  .is-active .status-badge {
      background: var(--accent-dim);
      color: var(--accent);
  }

  .status-badge.success {
    background: var(--green-dim);
    color: var(--green);
  }

  .status-dot {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
  }

  .is-active .status-dot {
      animation: flat-blink 1s infinite alternate;
  }

  @keyframes flat-blink {
      from { opacity: 0.4; }
      to { opacity: 1; }
  }

  .indicator-main {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-box {
    width: 30px;
    height: 30px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-box.success {
    background: var(--green-dim);
  }

  .details {
    flex: 1;
    min-width: 0;
  }

  .title-text {
    font-size: 9px;
    font-weight: 700;
    color: var(--text-dim);
    margin-bottom: 2px;
    text-transform: uppercase;
  }

  .value-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .flat-progress {
    margin-top: 10px;
    height: 2px;
    background: var(--panel2);
    border-radius: 1px;
    overflow: hidden;
  }

  .flat-bar {
    height: 100%;
    width: 30%;
    background: var(--accent);
    animation: flat-slide 1.5s infinite linear;
  }

  @keyframes flat-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
</style>
