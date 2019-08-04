const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");
const argv = require("yargs").argv;
const log4js = require("log4js");
const ctrlcoff = require("ctrl-c");
const tty = require("tty");
const readline = require("readline");
const path = require("path");

const appname = "desktop-confuser";

const g = {
  argv: argv,
  get mode(){
    if(this.argv.mode === "images" || this.argv.images){
      return "images";
    }else{
      return "shot"
    }
  },
  get interval(){
    const v = 1000;
    if(this.argv.interval){
      return Number(this.argv.interval) ? Number(this.argv.interval) : v;
    }else{
      return v;
    }
  },
  get images_path(){
    if(this.argv.imagespath){
      return this.argv.imagespath;
    }else{
      return "./images";
    }
  },
  initialWPPath: "",
  default_snapshot_image_name: "./default_snap.jpg",
  temp_snapshot_image_name: "./_snap.jpg",
  images: []
};

const logger = log4js.getLogger(appname);
logger.level = "debug";
logger.info("START!!");

function takeScreenShot(){
  return screenshot()
    .then(function(img){
      const filename = g.temp_snapshot_image_name;
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
              g.initialWPPath = p;
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
  setWallPaper(g.initialWPPath)
    .then(function(){
      logger.info("Process killed");
      process.exit();
    });
}

function runShotAndSet(){
  saveWallPaperPath();

  setWallPaper(g.default_snapshot_image_name)
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
  }, g.interval);
}

function runSet(p){
  saveWallPaperPath();
  const files = fs.readdirSync(p);
  files.forEach(function(elm){
    const file = path.join(p, elm);
    if(fs.statSync(file).isFile()){
      g.images.push(file);
    }
  });
  console.log(g.images);


  let i = 0;
  const len = g.images.length;
  setInterval(function() {
    setWallPaper(g.images[i]);
    logger.info(`SET ${g.images[i]}`);
    i++;
    if( i >= len){
      i = 0;
    }
  }, g.interval);


}

function run(){

  startReadLine();
  disableCtrlC();
  process.on("exit", exitProgram);

  if(g.mode === "images"){
    runSet(g.images_path);
  }else{
    runShotAndSet();
  }
}

module.exports = run;