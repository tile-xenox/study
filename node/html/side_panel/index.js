const container = document.getElementById('container');
const droppableArea = document.getElementById('droppable-area');
const resize = document.getElementById('resize');

let dragging = false;
resize?.addEventListener('dragstart', (e) => {
    dragging = true;
});

droppableArea?.addEventListener('dragover', (e) => {
    if (!dragging) return;
    e.preventDefault();
});

const { left = 0 } = container?.getBoundingClientRect() ?? {};
droppableArea?.addEventListener('drop', (e) => {
    if (!dragging) return;
    if (!container) return;
    e.preventDefault();
    const x = e.clientX - left;
    const isRight = container.style.getPropertyValue('--right-bit') === '1';
    container.style.setProperty('--side-width-base', isRight ? `(100% - ${x}px)` : x + 'px');
});

resize?.addEventListener('dragend', () => {
    dragging = false;
});
