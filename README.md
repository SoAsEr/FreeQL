https://app.gitbook.com/@stephmorel8910/s/freeql/

This is FreeQL, a chemical equilibrium solver.

It's a react app, and uses webassembly to perform the calculations locally. The solver can be found here: https://github.com/FreeQL/AQSystemSolver

Please note that if you are on windows, it will only function with WSL
In order to build the solver you must first run `npm config set emcc /path/to/emscripten`

`npm run build` will build the whole program, but if you only want to update the webassembly on the development server (e.g. when using `npm start`), use `npm run build-assembly`.

