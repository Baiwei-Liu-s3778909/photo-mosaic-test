// Constants shared between client and server.

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const SERVER_URL = "http://localhost:3000";

var exports = exports || null;
if (exports) {
  exports.TILE_WIDTH = TILE_WIDTH;
  exports.TILE_HEIGHT = TILE_HEIGHT;
}

//Calculates the average colour of an image tile.
function calculateAverageColor(tile){
  const data = tile.data;
  let r = 0, g = 0, b = 0; //three-primary colours
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  //calculates the average
  const pixels = data.length / 4; // pixel total value
  const averageR = Math.round(r / pixels);
  const averageG = Math.round(g / pixels);
  const averageB = Math.round(b / pixels);
  //return the hex value of the average color e.g:#ff0000 is mean red
  return `#${averageR.toString(16).padStart(2, '0')}${averageG.toString(16).padStart(2, '0')}${averageB.toString(16).padStart(2, '0')}`;
}


//process the image and divides the image into tiles
//calculate the average of tiles
function processImage(image, mosaicCanvas){
  const canvas = document.createElement('canvas'); 
  const ctx = canvas.getContext('2d'); //obtain 2D Canvas for drawing and operate pixel data

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0); //draw the image uploaded by the client to the Canvas starting position of (0,0)

  const tiles = [];
  for (let y = 0; y < image.height; y += TILE_HEIGHT) { //from the top(y) move downwards until the entire height of the image is reached
    for (let x = 0; x < image.width; x += TILE_WIDTH){ //same the process above, from left(x) move to the right this time
      const tile = ctx.getImageData(x, y, TILE_WIDTH, TILE_HEIGHT);
      const avgColor = calculateAverageColor(tile); //use the function of calculateAverageColor
      tiles.push({x, y, color:avgColor}); //store the data in the tiles array
    }
  }
  //render the data from the tiles array onto the final mosaicCanvas
  renderMosaic(tiles, mosaicCanvas);
}
