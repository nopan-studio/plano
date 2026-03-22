function route() {
  const hash = location.hash || '#/';
  const m = {
    home:  hash === '#/' || hash === '',
    ideas: hash === '#/ideas',
    proj:  hash.match(/^#\/projects\/(\d+)$/),
    tasks: hash.match(/^#\/projects\/(\d+)\/tasks$/),
    milestones: hash.match(/^#\/projects\/(\d+)\/milestones$/),
    changelog:  hash.match(/^#\/projects\/(\d+)\/project-logs$/),
    updates:    hash.match(/^#\/projects\/(\d+)\/updates$/),
    pideas:     hash.match(/^#\/projects\/(\d+)\/ideas$/),
    boards:     hash.match(/^#\/projects\/(\d+)\/boards$/),
    archive:    hash.match(/^#\/projects\/(\d+)\/archive$/),
  };
  if      (m.home)       { if (typeof renderHome === 'function') renderHome(); }
  else if (m.ideas)      { if (typeof renderAllIdeas === 'function') renderAllIdeas(); }
  else if (m.tasks)      { if (typeof renderTasks === 'function') renderTasks(+m.tasks[1]); }
  else if (m.milestones) { if (typeof renderMilestones === 'function') renderMilestones(+m.milestones[1]); }
  else if (m.changelog)  { if (typeof renderChangelog === 'function') renderChangelog(+m.changelog[1]); }
  else if (m.updates)    { if (typeof renderUpdates === 'function') renderUpdates(+m.updates[1]); }
  else if (m.pideas)     { if (typeof renderIdeas === 'function') renderIdeas(+m.pideas[1]); }
  else if (m.boards)     { if (typeof renderBoards === 'function') renderBoards(+m.boards[1]); }
  else if (m.archive)    { if (typeof renderArchive === 'function') renderArchive(+m.archive[1]); }
  else if (m.proj)       { if (typeof renderProject === 'function') renderProject(+m.proj[1]); }
  else                   { if (typeof renderHome === 'function') renderHome(); }
  
  if (typeof renderSidebar === 'function') renderSidebar();
}
window.addEventListener('hashchange', route);
