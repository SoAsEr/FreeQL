#include "TableauSolver.cpp"

#include <stdio.h>
#include <emscripten.h>
#include <emscripten/bind.h>

#include <iostream>

using namespace emscripten;

/*
    VectorXd aqueousConcentrations;
    RowVectorXd totalConcentrations;
    SolidStaticVector<Index> solidsPresent;
    SolidStaticVector<double> solidConcentrations;
    SolidStaticVector<Index> solidsNotPresent;
    SolidStaticVector<double> solidSolubilityProducts;
*/

void userInput(std::vector<double>& aqConcRes, std::vector<double>& totConcRes, std::vector<int>& solidsPresentRes, std::vector<double>& solidConcRes, std::vector<int>& solidsNotPresentRes, std::vector<double>& solidSolubilityProductRes
  , std::vector<double>& totalConcentrationsVect
  , std::vector<double>& aqueousTableauVect, std::vector<double>& aqueousKsVect
  , std::vector<double>& solidTableauVect, std::vector<double>& solidKsVect
  , std::vector<double>& replacementTableauVect, std::vector<double>& replacementConstantsVect, std::vector<int>& replacementColumnsVect
  ){

    std::cout<<"RUNNNING_THIS"<<std::endl;
    const Map<RowVectorXd> totalConcentrations(totalConcentrationsVect.data(), totalConcentrationsVect.size());
    
    const Map<Matrix<double, Dynamic, Dynamic, RowMajor>> aqueousTableau(aqueousTableauVect.data(), aqueousKsVect.size(), totalConcentrationsVect.size());
    const Map<VectorXd> aqueousKs(aqueousKsVect.data(), aqueousKsVect.size());

    const Map<SolidMatrix> solidsTableau(solidTableauVect.data(), solidKsVect.size(), totalConcentrationsVect.size());

    const Map<SolidVector> solidKs(solidKsVect.data(), solidKsVect.size());

    const Map<Matrix<double, Dynamic, Dynamic, RowMajor>> replacementTableau(replacementTableauVect.data(), replacementConstantsVect.size(), totalConcentrationsVect.size());
    const Map<VectorXd> replacementConstants(replacementConstantsVect.data(), replacementConstantsVect.size());

    std::cout<<aqueousTableau<<std::endl<<std::endl;
    std::cout<<aqueousKs<<std::endl<<std::endl;
    std::cout<<totalConcentrations<<std::endl<<std::endl;    

    std::cout<<solidsTableau<<std::endl<<std::endl;    
    std::cout<<solidKs<<std::endl<<std::endl;    

    SM_utils::print_vect(replacementColumnsVect);
    std::cout<<replacementTableau<<std::endl<<std::endl;
    std::cout<<replacementConstants<<std::endl<<std::endl;

    Result res=solve({{aqueousTableau, aqueousKs}, totalConcentrations},
    {{solidsTableau, solidKs}, {}},
    {replacementColumnsVect, {replacementTableau, replacementConstants}});
    //std::cout<<res<<std::endl;

    aqConcRes=std::vector<double>(&res.aqueousConcentrations(0), &res.aqueousConcentrations(0)+res.aqueousConcentrations.size());
    totConcRes=std::vector<double>(&res.totalConcentrations(0), &res.totalConcentrations(0)+res.totalConcentrations.size());
    solidsPresentRes=std::move(res.solidsPresent);
    solidConcRes=std::vector<double>(&res.solidConcentrations(0), &res.solidConcentrations(0)+res.solidConcentrations.size());
    solidsNotPresentRes=std::move(res.solidsNotPresent);
    solidSolubilityProductRes=std::vector<double>(&res.solidSolubilityProducts(0), &res.solidSolubilityProducts(0)+res.solidSolubilityProducts.size());
}


EMSCRIPTEN_BINDINGS(my_class) {

  emscripten::register_vector<double>("VectorDouble");
  emscripten::register_vector<int>("VectorInt");

  emscripten::function("userInput", &userInput);

  emscripten::enum_<POSSIBLE_ERRORS>("POSSIBLE_ERRORS")
    .value("no_converge", POSSIBLE_ERRORS::no_converge);

}

//emcc --extern-pre-js ./prepend.txt -s MODULARIZE=1 -s EXTRA_EXPORTED_RUNTIME_METHODS=["getValue"] -s ALLOW_MEMORY_GROWTH=1 -I /usr/local/include -Wno-everything --bind -O3 -DNDEBUG -std=c++2a TableauSolverWebassembly.cpp -o TableauSolver.js

/*
3.47904e-07
 0.00232599
6.97255e-07
 0.00718801
2.89428e-08
2.55947e-08
  0.0038446
 0.00266876
1.34896e-06
0.000123441
 1.4676e-08
1.30361e-08
0.000694159
5.01187e-06
          0
  0.0375636
 0.00254916
*/