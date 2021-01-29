
#pragma once

#include <vector>
#include <algorithm>
#include <functional>
#include <unordered_set>
#include <queue>
#include <optional>

#include <Eigen/Dense>

#include "SM_utils.hpp"

#define EIGEN_NO_AUTOMATIC_RESIZING 

namespace AQSystemSolver {
    template<typename MatrixType=Eigen::MatrixXd, typename VectorType=Eigen::VectorXd, typename RowVectorType=Eigen::RowVectorXd>
    class Tableau;

    template<typename T>
    using TableauType=T;
    //concept TableauType = SM_utils::is_base_of_template<T, Tableau>::value;

    
    template<typename Comp>
    using SolidVectorHeapIndexCompare=std::priority_queue<Eigen::Index, std::vector<Eigen::Index>, SM_utils::IndexCompare<Eigen::VectorXd, Comp, Eigen::Index>>;


    template<typename MatrixType, typename VectorType, typename RowVectorType>
    class Tableau{
        public:
            MatrixType coeffecients;
            VectorType constants;

            Eigen::Index rows() const{
                return constants.rows();
            }
            Eigen::Index cols() const{
                return coeffecients.cols();
            }
            VectorType evalTerms(const RowVectorType& x) const{
                MatrixType terms(coeffecients.rows(),coeffecients.cols());
                for(Eigen::Index i=0; i<coeffecients.rows(); ++i){
                    terms.row(i)=pow(x.array(), coeffecients.row(i).array());
                }
                return terms.rowwise().prod().array()*constants.array();
            }
            MatrixType evalAddends(VectorType speciesConcentrations) const{
                return coeffecients.array().colwise()*speciesConcentrations.array();
            }
            RowVectorType eval(const RowVectorType& x) const{
                return evalAddends(evalTerms(x)).colwise().sum();
            }
            RowVectorType eval(const VectorType& speciesConcentrations) const{
                return evalAddends(speciesConcentrations).colwise().sum();
            }
            RowVectorType eval(const MatrixType& addends) const{
                return addends.colwise().sum();
            }
            void resize(Eigen::Index rows, Eigen::Index cols){
                coeffecients.resize(rows, cols);
                constants.resize(rows);
            }
            void conservativeResize(Eigen::Index rows, Eigen::Index cols){
                coeffecients.conservativeResize(rows, cols);
                constants.conservativeResize(rows);
            }

            void substituteRowAndCol(const /*TableauType*/ auto& replacementTableau, Eigen::Index row, const /*TableauType*/ auto& originalTableau, Eigen::Index col){
                coeffecients+=originalTableau.coeffecients.col(col)*replacementTableau.coeffecients.row(row); 
                constants.array()*=pow(replacementTableau.constants.coeff(row), originalTableau.coeffecients.col(col).array());
            }
            Tableau reducedCopy(const auto& v1, const auto& v2) const {
                return {coeffecients(v1, v2), constants(v1)};
            }
            Tableau reducedCopy(const decltype(Eigen::all)& v1, const auto& v2) const {
                return {coeffecients(v1, v2), constants};
            }
    };
    template<typename MatrixType=Eigen::MatrixXd, typename VectorType=Eigen::VectorXd, typename RowVectorType=Eigen::RowVectorXd>
    class TableauWithTotals : public Tableau<MatrixType, VectorType, RowVectorType>{
        using parent=Tableau<MatrixType, VectorType, RowVectorType>;
        public:
            RowVectorType total;

