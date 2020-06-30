# FreeQL
FreeQL is a aquatic chemistry equilibrium program, a successor to Visual MINTEQ

It uses the same database as MINTEQ, but the solvers have been rewritten in python and a new interface has been created. It can be used at https://soaser.github.io/FreeQL.

# How to use

todo

# Database
The database used my FreeQL can be downloaded at https://soaser.github.io/FreeQL/assets/solvers/comp.vdb. As of now, there is no way to edit the database, though a way to edit the logKs from the tableau view and to upload your databases is on the roadmap.

# Performance
The technique used to solve the equations is a tableau method as described in Morel and Herring (1993). Newton-Rhapson is used to converge on the solution from an initial guess currently universally set at 10^-5. It is written in python, and run in the browser using pyodide. Performance is not spectacular, but if necesary the code can be run natively in the [solver folder](assets/solver).
