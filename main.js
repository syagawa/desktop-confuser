const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");


function takeScreenShot(){
  return screenshot()
    .then(function(img){
      const filename = "./snap.jpg"
      fs.writeFileSync(filename, img);
      return filename;
    })
    .catch(function(err){

    });
}


function setWallPaper(imgname){
  wallpaper.set(imgname)
    .then(function(res){

    })
    .catch(function(err){

    });

}


takeScreenShot()
  .then(function(iname){
    setWallPaper(iname);
  })
  .catch(function(err){

  });
