const screenshot = require("screenshot-desktop");
const fs = require("fs");

screenshot()
  .then(function(img){
    fs.writeFileSync("./snap.jpg", img);
  })
  .catch(function(err){

  });