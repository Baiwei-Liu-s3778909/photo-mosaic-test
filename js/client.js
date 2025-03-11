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