import { loadImage } from "./utils";

/** Simple Engine for setup, store resources and start the loop */
class Engine {
  constructor() {
    this.loaded = false;
    this.assets = {};

    // things that has update;
    this.things = new Set();
  }

  /**
   * Load assets and store it
   */
  async load(...args) {
    this.loaded = false;
    const promises = args.map(async (url) => {
      const img = await loadImage(url);
      this.assets[url] = img;
    });

    await Promise.all(promises);
    this.loaded = true;
    return this;
  }

  addThing(obj) {
    this.things.add(obj);
  }

  removeThing(obj) {
    this.things.delete(obj);
  }

  /**
   * Start loop
   */
  fire() {
    // start loop
    window.requestAnimationFrame(this._loop.bind(this));
  }

  /**
   * Main loop
   */
  _loop() {
    try {
      const now = performance.now();
      const dt = now - this.t;

      this.things.forEach((el) => {
        if ("removed" in el) {
          this.things.delete(el);
        } else {
          el.update(dt, now);
        }
      });

      this.t = now;
      window.requestAnimationFrame(this._loop.bind(this));
    } catch (error) {
      console.error(error);
    }
  }
}
export default Engine;
