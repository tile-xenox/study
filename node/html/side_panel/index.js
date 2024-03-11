const container = document.getElementById('container');
const droppableArea = document.getElementById('droppable-area');
const resize = document.getElementById('resize');

let left = NaN;
resize?.addEventListener('dragstart', (e) => {
    left = container?.getBoundingClientRect().left ?? NaN;
});

droppableArea?.addEventListener('dragover', (e) => {
    if (Number.isNaN(left)) return;
    e.preventDefault();
});

droppableArea?.addEventListener('drop', (e) => {
    if (Number.isNaN(left)) return;
    if (!container) return;
    e.preventDefault();
    const x = e.clientX - left;
    const isRight = container.style.getPropertyValue('--right-bit') === '1';
    container.style.setProperty('--side-width-base', isRight ? `(100% - ${x}px)` : x + 'px');
});

resize?.addEventListener('dragend', () => {
    left = NaN;
});
