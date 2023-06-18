const chokidar = require("chokidar");

const { exec } = require("child_process");

const runNpm = (command) => {
  console.log("start " + command);
  exec("npm run " + command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`${stdout}`);
    console.error(`${stderr}`);
  });
};

const assemblyWatcher = chokidar.watch(
  [
    "public/solver/**/*.txt",
    "public/solver/**/*.cpp",
    "public/solver/**/*.hpp",
  ],
  {
    ignoreInitial: true,
  }
);
assemblyWatcher.on("add", () => runNpm("build:assembly"));
assemblyWatcher.on("change", () => runNpm("build:assembly"));
assemblyWatcher.on("unlink", () => runNpm("build:assembly"));

const ajvWatcher = chokidar.watch("src/AJV/*", {
  ignoreInitial: true,
});

ajvWatcher.on("add", () => runNpm("build:ajv"));
ajvWatcher.on("change", () => runNpm("build:ajv"));
ajvWatcher.on("unlink", () => runNpm("build:ajv"));
