import { SidePanel } from "./side_panel.js";
export function register(prefix = "x") {
    window.customElements.define(`${prefix}-side-panel`, SidePanel);
}