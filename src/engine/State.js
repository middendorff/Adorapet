/**
 * @typedef {import('./Machine').default} Machine
 * @typedef {import('./Spritesheet').SpritesheetInstructions} SpritesheetInstructions
 * @typedef {import('./Spritesheet').default} Spritesheet
 */

import { noop } from "./utils";

/**
 * @typedef GeneralAction
 * @type {"drag" | "action"} the possible things
 */

/**
 * @typedef StateOptions
 * @type {object}
 * @property {GeneralAction[]} [block] - what general actions are block til end
 * @property {string[]} [actions] - the available actions during this animation
 * @property {boolean} [persist] - whether or not persist this animation until a new action happens or manually finish it
 */

/**
 * A General State
 * State contains some states to keep control of what's happening
 */
class State {
  /**
   * @constructor
   * @param {StateOptions} [options] - An optional animation options
   */
  constructor(options = {}) {
    /**
     * will be set as soon is consumed by machine
     * @type {Machine|undefined}
     * */
    this.machine = undefined;
    /** @type {StateOptions} */
    this.options = options;
    /** @type {Set<Cans>} */
    this.block = Array.isArray(this.options.block)
      ? new Set(this.options.block)
      : new Set();

    /** @type {number} */
    this.started = -1;

    /** @type {boolean} */
    this.finished = false;

    /** @type {boolean} */
    this.persist = this.options.persist;

    /** @private @type {Timeout} */
    this._timeouts = [];

    /**
     * Keep temporary variables here
     * will be cleaned after cleanup
     * @type {Map<string, any>}
     * */
    this.memo = new Map();
  }
  /**
   * Check if general action is blocked
   * @param {GeneralAction} key
   */
  isBlocked(key) {
    return this.block.has(key);
  }

  /**
   * @param {number} t
   */
  set timeout(t) {
    this._timeouts.push(t);
  }

  /** Start function */
  onStart() {
    if (!this.machine) return null;
    this.finished = false;
    this.started = performance.now();
  }

  /**
   * Update function
   * @param {number} dt
   * @param {number} now
   */
  onUpdate(dt, now) {}

  /** Finish function */
  onFinish() {
    if (this.persist) return;
    this.finished = true;
  }

  /** Called last */
  onCleanup() {
    this._timeouts.forEach((el) => {
      clearTimeout(el);
    });
    this.started = false;
  }
}

export default State;

/**
 * @typedef AnimationStateOptions
 * @type {object}
 * @property {number} [fps] - frames per second
 * @property {number} [index] - index of spritesheet in the machine
 * @property {number} [duration] - duration in miliseconds
 * @property {(animation: AnimationState, now: number) => void} [onStart] - start function
 * @property {(animation: AnimationState, dt: number, now: number) => void} [onUpdate] - update function
 * @property {(animation: AnimationState, dt: number, now: number) => void|string|number|((string|number)[])} [onFinish] - animation name to transition or function or delay or [delay, name]
 */

/**
 * An Animation
 */
export class AnimationState extends State {
  /**
   * @constructor
   * @param {SpritesheetInstructions & AnimationStateOptions} anim - Animation Options
   * @param {StateOptions} [options] - State Options
   */
  constructor(anim = {}, options = {}) {
    super(options);

    const {
      fps,
      index,
      duration,
      onStart,
      onUpdate,
      onFinish,
      ...animation
    } = anim;

    /** @type {number} @private */
    this._spriteSheetIndex = index || 0;
    /** @type {SpritesheetInstructions|null} @private */
    this._animation = animation;
    /** @type {number} @private */
    this._frameTime = 1000 / (fps || 2);
    /** @type {number} @private */
    this._nextFrame = 0;
    /** @type {number} @private */
    this._duration = duration || 0;
    /** @type {number} @private */
    this._finishAt = null;
    /** @type {(animation: AnimationState) => void} @private */
    this._aniOnStart = onStart || noop;
    /** @type {(animation: AnimationState, dt: number, now: number) => void} @private */
    this._aniOnUpdate = onUpdate || noop;
    /** @type {(animation: AnimationState, dt: number, now: number) => void|string|number|[number, string]} @private */
    this._transition = onFinish;
  }

  onStart() {
    super.onStart();
    const spritesheet = this.machine.spritesheets[this._spriteSheetIndex];
    if (!spritesheet)
      throw new Error(
        `Spritesheet index: "${this._spriteSheetIndex}" not found`
      );
    this._spritesheet = spritesheet;

    // reset
    this._nextFrame = 0;
    if (this._duration > 0) {
      this._finishAt = this._duration + performance.now();
    }

    spritesheet.setAnimation(this._animation, () => {
      if (!this._finishAt) this.onFinish();
    });
    this._aniOnStart(this);
  }

  onUpdate(dt, now) {
    if (this.finished !== false) return;
    if (now > this._nextFrame) {
      const s = this._spritesheet;
      // update the spritesheet
      if (s) {
        this.machine.ctx.clearRect(
          0,
          0,
          this.machine.canvas.width,
          this.machine.canvas.height
        );
        this._nextFrame = this._frameTime + now;

        s.update();
        s.render(this.machine.ctx);
      }
    }
    this._aniOnUpdate(this, dt, now);
    if (this._finishAt && now >= this._finishAt) {
      this.onFinish();
      this._finishAt = null;
    }
    if (this.finished) {
      if (Array.isArray(this._transition)) {
        this.timeout = setTimeout(
          () => this.machine.play(this._transition[1]),
          this._transition[0]
        );
      } else if (typeof this._transition === "function")
        this._transition(this, dt, now);
      else if (typeof this._transition === "string")
        this.machine.play(this._transition);
      else if (typeof this._transition === "number")
        this.timeout = setTimeout(
          () => this.machine.play("idle"),
          this._transition
        );
      else if (this._transition !== null) {
        this.machine.play("idle");
      }
    }
  }
}