            TableauWithTotals reducedCopy(const auto& v1, const auto& v2) const {
                return {parent::reducedCopy(v1, v2), total(v2)};
            }
            TableauWithTotals reducedCopy(const auto& v1, const decltype(Eigen::all)& v2) const {
                return {parent::reducedCopy(v1, v2), total};
            }
            TableauWithTotals reducedCopy(const decltype(Eigen::all)& v1, const auto& v2) const {
                return {parent::reducedCopy(v1, v2), total(v2)};
            }
            void substituteRowAndCol(const /*TableauType*/ auto& replacementTableau, Eigen::Index row, const TableauWithTotals& originalTableau, Eigen::Index col) {
                parent::substituteRowAndCol(replacementTableau, row, originalTableau, col);
                total+=originalTableau.total.coeff(col)*replacementTableau.coeffecients.row(row);
            }
            RowVectorType eval(const auto& x) const {
                return parent::eval(x)-total;
            }
            void resize(Eigen::Index rows, Eigen::Index cols){
                parent::resize(rows, cols);
                total.resize(cols); 
            }
            void conservativeResize(Eigen::Index rows, Eigen::Index cols){
                parent::conservativeResize(rows, cols);
                total.conservativeResize(cols); 
            }
    };

    template<typename Matrix1, bool resize=true>
    void removeRow(Eigen::Map<Matrix1>& matrix, Eigen::Index indexToRemove){
        matrix(Eigen::seq(indexToRemove, Eigen::last-1), Eigen::all)=matrix(Eigen::seq(indexToRemove+1, Eigen::last), Eigen::all);
        if(resize){
            new (&matrix) decltype(matrix)(matrix.data(), matrix.rows()-1, matrix.cols());
        }
    }

    template<typename Matrix1, bool resize=true>
    void addRow(Eigen::Map<Matrix1>& matrix, Eigen::Index where){
        if(resize){
            new (&matrix) decltype(matrix)(matrix.data(), matrix.rows()+1, matrix.cols());
        }
        matrix(Eigen::seq(where+1, Eigen::last), Eigen::all)=matrix(Eigen::seq(where, Eigen::last-1), Eigen::all);
    }
    template<bool resize=true>
    void addRow(auto& matrix, Eigen::Index indexToRemove){
        if(resize){
            matrix.conservativeResize(matrix.rows()+1, Eigen::NoChange);
        }
        matrix(Eigen::seq(indexToRemove+1, Eigen::last), Eigen::all)=matrix(Eigen::seq(indexToRemove, Eigen::last-1), Eigen::all);
    }
    template<bool resize=true>
    void removeRow(auto& matrix, Eigen::Index where){
        matrix(Eigen::seq(where, Eigen::last-1), Eigen::all)=matrix(Eigen::seq(where+1, Eigen::last), Eigen::all);
        if(resize){
            matrix.conservativeResize(matrix.rows()-1, Eigen::NoChange);
        }
    }

    struct Solid{
        Eigen::Index solidIndex; //should be const but i want to allow move
        Eigen::RowVectorXd row; //should be const but i want to allow move
        double constant;//should be const but i want to allow move
        Eigen::Index column;//should be const but i want to allow move
        std::size_t hash=1<<solidIndex;
        friend bool operator<(const Solid& solid1, const Solid& solid2){
            return solid1.solidIndex<solid2.solidIndex;
        }
        operator Eigen::Index() const {
            return solidIndex;
        }
    };
    struct SolidOwningSet : public SM_utils::flat_set<Solid>{
        std::ptrdiff_t presenceIndexOf(const Solid& solid) const {
            return &solid-SM_utils::flat_set<Solid>::data();
        }
    };

    class SolidSystem{
        public:
            Eigen::Index numPresent;
            const Eigen::Index size;
            const Eigen::Index cols;
            const Tableau<> tableau;
            SolidOwningSet solidsPresent;
            SolidOwningSet solidsNotPresent;
            std::unordered_set<std::size_t> combinationsHash;
            std::size_t currentCombinationHash;

        private:
            template<bool adding>
            std::reference_wrapper<Solid> addOrRemove(Solid& solidBeingChanged){
                auto& addingToContainer=adding ? solidsPresent : solidsNotPresent;
                auto& removingFromContainer=!adding ? solidsPresent : solidsNotPresent;

                const Eigen::Index fromRow=removingFromContainer.presenceIndexOf(solidBeingChanged);
                const Eigen::Index toRow=std::distance(addingToContainer.begin(), std::lower_bound(addingToContainer.begin(), addingToContainer.end(), solidBeingChanged));
                addingToContainer.insert(std::move(solidBeingChanged));
                removingFromContainer.erase(solidBeingChanged); //invalidates solidBeingChanged
                if(adding){
                    ++numPresent;
                } else {
                    --numPresent;
                }
                return addingToContainer[toRow];
            }

