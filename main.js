const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");
const log4js = require("log4js");

const appname = "desktop-confuser";


function takeScreenShot(){
  return screenshot()
    .then(function(img){
      const filename = "./snap.jpg";
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

function run(){
  const logger = log4js.getLogger(appname);
  logger.level = "debug";
  logger.info("START!!");

  setInterval(function() {
    takeScreenShot()
      .then(function(iname){
        setWallPaper(iname);
      })
      .catch(function(err){

      });
  }, 1000);
}

module.exports = run;