const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");
const argv = requirea("yargs").argv;
const log4js = require("log4js");
const ctrlcoff = require("ctrl-c");
const tty = require("tty");
const readline = require("readline");

const appname = "desktop-confuser";

let mode = "shot";
if(argv.mode === "images" || argv.images){
  mode = "images";
}

let interval = 1000;
if(argv.interval){
  const mseconds = Number(argv.interval) ? Number(argv.interval) : interval;
  interval = mseconds;
}

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

function startReadLine(){
  process.stdin.setEncoding('utf8');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("line", function(d){
    if(d === "end" || d === "kill" || d === "exit"){
      exitProgram();
    }
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
      exitProgram();
    }
  });
  ctrlcoff(true);
}

function exitProgram(){
  setWallPaper(initialWPPath)
    .then(function(){
      logger.info("Process killed");
      process.exit();
    });
}

function runShotAndSet(){
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
  }, interval);
}

function run(){

  startReadLine();
  disableCtrlC();
  process.on("exit", exitProgram);

  runShotAndSet();

}

module.exports = run;