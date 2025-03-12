// Edit me. Feel free to create additional .js files.


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
  
//monitor events and excute when the mosaic.html is fully loaded
document.addEventListener('DOMContentLoaded', function(){
  const imageInput = document.getElementById('image'); //get id="image" element
  const mosaicCanvas = document.getElementById('mosaicCanvas'); //get id="mosaicCanvas"


  //change is a event and excute when the client choose files
  imageInput.addEventListener('change', async function(event) {
    //event.target:file selection box
    const file = event.target.files[0];
    if(file){
      try{
        const img = await loadImage(file); //excute try function to load an image and process the image
        processImage(img, mosaicCanvas);
      } catch(error){ //excute catch if it appears the error 
        console.error('Failed to load image:', error);
      }
    }
      
  });
});