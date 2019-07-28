const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");
const log4js = require("log4js");
const ctrlcoff = require("ctrl-c");
const tty = require("tty");

console.log(tty);
console.log(process.stdin.ReadStream);
console.log(tty.ReadStream.setRawMode);
console.log(process.stdout.isTTY);

const appname = "desktop-confuser";

const logger = log4js.getLogger(appname);
logger.level = "debug";
logger.info("START!!");

let initialWPPath = "";


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
  return wallpaper.set(imgname)
    .then(function(res){
      logger.info(`SET ${imgname}`);
    })
    .catch(function(err){

    });

}

function saveWallPaper(){
  return wallpaper.get()
          .then(function(p){
            if(p){
              logger.info("COPY Wallpaper: " + p);
              fs.copyFileSync(p, "temp");
            }
          })
          .catch(function(err){

          });
}

function saveWallPaperPath(){
  return wallpaper.get()
          .then(function(p){
            if(p){
              logger.info("Wallpaper Path: " + p);
              initialWPPath = p;
            }
          })
          .catch(function(err){

          });
}


function disableCtrlC(){
  if(process.stdin.setRawMode){
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.on("keypress", function(chunk, key) {
    if(key && key.name === "c" && key.ctrl) {
      logger.info("Pressed Ctrl + C");
      beforeExit();
    }
  });
  ctrlcoff(true);
}

function beforeExit(){
  setWallPaper(initialWPPath)
    .then(function(){
      logger.info("Process killed");
      process.exit();
    });
}

function run(){

  disableCtrlC();
  process.on("exit", beforeExit);

  saveWallPaperPath();

  setWallPaper("./default_snap.jpg")
    .then(function(){
    });

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