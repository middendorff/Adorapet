/**
 * Load an image
 * @param {string} url - The title of the book.
 * @return {Promise<HTMLImageElement>} A image element
 */
export function loadImage(url) {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }
  
  export const noop = () => undefined;
  