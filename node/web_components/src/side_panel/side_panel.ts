export class SidePanel extends HTMLElement {
  static observedAttributes = [
    "right",
    "can-resize",
    "min",
    "max",
    "default",
    "gap",
    "auto-close",
    "threshold",
    "can-toggle",
  ];

  constructor() {
    super();
  }

  #wrapper: HTMLDivElement | undefined;

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    // create base DOM
    const wrapper = this.#wrapper = document.createElement("div");
    wrapper.setAttribute("class", "wrapper");
    {
      const side = document.createElement("div");
      side.setAttribute("class", "side");
      wrapper.appendChild(side);
    }
    {
      const main = document.createElement("div");
      main.setAttribute("class", "main");
      wrapper.appendChild(main);
    }
    {
      const gap = document.createElement("div");
      gap.setAttribute("class", "gap");
      wrapper.appendChild(gap);
      {
        const icon = document.createElement("div");
        icon.setAttribute("class", "icon angle-left");
        icon.textContent = "<<";
        gap.appendChild(icon);
      }
      {
        const icon = document.createElement("div");
        icon.setAttribute("class", "icon angle-right");
        icon.textContent = ">>";
        gap.appendChild(icon);
      }
      {
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "toggle");
        checkbox.setAttribute("title", "toggle side panel");
        checkbox.setAttribute("class", "toggle");
        gap.appendChild(checkbox);
      }
    }
    // attribute setup
    SidePanel.observedAttributes.map((v) => this.attributeChangedCallback(v));
    // create base style
    const style = document.createElement("style");
    style.textContent = `
      .wrapper {
        --resize-bit: var(--can-resize, 0);
        --auto-close-bit: var(--auto-close, 0);
        --toggle-bit: var(--can-toggle, 0);
        --right-bit: var(--right, 0);
        --left-bit: calc(1 - var(--right-bit));
        /* gap-bit = resize-bit or toggle-bit */
        --gap-bit: min(calc(var(--resize-bit) + var(--toggle-bit)), 1);
        --open-bit: 0;
        &:has(> .gap > .toggle:checked) {
          --open-bit: 1;
        }
        --close-bit: calc(1 - var(--open-bit));

        --min-size: var(--min, 0);
        --max-size: var(--max, 100%);
        --default-size: var(--default, 50%);
        --gap-base: var(--gap, 0);
        --threshold-size: var(--threshold, 0);

        --gap-size: calc(var(--gap-base) * var(--gap-bit));

        position: relative;
        block-size: 100%;
        
        > * {
          position: absolute;
          top: 0;
          bottom: 0;
          overflow: hidden;
        }

        > .gap {
          inline-size: var(--gap-size);

          > .icon {
            position: absolute;
            overflow: hidden;
            white-space: nowrap;
            bottom: 0;

            &.angle-left {
              --left-and-open: max(calc(var(--toggle-bit) - var(--right-bit)), 0);
            }
          }

          > .toggle {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
          }
        }
      }
    `.replaceAll(/\s\s+/g, ' ');

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }

  attributeChangedCallback(attr: string) {
    if (!this.#wrapper) return;
    const value = this.getAttribute(attr);
    if (value === null || value.trim().toLowerCase() === "false") {
      this.#wrapper.style.removeProperty(`--${attr}`);
    }
    else {
      this.#wrapper.style.setProperty(`--${attr}`, value || "1");
    }
  }

}
