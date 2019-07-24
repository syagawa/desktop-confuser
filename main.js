const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");
const log4js = require("log4js");

const appname = "desktop-confuser";

const logger = log4js.getLogger(appname);
logger.level = "debug";
logger.info("START!!");


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
      logger.info(`SET ${imgname}`);
    })
    .catch(function(err){

    });

}

function run(){
  setWallPaper("./default_snap.jpg");

  setInterval(function() {
    takeScreenShot()
      .then(function(iname){
        setWallPaper(iname);
        logger.info(`SHOT ${iname}`);
      })
      .catch(function(err){

      });
  }, 1000);
}

module.exports = run;