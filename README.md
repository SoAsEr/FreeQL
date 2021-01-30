https://app.gitbook.com/@stephmorel8910/s/freeql/

This is FreeQL, a chemical equilibrium solver.

It's a react app, and uses webassembly to perform the calculations locally. The solver can be found here: https://github.com/FreeQL/AQSystemSolver


#Building the solver
Please note that if you are on windows, this will only work if you have the WSL

1. Tell cmake where to find emcc with `npm config set emcc /path/to/emscripten/emcc`
2.`npm run build` will build the whole program, but if you only want to update the webassembly on the development server (e.g. when using `npm start`), use `npm run build-assembly`.

