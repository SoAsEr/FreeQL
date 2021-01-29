#include <iostream>
#include "AQSystemSolver.hpp"

#include <emscripten.h>
#include <emscripten/bind.h>

AQSystemSolver::Tableau<> createTableau(const emscripten::val& tableau, const std::size_t width){
    const std::size_t height=tableau["constants"]["length"].as<std::size_t>();
    
    Eigen::MatrixXd coefficients(height, width);
    const std::vector<double> coeffecientsVect=emscripten::convertJSArrayToNumberVector<double>(tableau["coefficients"]);
    std::copy(coeffecientsVect.begin(), coeffecientsVect.end(), coefficients.reshaped<Eigen::RowMajor>().begin());

    const std::vector<double> constantsVect=emscripten::convertJSArrayToNumberVector<double>(tableau["constants"]);
    Eigen::VectorXd constants(height);
    std::copy(constantsVect.begin(), constantsVect.end(), constants.begin());
    return AQSystemSolver::Tableau<>{std::move(coefficients), std::move(constants)};
}

AQSystemSolver::TableauWithTotals<> createTableauWithTotals(const emscripten::val& tableauWithTotals, const std::size_t width){
    const std::vector<double> totalsVect=emscripten::convertJSArrayToNumberVector<double>(tableauWithTotals["totals"]);
    Eigen::RowVectorXd totals(width);
    std::copy(totalsVect.begin(), totalsVect.end(), totals.begin());
    return AQSystemSolver::TableauWithTotals<>{{createTableau(tableauWithTotals["tableau"], width)}, std::move(totals) };
}

template<typename T>
std::unordered_set<T> createUnorderedSet(const emscripten::val& array){
    const std::vector<T> vector_rep=emscripten::convertJSArrayToNumberVector<Eigen::Index>(array);
    return {vector_rep.begin(), vector_rep.end()};
}

AQSystemSolver::Equilibrium calculateEquilibrium(const std::size_t tableauWidth, const emscripten::val& tableauWithTotals, const emscripten::val& solids, const emscripten::val& replacements){
    return AQSystemSolver::solveForEquilibrium(
        createTableauWithTotals(tableauWithTotals, tableauWidth),
        {createTableau(solids["tableau"], tableauWidth), createUnorderedSet<Eigen::Index>(solids["initialGuess"])},
        {emscripten::convertJSArrayToNumberVector<Eigen::Index>(replacements["columns"]), createTableau(replacements["tableau"], tableauWidth)}
    );
}

emscripten::val getTableauConcentrations(const AQSystemSolver::Equilibrium& equilibrium){
    return emscripten::val::array(equilibrium.tableauConcentrations.begin(), equilibrium.tableauConcentrations.end());
}
emscripten::val getSolidsPresent(const AQSystemSolver::Equilibrium& equilibrium){
    auto indexes=emscripten::val::array();
    auto concentrations=emscripten::val::array();
    for(const auto& solid: equilibrium.solidsPresent){
        indexes.call<void>("push", solid.solidIndex);
        concentrations.call<void>("push", solid.concentration);
    }
    auto ret=emscripten::val::object();
    ret.set("rows", indexes);
    ret.set("concentrations", concentrations);
    return ret;
}
emscripten::val getSolidsNotPresent(const AQSystemSolver::Equilibrium& equilibrium){
    auto indexes=emscripten::val::array();
    auto solubilityProducts=emscripten::val::array();
    for(const auto& solid: equilibrium.solidsNotPresent){
        indexes.call<void>("push", solid.solidIndex);
        solubilityProducts.call<void>("push", solid.solubilityProduct);
    }
    auto ret=emscripten::val::object();
    ret.set("rows", indexes);
    ret.set("solubilityProducts", solubilityProducts);
    return ret;
}
emscripten::val getTotalConcentrations(const AQSystemSolver::Equilibrium& equilibrium){
    const auto totalConcentrations=equilibrium.getTotalConcentrations();
    return emscripten::val::array(totalConcentrations.begin(), totalConcentrations.end());
}
emscripten::val getExtraSolubilityProducts(const AQSystemSolver::Equilibrium& equilibrium, const emscripten::val& tableau){
    const auto solubilityProducts=equilibrium.getExtraSolubilityProducts(createTableau(tableau, equilibrium.tableau.cols()));
    return emscripten::val::array(solubilityProducts.begin(), solubilityProducts.end());
}

EMSCRIPTEN_BINDINGS(my_class) {
    emscripten::class_<AQSystemSolver::Equilibrium>("Equilbrium");
    emscripten::function("calculateEquilibrium", &calculateEquilibrium);

    emscripten::function("getTableauConcentrations", &getTableauConcentrations);

    emscripten::function("getSolidsPresent", &getSolidsPresent);

    emscripten::function("getSolidsNotPresent", &getSolidsNotPresent);
    
    emscripten::function("getTotalConcentrations", &getTotalConcentrations);

    emscripten::function("getExtraSolubilityProducts", &getExtraSolubilityProducts);
}