            std::reference_wrapper<Solid> add(Solid& solidBeingChanged){
                return addOrRemove<true>(solidBeingChanged);
            }
            std::reference_wrapper<Solid> remove(Solid& solidBeingChanged){
                return addOrRemove<false>(solidBeingChanged);
            }

            bool conditionallyAddHash(const Solid& solid){
                const std::size_t newHash=currentCombinationHash^solid.hash;
                return combinationsHash.insert(newHash).second && (currentCombinationHash=newHash, true);
            }
        public:
            std::optional<std::reference_wrapper<Solid>> conditionallyAdd(Solid& solid){
                if(conditionallyAddHash(solid)){
                    return add(solid);
                } else {
                    return std::nullopt;
                }
            }
            std::optional<std::reference_wrapper<Solid>> conditionallyRemove(Solid& solid){
                if(conditionallyAddHash(solid)){
                    return remove(solid);
                } else {
                    return std::nullopt;
                }
            }

            Eigen::VectorXd calculateSolidAmts(const Eigen::RowVectorXd& leftOvers, const auto& solidColumns) const{
                Eigen::MatrixXd solidAmtEqns(solidColumns.size(), numPresent);
                for(const Solid& solid : solidsPresent){
                    solidAmtEqns.col(solidsPresent.presenceIndexOf(solid))=solid.row(solidColumns).transpose();
                }
                const Eigen::VectorXd solidAmtLeftOver=leftOvers.transpose()(solidColumns);
                return solidAmtEqns.partialPivLu().solve(solidAmtLeftOver);
            }

            struct SolidChangeAttempt {
                bool success;
                std::optional<std::reference_wrapper<Solid>> solid;
            };
            
