// import popSound from "../../static/pop.mp3";
const MENU_COUNT = 8;
const temporary = ["🍈", "🍇", "🍉", "🍊", "🍋", "🍌"];

// SAFARI BUG
// const menuCSS = new CSSStyleSheet();
const css = `
.cat-item {
  all: unset;
  will-change: transform, opacity;
  opacity: 0;
  position: absolute;
  left: -40px;
  top: -40px;
  width: 80px;
  height: 80px;
  border-radius: 100%;
  cursor: pointer;
  backdrop-filter: blur(2px);
  z-index: 9999999999;
}

.cat-item:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--bg, rgba(255, 255, 255, 0.6));
  opacity: 0.7;
  border-radius: 100%;
  transform: scale(1);
  contain: strict;
  transition: ease-in-out 120ms transform, ease-in-out 120ms opacity, ease-in-out 120ms box-shadow;
  box-shadow: 0 0 14px rgba(189,225,255,.2);
}

.cat-item:hover::before {
  transform: scale(1.12);
  opacity: 1;
  box-shadow: 0 0 14px rgba(189,225,255,1);
}

.action {
  display: grid;
  place-items: center;
  font-size: 40px;
  user-select: none;
}
`;

const c = document.createElement("div");
c.setAttribute("data-cat-menu", "true");

class MenuItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // this.shadowRoot.adoptedStyleSheets = [menuCSS];
    this.info = null;
    this.catIdx = null;
    this.el = null;
    // this.audio = new Audio(popSound);
    // this.audio.volume = 0.25;
    this.soundTimeout = -1;
  }

  connectedCallback() {
    this.el = c.cloneNode();
    this.el.classList.add("cat-item");
    const action = this.action;
    const angle = (this.catIdx * 2.0 * Math.PI) / MENU_COUNT - Math.PI / 2;
    const posX = this.props.x + Math.cos(angle) * this.props.radius;
    const posY = this.props.y + Math.sin(angle) * this.props.radius;

    const xMiddle = this.props.x + Math.cos(angle) * (this.props.radius / 4);
    const yMiddle = this.props.y + Math.sin(angle) * (this.props.radius / 4);

    const frames = [
      {
        transform: `translate(${xMiddle}px, ${yMiddle}px) scale(0)`,
        opacity: 0
      },
      { transform: `translate(${posX}px, ${posY}px) scale(1)`, opacity: 1 }
    ];

    this.el.style.cssText = `transform: translate(${xMiddle}px, ${yMiddle}px) scale(0);`;

    if (action) {
      // temporary style
      this.el.classList.add("action");
      this.el.textContent = action.image || temporary[this.catIdx] || "";
      this.el.addEventListener("click", (e) => {
        action.onClick(e);
      });
    }
    this.el.addEventListener("mouseenter", (e) => {
      // this.soundTimeout = setTimeout(() => this.audio.play(), 40);
    });

    this.el.addEventListener("mouseleave", (e) => {
      clearTimeout(this.soundTimeout);
    });

    const ani = this.el.animate(frames, {
      duration: 200,
      delay: 20 * (this.catIdx + 1),
      easing: "ease-out",
      fill: "forwards"
    });
    ani.onfinish = () => {
      try {
        ani.commitStyles();
      } catch (error) {
        console.warn(error);
      }
    };
    this.info = [xMiddle, yMiddle, posX, posY];
    const style = document.createElement("style");
    style.textContent = css;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.el);
  }

  remove() {
    return new Promise((resolve) => {
      const [fromX, fromY, toX, toY] = this.info;

      const frames = [
        {
          transform: `translate(${toX}px, ${toY}px) scale(1)`,
          opacity: 1
        },
        {
          transform: `translate(${fromX}px, ${fromY}px) scale(0)`,
          opacity: 0
        }
      ];

      const ani = this.el.animate(frames, {
        duration: 100,
        easing: "ease-in",
        fill: "forwards"
      });

      ani.onfinish = () => {
        try {
          ani.commitStyles();
          super.remove();
          resolve();
        } catch (error) {
          console.warn(error);
        }
      };
    });
  }
}

if (customElements.get("cat-menu-item") === undefined)
  customElements.define("cat-menu-item", MenuItem);

class Menu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.els = [];
  }

  connectedCallback() {
    for (let i = 0; i < MENU_COUNT; i++) {
      const el = document.createElement("cat-menu-item");
      el.props = this.props;
      el.catIdx = i;
      el.action = this.props.actions[i];
      this.els.push(el);
      this.shadowRoot.appendChild(el);
    }
  }

  remove() {
    return new Promise((resolve) => {
      const promises = [];
      for (let i = 0; i < this.els.length; i++) {
        promises.push(this.els[i].remove());
      }
      Promise.allSettled(promises).then(() => {
        super.remove();
        resolve();
      });
    });
  }
}

if (customElements.get("cat-menu") === undefined)
  customElements.define("cat-menu", Menu);

/**
 * Menu Component
 * @param {{ x: number, y: number, actions: any[], radius: number }} props - the props
 * @returns {Node}
 */
export function createMenu(props) {
  const el = document.createElement("cat-menu");
  el.props = props;
  document.body.appendChild(el);

  return {
    remove: () => el.remove()
  };
}
