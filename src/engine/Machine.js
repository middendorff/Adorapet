import { createMenu } from "./html";
import Position from "./Position";

/**
 * @typedef {import('./Spritesheet').SpritesheetInstructions} SpritesheetInstructions
 * @typedef {import('./Spritesheet').default} Spritesheet
 * @typedef {import('./State').default} State
 * @typedef {import('./Engine').default} Engine
 * @typedef {import('./State').AnimationState} AnimationState
 * @typedef {import('./State').GeneralAction} GeneralAction
 * @typedef {import('./Position').default} Position
 */

/**
 * @typedef ActionMachine
 * @type {object}
 * @property {string} [id]
 * @property {string} [image]
 * @property {string} [play]
 */

/**
 * A custom machine
 */
class Machine {
  /**
   * @constructor
   * @param {Engine} engine - Engine.
   * @param {Spritesheet[]} spritesheets - All spritesheets.
   * @param {{[k: string]: State}} animations - All animations
   * @param {ActionMachine[]} actions - All actions
   */
  constructor(engine, spritesheets = [], animations = {}, actions = []) {
    /** @type {Engine} */
    this.engine = engine;
    /** @type {HTMLCanvasElement} */
    this.canvas = document.createElement("canvas");
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
    /** @type {Spritesheet[]} */
    this.spritesheets = spritesheets;
    /** @type {Map<string, State>} */
    this.animations = new Map();
    /** @type {ActionMachine[]} */
    this.actions = actions;
    /** @type {State|AnimationState} */
    this.animation = null;

    /** @type {undefined|string} */
    this.animationKey = undefined;

    /** @type {undefined|string} */
    this.previousKey = undefined;

    // animations
    for (const k of Object.keys(animations)) {
      const el = animations[k];
      el.machine = this;
      this.animations.set(k, el);
    }

    // init stuff
    this.menuComponent = null;
    /** @type {boolean} */
    this.menuIsOpen = false;
    /** @type {Position} */
    this.position = new Position(this);
    this._init();
    this.spawn();

    const clickOutside = (ev) => {
      const isCat = ev.target.getAttribute("data-cat-menu");

      // if (isCat) return;
      if (this.menuComponent && this.menuIsOpen) {
        this.menuComponent.remove();
        this.menuIsOpen = false;
      }
    };
    window.addEventListener("click", clickOutside);
  }
  /**
   * Check what is possible to do
   * @param {GeneralAction} key
   */
  isBlocked(key) {
    if (this.animation) return this.animation.isBlocked(key);
    return false;
  }
  _handleMenu() {
    if (this.menuIsOpen) return false;
    if (this.isBlocked("action")) return false;
    this.menuIsOpen = true;
    this.menuComponent = createMenu({
      x: this.position.x,
      y: this.position.y,
      radius: 130,
      actions: this.actions.map((el) => {
        return {
          onClick: () => {
            const eff = el.play;
            if (eff) this.play(eff);
          },
          ...el
        };
      })
    });
  }
  _init() {
    this.canvas.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      this._handleMenu();
      return false;
    });
  }

  /**
   * Spawn this machine in the document
   * @param {number} x
   * @param {number} y
   */
  spawn(x = 200, y = 200) {
    if (!this.canvas) this.canvas = document.createElement("canvas");
    // note: image size * scale
    this.canvas.width = 64;
    this.canvas.height = 64;
    this.canvas.style.cssText = `
    position: absolute; top: -${this.canvas.width / 2}px;
    left: -${this.canvas.width / 2}px;
    image-rendering: pixelated;`;
    this.canvas.setAttribute("data-cat", "true");
    this.position.x = x;
    this.position.y = y;
    const id = "cat-" + Math.random().toString(36).substring(2);
    this.canvas.id = id;
    // document.body.appendChild(this.canvas);
    document.getElementById("browser").appendChild(this.canvas);
  }

  /**
   * Remove this machine from the document and engine
   */
  remove() {
    if (this.canvas) this.canvas.remove();
    this.canvas = null;
    this.removed = true;
  }

  /**
   * Play some animation
   * @param {string} key
   */
  play(key) {
    if (key === "$previous") {
      key =
        this.previousKey && this.previousKey !== "drag"
          ? this.previousKey
          : "idle";
    }

    this.previousKey = this.animationKey;
    this.animationKey = key;
    const eff = this.animations.get(key);
    if (!eff) throw new Error(`State: "${key}" not found`);
    console.log(`\n%c State: ${key}\n`, "color:pink; font-size:20px");
    eff.onStart();
    if (this.animation) this.animation.onCleanup();
    this.animation = eff;
  }

  /**
   * Update
   * @param {number} dt
   * @param {number} now
   */
  update(dt, now) {
    if (this.animation) {
      this.animation.onUpdate(dt, now);
    }
    this.position.update();

    // codesandbox fix (not respawning)
    if (!this._codesandbox_fixed && !document.getElementById(this.canvas.id)) {
      this._codesandbox_fixed = 1;
      this.spawn(this.position.x, this.position.y);
    }
  }
}

export default Machine;
