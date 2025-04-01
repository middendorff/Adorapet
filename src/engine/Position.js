/**
 * @typedef {import('./Machine').default} Machine
 */

/**
 * Position controller
 * manages position and drag events
 */
class Position {
    /**
     * @constructor
     * @param {Machine} machine - machine instance
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(machine, x, y) {
      /** @type {Machine} */
      this.machine = machine;
      this.el = machine.canvas;
      /** @private @type {number} */
      this._x = x || 0;
      /** @private @type {number} */
      this._y = y || 0;
      /** @type {number} - rotation in degrees */
      this.rotate = 0;
      this.drag = false;
      this.initDragSystem();
  
      this.moveTowards(500, 200);
    }
  
    get x() {
      return this._x;
    }
  
    get y() {
      return this._y;
    }
  
    /**
     * @param {number} x
     */
    set x(x) {
      if (this.drag) return;
      this._x = x;
    }
  
    /**
     * @param {number} y
     */
    set y(y) {
      if (this.drag) return;
      this._y = y;
    }
  
    /**
     * Move towards a point
     * @param {number} x
     * @param {number} y
     * @param {number?} speed
     */
    moveTowards(x, y, speed = 5) {
      const dx = x - this._x;
      const dy = y - this._y;
  
      if (Math.abs(dx) + Math.abs(dy) > speed) {
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;
        return true;
      }
      return false;
    }
  
    initDragSystem() {
      let startX = 0,
        startY = 0;
  
      const onstart = (e) => {
        if (this.machine.isBlocked("drag")) return;
        if (e.type === "touchstart") {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else {
          if (e.button !== 0) return;
          startX = e.clientX;
          startY = e.clientY;
        }
  
        startX -= this._x;
        startY -= this._y;
  
        this.drag = true;
      };
  
      const onmove = (e) => {
        if (!this.drag) return;
        let x = 0,
          y = 0;
        if (e.type === "touchmove") {
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
        } else {
          x = e.clientX;
          y = e.clientY;
        }
        x -= startX;
        y -= startY;
  
        this._x = x;
        this._y = y;
        // while (e.type !== "touchend") {
        //   this.machine.play("drag");
        // }
      };
  
      const onrelease = (e) => {
        if (e.type !== "touchend" && e.button !== 0) return;
        this.drag = false;
      };
  
      this.el.addEventListener("mousedown", onstart);
      window.addEventListener("mousemove", onmove);
      window.addEventListener("mouseup", onrelease);
  
      this.el.addEventListener("touchstart", onstart);
      window.addEventListener("touchmove", onmove);
      window.addEventListener("touchend", onrelease);
    }
  
    update() {
      this.el.style.transform =
        "translate(" +
        this._x +
        "px," +
        this._y +
        "px) " +
        " rotate(" +
        this.rotate +
        "deg)";
    }
  }
  
  export default Position;
  