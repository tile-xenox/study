import "./style.css"
import { sidePanelRegister } from "./index.js";
import { setup as setupSidePanelTest } from "./side_panel/__test__/setup.js";

sidePanelRegister();

(() => {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div class="stack h-100">
      <div class="pw pt pb">
        <div class="cluster">
          <label for="component_list">Component</label>
          <select name="component_list" id="component_list"></select>
        </div>
      </div>
      <div class="grow border" id="test_area"></div>
    </div>
  `;
  const testArea = document.getElementById("test_area");
  if (!(testArea instanceof HTMLDivElement)) return;
  const selectEl = document.getElementById("component_list");
  if (!(selectEl instanceof HTMLSelectElement)) return;
  const componentList = [
    { key: "side-panel", setup: setupSidePanelTest },
  ];
  selectEl.innerHTML = "<option value=\"\"></option>" + componentList.map((v) => `<option value="${v.key}">${v.key}</option>`).join('');
  selectEl.addEventListener("change", () => {
    componentList.find((v) => v.key === selectEl.value)?.setup(testArea);
  });
})();
