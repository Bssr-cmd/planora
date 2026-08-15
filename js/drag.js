import { springAnimate, rubberband, project, nearestSnapTarget } from './spring.js';

export function makeDraggable(element, options = {}) {
  const {
    axis = 'both',
    handle = null,
    bounds = null,
    snapTargets = null,
    rubberband: useRubberband = false,
    onDragStart = null,
    onDrag = null,
    onDragEnd = null,
    createGhost = false
  } = options;

  const dragHandle = handle ? element.querySelector(handle) || element : element;
  
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  
  // History for velocity
  let history = [];

  const onPointerDown = (e) => {
    // Only primary button
    if (e.button !== 0) return;
    
    isDragging = true;
    dragHandle.setPointerCapture(e.pointerId);
    
    startX = e.clientX;
    startY = e.clientY;
    
    // Read current transforms if any
    const transform = element.style.transform;
    const matchX = transform.match(/translateX\(([-\d.]+)px\)/);
    const matchY = transform.match(/translateY\(([-\d.]+)px\)/);
    
    const initialX = matchX ? parseFloat(matchX[1]) : 0;
    const initialY = matchY ? parseFloat(matchY[1]) : 0;
    
    startX -= initialX;
    startY -= initialY;
    
    history = [{ x: e.clientX, y: e.clientY, time: performance.now() }];
    
    if (onDragStart) {
      onDragStart({ x: initialX, y: initialY, el: element });
    }
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    
    let x = axis === 'both' || axis === 'x' ? e.clientX - startX : 0;
    let y = axis === 'both' || axis === 'y' ? e.clientY - startY : 0;
    
    // Bounds & Rubberbanding
    if (bounds && bounds !== 'parent') {
      if (x < bounds.left) x = useRubberband ? bounds.left - rubberband(bounds.left - x, 300) : bounds.left;
      if (x > bounds.right) x = useRubberband ? bounds.right + rubberband(x - bounds.right, 300) : bounds.right;
      if (y < bounds.top) y = useRubberband ? bounds.top - rubberband(bounds.top - y, 300) : bounds.top;
      if (y > bounds.bottom) y = useRubberband ? bounds.bottom + rubberband(y - bounds.bottom, 300) : bounds.bottom;
    }
    
    currentX = x;
    currentY = y;
    
    element.style.transform = `translateX(${x}px) translateY(${y}px)`;
    
    const now = performance.now();
    history.push({ x: e.clientX, y: e.clientY, time: now });
    if (history.length > 5) history.shift();
    
    if (onDrag) {
      onDrag({ x, y, dx: e.movementX, dy: e.movementY, el: element });
    }
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    dragHandle.releasePointerCapture(e.pointerId);
    
    // Calculate velocity
    let vx = 0, vy = 0;
    if (history.length > 1) {
      const first = history[0];
      const last = history[history.length - 1];
      const dt = last.time - first.time;
      if (dt > 0) {
        vx = ((last.x - first.x) / dt) * 1000; // px per second
        vy = ((last.y - first.y) / dt) * 1000;
      }
    }
    
    const projectedX = currentX + project(vx);
    const projectedY = currentY + project(vy);
    
    if (onDragEnd) {
      onDragEnd({ x: currentX, y: currentY, vx, vy, projected: { x: projectedX, y: projectedY }, el: element });
    }
    
    // Snap if targets provided
    if (snapTargets) {
      const snapX = nearestSnapTarget(projectedX, snapTargets.map(t => t.x));
      const snapY = nearestSnapTarget(projectedY, snapTargets.map(t => t.y));
      springAnimate(element, { transform: `translateX(${snapX}px) translateY(${snapY}px)` }, { velocity: Math.sqrt(vx*vx + vy*vy) });
    }
  };

  dragHandle.addEventListener('pointerdown', onPointerDown);
  dragHandle.addEventListener('pointermove', onPointerMove);
  dragHandle.addEventListener('pointerup', onPointerUp);
  dragHandle.addEventListener('pointercancel', onPointerUp);

  return () => {
    dragHandle.removeEventListener('pointerdown', onPointerDown);
    dragHandle.removeEventListener('pointermove', onPointerMove);
    dragHandle.removeEventListener('pointerup', onPointerUp);
    dragHandle.removeEventListener('pointercancel', onPointerUp);
  };
}

export function makeDropZone(element, options = {}) {
  const { accept = null, onDragEnter = null, onDragOver = null, onDragLeave = null, onDrop = null } = options;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (onDragOver) onDragOver(e, null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer ? e.dataTransfer.getData('text/plain') : null;
    if (onDrop) onDrop(e, null, data);
  };
  
  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('drop', handleDrop);
  
  return () => {
    element.removeEventListener('dragover', handleDragOver);
    element.removeEventListener('drop', handleDrop);
  };
}

export function makeSortable(container, itemSelector, options = {}) {
  // Simplified pointer-based sortable list utilizing makeDraggable
  // A robust implementation would map elements, update order on intersection, and springAnimate siblings.
  const { axis = 'y', onReorder = null, handle = null } = options;
  
  // Implementation deferred for complex list sorting
  return () => {};
}
