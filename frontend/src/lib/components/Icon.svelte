<script>
  let { name, size = 18, color = 'currentColor', stroke = 2 } = $props();

  const icons = {
    // Node Types
    'start': `<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>`,
    'process': `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/><path d="M3 15h6"/>`,
    'decision': `<path d="M12 2 2 12l10 10 10-10L12 2Z"/><path d="m9 12 2 2 4-4"/>`,
    'subprocess': `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="M9 3v18"/><path d="M3 12h18"/>`,
    'db_table': `<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><rect width="18" height="18" x="3" y="3" rx="2"/>`,
    'external_table': `<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"/>`,
    'enum': `<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M7 6v12"/><path d="M11 6v12"/><path d="M15 6v12"/>`,
    'note': `<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M6 13h12"/><path d="M6 17h12"/>`,
    'idea': `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`,
    
    // Tools
    'zoom-in': `<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>`,
    'zoom-out': `<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/>`,
    'fit-view': `<path d="M3 12h18"/><path d="M12 3v18"/><path d="m15 19 3 2 3-2"/><path d="m15 5 3-2 3 2"/><path d="m5 9-2-3 2-3"/><path d="m19 9 2-3-2-3"/>`,
    'layout': `<rect width="7" height="5" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="5" x="3" y="14" rx="1"/><rect width="7" height="5" x="14" y="14" rx="1"/><path d="M10 5.5h4"/><path d="M10 16.5h4"/><path d="M6.5 8v6"/><path d="M17.5 8v6"/>`,
    'back': `<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`,
    'duplicate': `<rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`,
    'refresh': `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>`,
    'delete': `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>`,
    'chevron-left': `<path d="m15 18-6-6 6-6"/>`,
    'chevron-right': `<path d="m9 18 6-6-6-6"/>`,
    'check': `<path d="M20 6 9 17l-5-5"/>`,
    'youtube': `<rect width="20" height="14" x="2" y="5" rx="3"/><path d="m10 9 5 3-5 3V9z"/>`,
    'ai': `<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/><path d="M12 6a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1Zm5.66 2.34a1 1 0 0 1 0 1.42l-1.42 1.42a1 1 0 0 1-1.42-1.42l1.42-1.42a1 1 0 0 1 1.42 0ZM18 12a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1Zm-2.34 5.66a1 1 0 0 1-1.42 0l-1.42-1.42a1 1 0 0 1 1.42-1.42l1.42 1.42a1 1 0 0 1 0 1.42ZM12 18a1 1 0 0 1-1-1v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1Zm-5.66-2.34a1 1 0 0 1 0-1.42l1.42-1.42a1 1 0 0 1 1.42 1.42l-1.42 1.42a1 1 0 0 1-1.42 0ZM6 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1Zm2.34-5.66a1 1 0 0 1 1.42 0l1.42 1.42a1 1 0 0 1-1.42 1.42L6.34 7.76a1 1 0 0 1 0-1.42Z"/>`,
    'mcp': `<path d="M14.5 2h-5L8 7h8l-1.5-5zM8 7l-2 5h12l-2-5H8zm-2 5l-2 5h16l-2-5H6zm-2 5l-1.5 5h19L20 17H4z"/>`,
  };
</script>

<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width={size} 
  height={size} 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke={color} 
  stroke-width={stroke} 
  stroke-linecap="round" 
  stroke-linejoin="round"
  class="icon icon-{name}"
>
  {@html icons[name] || icons.start}
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
