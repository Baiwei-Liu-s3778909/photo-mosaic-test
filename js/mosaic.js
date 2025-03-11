// Constants shared between client and server.

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const SERVER_URL = "http://localhost:3000";

var exports = exports || null;
if (exports) {
  exports.TILE_WIDTH = TILE_WIDTH;
  exports.TILE_HEIGHT = TILE_HEIGHT;
}

//load an image from client uploaded image
async function loadImage(file) {
  const image = new Image();
  image.src = URL.createObjectURL(file); //file change to URL to load images
  await new Promise((resolve, reject) => { //resolve-success, reject-fail
    image.onload = () => resolve(image); //when success
    image.onerror = (error) => reject(error); //when fail
  });
  return image;
}
