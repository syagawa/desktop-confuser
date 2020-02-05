const screenshot = require("screenshot-desktop");
const wallpaper = require("wallpaper");
const fs = require("fs");
const argv = require("yargs").argv;
const log4js = require("log4js");
const ctrlcoff = require("ctrl-c");
const tty = require("tty");
const readline = require("readline");
const path = require("path");
const request = require("request");
const settings = require("./settings.js");

const appname = "desktop-confuser";

console.log(argv);

const g = {
  argv: argv,
  get mode(){
    if(this.argv.mode === "images" || this.argv.images){
      return "images";
    }else if(this.argv.mode === "get" || this.argv.get){
      return "get";
    }else{
      return "shot";
    }
  },
  get interval(){
    const v = 1000;
    const min = 0;
    const max = 10000;
    let num = 0;
    if(this.argv.interval){
      num = Number(this.argv.interval);
    }else{
      num = v;
    }
    if(num < min){
      num = min;
    }else if(num > max){
      num = max;
    }
    return num;
  },
  get images_path(){
    if(this.argv.imagespath){
      return this.argv.imagespath;
    }else{
      return "./images";
    }
  },
  get image_urls(){
    let urls = settings.urls;

    if(this.argv.imageUrls){
      urls = this.argv.imageUrls.split(",");
    }
    return urls;
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

function getImagesAndSave(urls){
  const dist = "./images";

  urls = g.image_urls;

  try{
    fs.statSync(dist);
  }catch(err){
    fs.mkdirSync(dist);
  }

  const promises = [];

  let counter = 0;
  urls.forEach(function(url){
    const p = new Promise(function(resolve, reject){
      request(
        {
          method: "GET",
          url: url,
          encoding: null
        },
        function(err, res, body){
          console.log(res, body);
          if(err){
            reject(err);
          }
          if(res.statusCode !== 200){
            reject("Can't get image");
          }
          counter++;
          const filepath = path.join(dist, String(counter).padStart(5, 0) + ".jpg");
          fs.writeFileSync(filepath, body, "binary");
          resolve(filepath);
        }
      );
     });
    promises.push(p);
  });

  return Promise.all(promises);
}

function startReadLine(){
  process.stdin.setEncoding('utf8');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("line", function(d){
    if(d === "end" || d === "kill" || d === "exit" || d === "quit"){
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

function readdirAsync(p){
  return new Promise(function(resolve, reject){
    return fs.readdir(p, function(err, filenames){
      if(err){
        return reject(err);
      }else{
        return resolve(filenames);
      }
    });
  });
}

async function runSet(p){
  saveWallPaperPath();
  const files = await readdirAsync(p)
    .then(function(res){
      return res;
    })
    .catch(function(err){
      console.log(err);
      exitProgram();

    });
    console.log(2, files);


  files.forEach(function(elm){
    const file = path.join(p, elm);
    if(fs.statSync(file).isFile()){
      g.images.push(file);
    }
  });
  console.log(g.images);

  const sleep = function(msec){
    return new Promise(function(resolve, reject){
      return setTimeout(resolve, msec);
    });
  };

  const repeater = async function(cb, interval){
    let bool = true;
    while(bool){
      await Promise.all([cb(), sleep(interval)]);
    }
  };

  let i = 0;
  const len = g.images.length;
  const doset = function(){
    return setWallPaper(g.images[i])
      .then(function(res){
        i++;
        if( i >= len){
          i = 0;
        }
      });
  };

  repeater(doset, g.interval);

}

function run(){

  startReadLine();
  disableCtrlC();
  process.on("exit", exitProgram);

  if(g.mode === "images"){
    runSet(g.images_path);
  }else if(g.mode === "get"){
    getImagesAndSave()
      .then(function(res){
        console.log(res);
      });

  }else{
    runShotAndSet();
  }
}

module.exports = run;