# FreeQL
FreeQL is a aquatic chemistry equilibrium program, a successor to Visual MINTEQ

It uses the same database as MINTEQ, but the solvers have been rewritten in python and a new interface has been created. It can be used at https://soaser.github.io/FreeQL. Please note that it only works on chrome or on the very latest versions of firefox.

# Database
The database used my FreeQL can be found and downloaded in the [solver folder](assets/solver). As of now, there is no way to add your own components or species, but the logKs can be edited from within the application.

# Performance
The technique used to solve the equations is a tableau method as described in Morel and Hering (1993). Newton-Rhapson is used to converge on the solution from an initial guess currently universally set at 10^-5. It is written in python, and run in the browser using pyodide. Performance is not spectacular, but if necesary the code can be run natively in the [solver folder](assets/solver). This code has not been heavily optimized, instead focusing on generality and readability.

# How to use/Further Documentation
A tutorial is available at at the [gitbook](https://stephmorel8910.gitbook.io/freeql/#entering-concentrations)
