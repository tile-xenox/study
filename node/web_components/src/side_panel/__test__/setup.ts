export function setup(elm: HTMLElement) {
  elm.innerHTML = `
    <div class="stack h-100">
      <div class="stack pw pt">
        <div class="cluster">
          <div class="cluster">
            <input type="checkbox" name="right" id="right">
            <label for="right">right</label>
          </div>
          <div class="cluster">
            <input type="checkbox" name="resize" id="resize" checked>
            <label for="resize">resize</label>
          </div>
          <div class="cluster">
            <input type="checkbox" name="auto_close" id="auto_close" checked>
            <label for="auto_close">auto-close</label>
          </div>
          <div class="cluster">
            <input type="checkbox" name="toggle" id="toggle" checked>
            <label for="toggle">toggle</label>
          </div>
        </div>
        <div class="cluster">
          <div class="cluster">
            <label for="min">min</label>
            <input type="text" name="min" id="min" value="5rem">
          </div>
          <div class="cluster">
            <label for="max">max</label>
            <input type="text" name="max" id="max" value="30rem">
          </div>
          <div class="cluster">
            <label for="default">default</label>
            <input type="text" name="default" id="default" value="10rem">
          </div>
          <div class="cluster">
            <label for="threshold">threshold</label>
            <input type="text" name="threshold" id="threshold" value="60rem">
          </div>
          <div class="cluster">
            <label for="gap">gap</label>
            <input type="text" name="gap" id="gap" value="1.5rem">
          </div>
        </div>
      </div>
      <x-side-panel
        id="panel"
        class="grow"
        right="false"
        can-resize
        auto-close
        can-toggle
        min="5rem"
        max="30rem"
        default="10rem"
        threshold="60rem"
        gap="1.5rem"
      ></x-side-panel>
    </div>
  `;

  const panel = document.getElementById("panel");
  if (!(panel instanceof HTMLElement)) return;
  document.getElementById("right")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (e.target.checked) {
      panel.setAttribute("right", "");
    }
    else {
      panel.removeAttribute("right");
    }
  });
  document.getElementById("resize")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (e.target.checked) {
      panel.setAttribute("can-resize", "");
    }
    else {
      panel.removeAttribute("can-resize");
    }
  });
  document.getElementById("auto_close")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (e.target.checked) {
      panel.setAttribute("auto-close", "");
    }
    else {
      panel.removeAttribute("auto-close");
    }
  });
  document.getElementById("toggle")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (e.target.checked) {
      panel.setAttribute("can-toggle", "");
    }
    else {
      panel.removeAttribute("can-toggle");
    }
  });
  document.getElementById("min")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    panel.setAttribute("min", e.target.value);
  });
  document.getElementById("max")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    panel.setAttribute("max", e.target.value);
  });
  document.getElementById("default")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    panel.setAttribute("default", e.target.value);
  });
  document.getElementById("threshold")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    panel.setAttribute("threshold", e.target.value);
  });
  document.getElementById("gap")?.addEventListener("change", (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    panel.setAttribute("gap", e.target.value);
  });
}
