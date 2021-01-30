#!/usr/bin/env node
const { exec } = require('child_process');
exec("bash public/static/js/build.sh "+process.env.npm_config_emcc, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`${stdout}`);
  console.error(`${stderr}`);
});