import { noop } from "./utils";
/**
 * @typedef SpritesheetInstructions
 * @type {object}
 * @property {[number, number]|number} from - starting row OR [start column, start row];
 * @property {number} to - number of frames OR [end column, end row];
 * @property {boolean} [repeat] - repeat
 */

/**
 * Spritesheet
 */
class Spritesheet {
  /**
   * Represents an spritheet image.
   * @constructor
   * @param {HTMLImageElement} image - The image.
   * @param {number} width - The width of a single sprite.
   * @param {number} height - The height of a single sprite.
   * @param {number} [scale] - The scale of a single sprite.
   */
  constructor(image, width, height, scale) {
    /** @type {HTMLImageElement} @readonly */
    this.spritesheet = image;

    /** @type {number} @readonly */
    this.width = width;
    /** @type {number} @readonly */
    this.height = height;

    /** @type {number} @readonly */
    this.cols = Math.floor(image.width / width);

    /** @type {number} @private */
    this.frameColIdx = 0;
    /** @type {number} @private */
    this.frameRowIdx = 0;

    /**
     * [col start, row start, col end, row end]
     * @type {[number, number, number, number]}
     * @private
     * */
    this.state = [0, 0, 0, 0];
    /** @type {boolean} @private */
    this.repeat = false;
    /** @type {boolean} @private */
    this.running = false;
    /** @type {number} @private */
    this.scale = scale || 1;
    /** @type {boolean} flip spritesheet */
    this.flip = false;

    // callbacks
    this.onFinish = noop;
    this.onUpdate = noop;
  }
  /**
   * Method to start animations
   * @param {SpritesheetInstructions} anim - the keys
   * @param {() => void} [onFinish]  - callback
   */
  setAnimation(anim, onFinish) {
    if (Array.isArray(anim.from)) {
      this.frameColIdx = anim.from[0] || 0;
      this.frameRowIdx = anim.from[1] || 0;
    } else {
      this.frameColIdx = 0;
      this.frameRowIdx = anim.from || 0;
    }

    this.state[0] = this.frameColIdx;
    this.state[1] = this.frameRowIdx;

    if (Array.isArray(anim.to)) {
      this.state[2] = anim.to[0] || 0;
      this.state[3] = anim.to[1] || 0;
    } else {
      const r = anim.to % this.cols;
      const d = Math.floor(anim.to / this.cols);
      this.state[3] = r === 0 ? d - 1 : d;
      this.state[2] = r === 0 ? this.cols - 1 : r - 1;
    }

    this.repeat = anim.repeat;
    this.running = true;

    this.onFinish = onFinish || noop;

    // to render the first frame
    this.frameColIdx -= 1;
  }

  /**
   * Animate spritesheet
   */
  update() {
    if (!this.running) return;

    if (
      this.frameRowIdx >= this.state[3] &&
      this.frameColIdx >= this.state[2]
    ) {
      // repeat / or stop
      if (this.repeat === true) {
        // repeat
        this.frameColIdx = this.state[0];
        this.frameRowIdx = this.state[1];
      } else {
        this.running = false;
        // animation should finish
        this.onFinish();
      }
    } else {
      if (
        this.frameColIdx >= this.cols - 1 ||
        (this.frameColIdx >= this.state[2] && this.state[3] <= this.state[1])
      ) {
        this.frameRowIdx += 1;
        this.frameColIdx = 0;
      } else {
        this.frameColIdx++;
      }
    }
    // console.log(this.frameColIdx, this.frameRowIdx);
  }

  /**
   * Render spritesheet
   * @param {CanvasRenderingContext2D} ctx - The canvas 2d context.
   */
  render(ctx) {
    ctx.imageSmoothingEnabled = false;
    if (this.flip) ctx.setTransform(-1, 0, 0, 1, this.width * this.scale, 0);
    ctx.drawImage(
      this.spritesheet,
      this.frameColIdx * this.width,
      this.frameRowIdx * this.height,
      this.width,
      this.height,
      0,
      0,
      this.width * this.scale,
      this.height * this.scale
    );
    ctx.resetTransform();
  }
}
export default Spritesheet;