            SolidChangeAttempt possiblyRemoveSolid(const Eigen::VectorXd& solidAmts){
                std::optional<std::reference_wrapper<Solid>> solidNeedsToDisolve{std::nullopt};
                //we use a heap cause we usually wont need the full sort
                for(
                    auto indexHeap=SolidVectorHeapIndexCompare<std::greater<void>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solidAmts.rows()), {solidAmts}); 
                    Eigen::Index iThSolidPresent : SM_utils::ConsumingRange(indexHeap)
                ) {
                    if(solidAmts.coeff(iThSolidPresent)<0.0) [[unlikely]] {
                        //not const because if we remove the solid then we're changing it
                        Solid& solid=solidsPresent[iThSolidPresent];
                        if(auto newSolidRef=conditionallyRemove(solid); newSolidRef) [[likely]] {
                            return {true, newSolidRef};
                        } else if(!solidNeedsToDisolve){
                            //std::cout<<"WARNING: EITHER NEARLY LOOPED OR GIBBS RULE FAILED (remove)"<<std::endl;
                            solidNeedsToDisolve=solid;
                        }
                    } else {
                        return {false, solidNeedsToDisolve};
                    }
                }
                return {false, solidNeedsToDisolve};
            }
            SolidChangeAttempt possiblyAddSolid(const Eigen::VectorXd& solubilityProducts){
                std::optional<std::reference_wrapper<Solid>> solidNeedsToForm{std::nullopt};
                for(
                    #ifndef NDEBUG
                        //sort the solids in the wrong order so that we are much more likely to trigger a removal
                        auto indexHeap=SolidVectorHeapIndexCompare<std::greater<Eigen::Index>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solubilityProducts.rows()), {solubilityProducts});
                    #else
                        auto indexHeap=SolidVectorHeapIndexCompare<std::less<Eigen::Index>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solubilityProducts.rows()), {solubilityProducts});
                    #endif
                    Eigen::Index iThSolidNotPresent : SM_utils::ConsumingRange(indexHeap)
                ) {

                    if(solubilityProducts.coeff(iThSolidNotPresent)>1.0) [[likely]] { //the long running cases will have lots of solids being added
                        Solid& solid=solidsNotPresent[iThSolidNotPresent];
                        if(auto newSolidRef=conditionallyAdd(solid); newSolidRef) [[likely]] {
                            //conditionally add invalidated our reference 
                            return {true, newSolidRef};
                        } else if(!solidNeedsToForm){
                            //std::cout<<"WARNING: EITHER NEARLY LOOPED OR GIBBS RULE FAILED (add)"<<std::endl;
                            solidNeedsToForm=solid;
                        }
                    } else {
                        #ifdef NDEBUG
                            //short circuit if we're going in the right order 
                            return {false, solidNeedsToForm};
                        #endif
                    } 
                }
                return {false, solidNeedsToForm};
            }

        SolidSystem(const Tableau<>& tableau_, const std::unordered_set<Eigen::Index> starting_solids):
            numPresent{0},
            size{tableau_.rows()},
            cols{tableau_.cols()},
            tableau{tableau_}
        {
            solidsPresent.reserve(size);
            solidsNotPresent.reserve(size);
            for(Eigen::Index i=0; i<tableau.rows(); ++i){
                const bool starting=starting_solids.find(i)!=starting_solids.end();
                const std::size_t hash=std::size_t(1)<<i;
                if(starting){
                    ++numPresent;
                    currentCombinationHash^=hash;
                    solidsPresent.insert(Solid{i, tableau.coeffecients.row(i), tableau.constants.coeff(i), -1});
                } else {
                    solidsNotPresent.insert(Solid{i, tableau.coeffecients.row(i), tableau.constants.coeff(i), -1});
                }
            }
            combinationsHash.insert(currentCombinationHash);
        }
    };


    class SimpleReplacementDict{
        public:
            Eigen::Index numColumns;
            //which terms have been replaced out of existence
            SM_utils::flat_set<Eigen::Index> columns;
            SM_utils::flat_set<Eigen::Index> columnsNotReplaced;
            SM_utils::IncreasingPQ<Eigen::Index> nextRowToFill;
            std::vector<Eigen::Index> columnToRow;//because columns is not in order, and we always append to our replacement, this tells which column goes to which row
            Tableau<> unsimplifiedReplacement;
            Tableau<> replacement;
            Tableau<> replacementWithoutColumns;

            void groupTerms(){
                for(auto column : columns){
                    auto& power=replacement.coeffecients.coeffRef(columnToRow[column], column);
                    if(power==0){
                        continue; //it won't do anything, so we skip it.
                    }
                    double powerInv=1/(1-power);
                    replacement.coeffecients.row(columnToRow[column])*=powerInv;
                    replacement.constants.coeffRef(columnToRow[column])=pow(replacement.constants.coeff(columnToRow[column]), powerInv);
                    power=0;
                }
            }

            bool substituteTerms(){
                bool replacedAnything=false;
                const Tableau<> copyReplacement=replacement;
                for(auto column : columns){
                    if(std::any_of(SM_utils::NestingIterator(columnToRow, columns.begin()), SM_utils::NestingIterator(columnToRow, columns.end()), [&](Eigen::Index row) { return replacement.coeffecients.coeff(row, column)!=0; })) {
                        //std::cout<<"replaced"<<std::endl<<std::endl;
                        replacedAnything=true;
                        replacement.substituteRowAndCol(copyReplacement, columnToRow[column], copyReplacement, column);
                        replacement.coeffecients.col(column)-=copyReplacement.coeffecients.col(column);
                    }
                }
                return replacedAnything;
            }

            void simplify(){
                do{
                    groupTerms();
                } while(substituteTerms());
                //the last substitute terms doesn't change anything so we dont need to regroup terms
                replacementWithoutColumns=replacement.reducedCopy(Eigen::all, columnsNotReplaced);
            }

            void simplifyFromUnsimplified(){
                replacement=unsimplifiedReplacement;
                simplify();
            }

            auto createReplacedTableau(const /*TableauType*/ auto& orig) const {
                auto replaced=orig.reducedCopy(Eigen::all, columnsNotReplaced);
                if(orig.rows()) [[likely]] {
                    for(auto column : columns){
                        replaced.substituteRowAndCol(replacementWithoutColumns, columnToRow[column], orig, column);
                    }
                }
                return replaced;
            }            
            
            Eigen::Index size() const {
                assert(static_cast<Eigen::Index>(columns.size())==replacement.rows());
                return columns.size();
            }

            Eigen::Index addColumn(const Eigen::Index column){
                columnToRow[column]=nextRowToFill.top();
                nextRowToFill.pop();
                columns.insert(column);
                columnsNotReplaced.erase(column);
                return columnToRow[column];
            }

            void removeColumn(const Eigen::Index column){
                nextRowToFill.push(columnToRow[column]);
                columns.erase(column);
                columnsNotReplaced.insert(column);
            }

            void solveForTermAndAddToRow(const auto& rowVect, const double constant, const Eigen::Index term, const Eigen::Index row){
                const double termPowerInverse=-1.0/rowVect.coeff(term);

                unsimplifiedReplacement.coeffecients.row(row)=termPowerInverse*rowVect.array();
                unsimplifiedReplacement.coeffecients.coeffRef(row, term)=0.0;
                unsimplifiedReplacement.constants.coeffRef(row)=pow(constant, termPowerInverse);
                replacement.coeffecients.row(row)=unsimplifiedReplacement.coeffecients.row(row);
                replacement.constants.coeffRef(row)=unsimplifiedReplacement.constants.coeff(row);
            }
            
            SimpleReplacementDict(const /*std::ranges::range*/ auto& columns_, const Tableau<>& replacement_):
            numColumns{replacement_.cols()},
            columnsNotReplaced{SM_utils::CountingIterator(0), SM_utils::CountingIterator(replacement_.cols())},
            nextRowToFill{0},
            columnToRow(numColumns),
            unsimplifiedReplacement{replacement_},
            replacement{replacement_}
            {
                for(const Eigen::Index column: columns_) {
                    const Eigen::Index row=addColumn(column);
                    solveForTermAndAddToRow(replacement_.coeffecients.row(row), replacement_.constants(row), column, row);
                }
                simplifyFromUnsimplified();
            }
    };

    class ReplacementDictWithSolids : public SimpleReplacementDict{
        public:
            SM_utils::flat_set<Eigen::Index> solidColumns; //flat set to allow eigen indexing from a set
            SolidSystem solidSystem;
            void addSolid(Solid& solid){

                //should just segfault if it can't find a row
                //Eigen::Index term=*std::ranges::find_if(std::ranges::iota_view(0), [&](Eigen::Index term){ return solid.row.coeff(term)!=0.0 && !columns.contains(term); });
                Eigen::Index term=*std::find_if(SM_utils::CountingIterator(0), SM_utils::CountingIterator(numColumns), [&](Eigen::Index term){ return solid.row.coeff(term)!=0.0 && !columns.contains(term); });
                
                Eigen::Index row=addColumn(term);

                solid.column=term;
                solidColumns.insert(solid.column);

                solveForTermAndAddToRow(solid.row, solid.constant, term, row);
                
                //mostly already simplifed, just the last row, but we still have to iterate over all the columns
                simplify();
            }
            SolidSystem::SolidChangeAttempt possiblyAddSolid(const Eigen::VectorXd& solubilityProducts){
                const SolidSystem::SolidChangeAttempt addAttempt=solidSystem.possiblyAddSolid(solubilityProducts);
                if(addAttempt.success) [[likely]] {
                    addSolid(*addAttempt.solid);
                }
                return addAttempt;
            }
            void removeSolid(Solid& solid){
                removeColumn(solid.column);

                solidColumns.erase(solid.column);

                //TODO We should probably be able to plug it back into all our equations and then resimplify, but sounds hard and I know this works
                simplifyFromUnsimplified();
            }
            SolidSystem::SolidChangeAttempt possiblyRemoveSolid(const Eigen::VectorXd& solidAmts){
                const SolidSystem::SolidChangeAttempt removeAttempt=solidSystem.possiblyRemoveSolid(solidAmts);
                if(removeAttempt.success) [[unlikely]] {
                    removeSolid(*removeAttempt.solid);
                }
                return removeAttempt;
            }


            ReplacementDictWithSolids(const SimpleReplacementDict& origReplacementDict, const SolidSystem& solidSystem_) : 
            SimpleReplacementDict{origReplacementDict},
            solidSystem{solidSystem_}
            {
                //think of this as a reserve() call
                replacement.conservativeResize(origReplacementDict.replacement.rows()+solidSystem.size, numColumns);
                unsimplifiedReplacement.conservativeResize(origReplacementDict.replacement.rows()+solidSystem.size, numColumns);


                for(auto& solid : solidSystem.solidsPresent) {
                    addSolid(solid);
                }
                simplifyFromUnsimplified();
            }
    };

    std::pair<Eigen::RowVectorXd, Eigen::VectorXd> solveWithReplacement(const TableauWithTotals<>& replacedTableau) {
        
        Eigen::RowVectorXd currentSolution=Eigen::RowVectorXd::Constant(replacedTableau.cols(), 1e-5);
        for(std::size_t iter=0; iter<30; ++iter){
            const Eigen::VectorXd speciesConcentrations=replacedTableau.evalTerms(currentSolution);

            const Eigen::MatrixXd addends=replacedTableau.evalAddends(speciesConcentrations);

            const Eigen::RowVectorXd maxAddend=abs(addends.array()).colwise().maxCoeff();

            //x^c*c/x=(x^c)'
            const Eigen::MatrixXd jacobian=addends.transpose()*(replacedTableau.coeffecients.array().rowwise()/currentSolution.array()).matrix();

            const Eigen::RowVectorXd yResult=replacedTableau.eval(addends);

            if(abs(yResult.array()/maxAddend.array()).maxCoeff()<1e-5) [[unlikely]] {
                return {std::move(currentSolution), std::move(speciesConcentrations)};
            }

            Eigen::RowVectorXd delta=jacobian.partialPivLu().solve(yResult.transpose()).transpose();

            //don't go into the negatives, instead divide by 10
            delta=(delta.array()<currentSolution.array()).select(delta, currentSolution*0.9);
            

            currentSolution-=delta;
        }
        throw std::runtime_error("failure to converge");
    }

     struct SolidPresent{
        Eigen::Index solidIndex;
        double concentration;

        friend bool operator<(const SolidPresent& solid1, const SolidPresent& solid2){
            return solid1.solidIndex<solid2.solidIndex;
        }
        operator Eigen::Index() const {
            return solidIndex;
        }
    };
    struct SolidNotPresent{
        Eigen::Index solidIndex;
        double solubilityProduct;

        friend bool operator<(const SolidNotPresent& solid1, const SolidNotPresent& solid2){
            return solid1.solidIndex<solid2.solidIndex;
        }
        operator Eigen::Index() const {
            return solidIndex;
        }
    };
        
    struct Equilibrium {
        TableauWithTotals<> tableau;
        SolidSystem initialSolidSystem;
        SimpleReplacementDict origReplacements;

        SimpleReplacementDict finalReplacements;
        Eigen::RowVectorXd finalSolution;

        Eigen::VectorXd tableauConcentrations;

        SM_utils::flat_set<SolidPresent> solidsPresent;
        SM_utils::flat_set<SolidNotPresent> solidsNotPresent;

        //this is useful a) to know error and b) to get the totals if you have a replacement
        Eigen::RowVectorXd getTotalConcentrations() const {
            Eigen::RowVectorXd totalConcentrations=static_cast<Tableau<>>(tableau).eval(tableauConcentrations);
            Eigen::VectorXd solidConcentrations(solidsPresent.size());
            {
                auto concIt=solidConcentrations.begin();
                for(const auto& solidPresent: solidsPresent){
                    *concIt=solidPresent.concentration;
                    ++concIt;
                }
            }
            totalConcentrations+=initialSolidSystem.tableau.reducedCopy(solidsPresent, Eigen::all).eval(solidConcentrations);
            return totalConcentrations;
        }
        Eigen::VectorXd getExtraSolubilityProducts(const Tableau<>& extraSolids) const {
            return finalReplacements.createReplacedTableau(extraSolids).evalTerms(finalSolution);
        }
    };

    Equilibrium solveForEquilibrium(const TableauWithTotals<>& tableau, const SolidSystem& initialSolidSystem, const SimpleReplacementDict& origReplacementDict){
        Eigen::RowVectorXd currentSolution;
        Eigen::VectorXd speciesConcentrations;
        Eigen::VectorXd solubilityProducts;
        Eigen::VectorXd solidAmts;


        ReplacementDictWithSolids replacementDictWithSolids{origReplacementDict, initialSolidSystem};

        for(;;){
            const auto currentReplacedTableau=replacementDictWithSolids.createReplacedTableau(tableau);
            if(currentReplacedTableau.cols()){
                std::tie(currentSolution, speciesConcentrations)=solveWithReplacement(currentReplacedTableau);
            } else {
                currentSolution=Eigen::VectorXd(0);
                speciesConcentrations=currentReplacedTableau.constants;
            }
            const auto solidsNotHereTableau=replacementDictWithSolids.createReplacedTableau(replacementDictWithSolids.solidSystem.tableau.reducedCopy(replacementDictWithSolids.solidSystem.solidsNotPresent, Eigen::all));
            assert(solidsNotHereTableau.cols()==currentReplacedTableau.cols());
            if(currentReplacedTableau.cols()){
                solubilityProducts=solidsNotHereTableau.evalTerms(currentSolution);
            } else {
                solubilityProducts=solidsNotHereTableau.constants;
            }

            //std::cout<<speciesConcentrations<<std::endl<<std::endl;

            solidAmts=replacementDictWithSolids.solidSystem.calculateSolidAmts(-tableau.eval(speciesConcentrations), replacementDictWithSolids.solidColumns); 

            SolidSystem::SolidChangeAttempt removalAttempt=replacementDictWithSolids.possiblyRemoveSolid(solidAmts);
            if(removalAttempt.success) {
                continue;
            }
            SolidSystem::SolidChangeAttempt addAttempt=replacementDictWithSolids.possiblyAddSolid(solubilityProducts);
            if(addAttempt.success) {
                continue;
            }

            
            //there used to be a huge piece of code to try and switch two solids (remove one and add another within a single iteration). It was a mess, huge, and didn't really help recovery        
            if(removalAttempt.solid){
                //we've looped, and the adding didn't help
                throw std::runtime_error("failed to recover from loop. You may have to provide an initial guess for which solids are present.");
            }
            if(addAttempt.solid){
                //we've looped while trying to add.
                throw std::runtime_error("failed to recover from loop. You may have to provide an initial guess for which solids are present.");
            }
            break;
        }
        std::vector<SolidPresent> solidsPresent;
        for(const auto& solidPresent: replacementDictWithSolids.solidSystem.solidsPresent){
            solidsPresent.push_back({solidPresent.solidIndex, solidAmts.coeff(replacementDictWithSolids.solidSystem.solidsPresent.presenceIndexOf(solidPresent))});
        }
        std::vector<SolidNotPresent> solidsNotPresent;
        for(const auto& solidNotPresent: replacementDictWithSolids.solidSystem.solidsNotPresent){
            solidsNotPresent.push_back({solidNotPresent.solidIndex, solubilityProducts.coeff(replacementDictWithSolids.solidSystem.solidsNotPresent.presenceIndexOf(solidNotPresent))});
        }
        return {
            tableau, initialSolidSystem, origReplacementDict,
            static_cast<SimpleReplacementDict>(replacementDictWithSolids), std::move(currentSolution),
            std::move(speciesConcentrations),
            {solidsPresent.begin(), solidsPresent.end()},
            {solidsNotPresent.begin(), solidsNotPresent.end()},
        };
    }
}