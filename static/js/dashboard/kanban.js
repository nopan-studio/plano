// ── Kanban Order Persistence ──────────────────────────────────
function getKanbanOrder(pid) {
  try { return JSON.parse(localStorage.getItem(`fmc_kanban_order_${pid}`)) || {}; } catch { return {}; }
}
function saveKanbanOrder(pid, order) {
  localStorage.setItem(`fmc_kanban_order_${pid}`, JSON.stringify(order));
}
function captureColumnOrder(colBody) {
  return Array.from(colBody.querySelectorAll('.k-card')).map(c => +c.dataset.taskId);
}

// ── DRAG & DROP (Kanban) ──────────────────────────────────────
function initKanbanDragDrop(pid) {
  let draggedEl = null;
  let draggedId = null;
  let didDrag = false;

  function clearAllIndicators() {
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    document.querySelectorAll('.k-card.drop-above,.k-card.drop-below').forEach(el => {
      el.classList.remove('drop-above','drop-below');
    });
    document.querySelectorAll('.kanban-col-body.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  // Find the closest card and whether to insert before or after
  function getDropTarget(colBody, y) {
    const cards = Array.from(colBody.querySelectorAll('.k-card:not(.dragging)'));
    if (!cards.length) return { card: null, position: 'append' };
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (y < mid) return { card, position: 'before' };
    }
    return { card: cards[cards.length - 1], position: 'after' };
  }

  document.querySelectorAll('.kanban .k-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedEl = card;
      draggedId = card.dataset.taskId;
      didDrag = false;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedId);
      requestAnimationFrame(() => { card.style.opacity = '0.3'; });
    });
    card.addEventListener('dragend', e => {
      card.classList.remove('dragging');
      card.style.opacity = '';
      clearAllIndicators();
      draggedEl = null;
      draggedId = null;
    });
    // Suppress click after drag
    card.addEventListener('click', e => {
      if (didDrag) { e.preventDefault(); e.stopPropagation(); didDrag = false; }
    }, true);
  });

  document.querySelectorAll('.kanban .kanban-col-body').forEach(colBody => {
    colBody.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!draggedEl) return;
      colBody.classList.add('drag-over');

      // Clear previous indicators in all columns
      clearAllIndicators();
      colBody.classList.add('drag-over');

      // Show positional indicator
      const { card, position } = getDropTarget(colBody, e.clientY);
      if (card) {
        if (position === 'before') card.classList.add('drop-above');
        else card.classList.add('drop-below');
      } else {
        // Empty column — show an indicator at the top
        const ind = document.createElement('div');
        ind.className = 'drop-indicator';
        colBody.prepend(ind);
      }
    });

    colBody.addEventListener('dragenter', e => {
      e.preventDefault();
      colBody.classList.add('drag-over');
    });

    colBody.addEventListener('dragleave', e => {
      if (!colBody.contains(e.relatedTarget)) {
        colBody.classList.remove('drag-over');
        clearAllIndicators();
      }
    });

    colBody.addEventListener('drop', async e => {
      e.preventDefault();
      clearAllIndicators();
      const tid = e.dataTransfer.getData('text/plain');
      const newStatus = colBody.dataset.status;
      if (!tid || !newStatus || !draggedEl) return;
      didDrag = true;

      const oldStatus = draggedEl.dataset.status;
      const sameColumn = oldStatus === newStatus;
      const { card: targetCard, position } = getDropTarget(colBody, e.clientY);

      // Move the DOM element to the exact position
      draggedEl.classList.remove('dragging');
      draggedEl.style.opacity = '';
      draggedEl.dataset.status = newStatus;

      if (targetCard) {
        if (position === 'before') {
          colBody.insertBefore(draggedEl, targetCard);
        } else {
          colBody.insertBefore(draggedEl, targetCard.nextSibling);
        }
      } else {
        colBody.appendChild(draggedEl);
      }

      // Save the new order for ALL columns
      const order = getKanbanOrder(pid);
      document.querySelectorAll('.kanban .kanban-col-body').forEach(cb => {
        order[cb.dataset.status] = captureColumnOrder(cb);
      });
      saveKanbanOrder(pid, order);

      // If moved to a different column, update status via API
      if (!sameColumn) {
        const r = await api('PATCH',`/api/projects/${pid}/tasks/${tid}`,{status: newStatus});
        if (r.error) {
          toast(r.error,'err');
          renderTasks(pid);
        } else {
          toast(`Task moved to ${newStatus.replace('_',' ')}`);
          renderTasks(pid);
        }
      } else {
        toast('Order saved');
        // Update counts (no API call needed for reorder)
        document.querySelectorAll('.kanban .kanban-col-body').forEach(cb => {
          const cnt = cb.querySelectorAll('.k-card').length;
          const cntEl = cb.parentElement.querySelector('.cnt');
          if (cntEl) cntEl.textContent = cnt;
        });
      }
    });
  });
}

function initKanbanPanning() {
  const kanban = document.querySelector('.kanban');
  if (!kanban) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  kanban.addEventListener('mousedown', (e) => {
    // Only start panning if clicking background or non-card/non-button elements
    if (e.target.closest('.k-card') || e.target.closest('button') || e.target.closest('select') || e.target.closest('input')) return;
    
    isDown = true;
    kanban.classList.add('panning');
    startX = e.pageX - kanban.offsetLeft;
    scrollLeft = kanban.scrollLeft;
  });

  document.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    kanban.classList.remove('panning');
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - kanban.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    kanban.scrollLeft = scrollLeft - walk;
  });
}
