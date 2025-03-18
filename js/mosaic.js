// Constants shared between client and server.

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const SERVER_URL = "http://localhost:8765";

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
  //return the hex value of the average color e.g:#RRGGBB
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
    const row = [];
    for (let x = 0; x < image.width; x += TILE_WIDTH){ //same the process above, from left(x) move to the right this time
      const tile = ctx.getImageData(x, y, TILE_WIDTH, TILE_HEIGHT);
      const avgColor = calculateAverageColor(tile); //use the function of calculateAverageColor
      row.push({x, y, color: avgColor});
      //tiles.push({x, y, color:avgColor}); //store the data in the tiles array
    }
    tiles.push(row); //group by row
  }
  //render the data from the tiles array onto the final mosaicCanvas
  //renderMosaic(tiles, mosaicCanvas);
  
  //Ensure renderMosaic is correctly called in processImage
  renderMosaic(tiles, mosaicCanvas).then(() => console.log('Mosaic rendered successfully')).catch((error) => console.error('Failed to render mosaic:', error));
  return tiles;
}
if (typeof module !== 'undefined' && module.exports){
  module.exports = {processImage};//for Node.js
  //module.exports = {renderMosaic};
}else{
  window.processImage = processImage;//for browser
  //window.renderMosaic = renderMosaic;
}

//Render the calculated mosaic tiles onto Canvas. Use below code when generate each tile in mosaic
async function renderMosaic (tiles, mosaicCanvas){
  //const mosaicCtx = mosaicCanvas.getContext('2d'); 
  //set up the width and the height of the mosaicCanvas
  //x,y are the upper left corner coorinates of each tile
  //mosaicCanvas.width = tiles[tiles.length -1].x + TILE_WIDTH; //tiles[tiles.length-1].x: the horizontal axis of the last tile 
  //mosaicCanvas.height = tiles[tiles.length -1].y + TILE_HEIGHT;
  // + TILE_HEIGHT/WIDTH to ensure the Canvas contain all the tiles

  // //for loop to traverse the tiles array
  // for(const tile of tiles){
  //   const tileImage = await fetchTile(tile.color); //asynchronous function to retrieve mosaic tiles of corresponding colors from the server
  //   //once it done, use await to save the result to tileImage 
  //   mosaicCtx.drawImage(tileImage, tile.x, tile.y, TILE_WIDTH, TILE_HEIGHT);
  // }

  //check if tiles are an array
  if (!Array.isArray(tiles)){
    console.error('Tiles is not an array:', tiles);
    return;
  }

  const mosaicCtx = mosaicCanvas.getContext('2d');
  mosaicCanvas.width = tiles[0].length * TILE_WIDTH;//tiles[0].length: number of tiles per row
  mosaicCanvas.height = tiles.length * TILE_HEIGHT; // tiles.length: total number of rows
  //Grouping tiles by row
  for(let rowIndex = 0; rowIndex < tiles.length; rowIndex++){
    const row = tiles[rowIndex]; //get the tile array of the current row
    if (!Array.isArray(row)){
      console.error(`Row ${rowIndex} is not an array:`, row);
      continue;
    }
    console.log(`Rendering row ${rowIndex + 1} of ${tiles.length}`);

    //using promise.all to generate each row and process them line by line
    await Promise.all(
      row.map(async (tile) => { //Traverse each tile of the current row
        const tileImage = await fetchTile(tile.color);
        mosaicCtx.drawImage(tileImage, tile.x, tile.y, TILE_WIDTH, TILE_HEIGHT);
      })
    );
  }
}

//the process for retrieve the mosaic of the corrresponding color from the server
async function fetchTile(color){
  const url = `${SERVER_URL}/color/${color.replace('#', '')}`; //remove # because the URL from the server no need # 
  console.log('Fetching tile from:', url); //output url: http://localhost:8765/color/RRGGBB

  const response = await fetch(url); //Fetch initiates a network request
  if(!response.ok){
    throw new Error(`Failed to fetch tile: ${response.statusText}`);
  }
  //convert response data to SVG text format
  const svgText = await response.text(); //get SVG text
  const img = new Image();

  return new Promise((resolve, reject) =>{
    //resolve
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = TILE_WIDTH;
      canvas.height = TILE_HEIGHT;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0,0, TILE_WIDTH, TILE_HEIGHT); //draw the loaded SVG image onto Canvas

      //use ImageBitmap more efficient and less memory usage
      createImageBitmap(canvas).then(resolve).catch(reject);
    };
    //reject
    img.onerror = (error) => {
      reject(new Error('Failed to load SVG image'));
    };
    //convert SVG text to Base64 encoding
    img.src = `data:image/svg+xml;base64,${btoa(svgText)}`;//SVG to data URL
  });
}