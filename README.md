# FreeQL
FreeQL is a aquatic chemistry equilibrium program, a successor to Visual MINTEQ

It uses the same database as MINTEQ, but the solvers have been rewritten in python and a new interface has been created. It can be used at https://soaser.github.io/FreeQL.

# How to use

to be added later

# Database
The database used my FreeQL can be downloaded at https://soaser.github.io/FreeQL/assets/solvers/comp.vdb. As of now, there is no way to edit the database, though a way to edit the logKs from the tableau view and to upload your databases is on the roadmap.

# Performance
The technique used to solve the equations is a tableau method as described in Morel and Herring (1993). Newton-Rhapson is used to converge on the solution from an initial guess currently universally set at 10^-5. As it is run in the browser using webassembly using pyodide, performance is not spectacular, but the code can be found and run natively in the [solver folder](assets/solver).
