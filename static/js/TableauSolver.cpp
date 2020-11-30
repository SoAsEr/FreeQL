#define EIGEN_NO_AUTOMATIC_RESIZING 
#define EIGEN_DEFAULT_DENSE_INDEX_TYPE int


#include <vector>
#include <algorithm>
#include <functional>
#include <unordered_set>
#include <queue>
#include <optional>

#include <chrono>
#include <iostream>

#include <boost/container/static_vector.hpp>

#include "SM_utils.hpp"

#include <Eigen/Dense>

enum POSSIBLE_ERRORS {
    no_converge=10
};

using namespace Eigen;

template<typename MatrixType=MatrixXd, typename VectorType=VectorXd, typename RowVectorType=RowVectorXd>
class Tableau;

template<typename T>
using TableauType=T;
//concept TableauType = SM_utils::is_base_of_template<T, Tableau>::value;

template<typename MatrixType, typename VectorType, typename RowVectorType>
class Tableau{
    public:
        MatrixType coeffecients;
        VectorType constants;

        Index rows() const{
            return constants.rows();
        }
        Index cols() const{
            return coeffecients.cols();
        }
        VectorType evalTerms(const RowVectorType& x) const{
            MatrixType terms(coeffecients.rows(),coeffecients.cols());
            for(Index i=0; i<coeffecients.rows(); ++i){
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
        void resize(Index rows, Index cols){
            coeffecients.resize(rows, cols);
            constants.resize(rows);
        }
        void conservativeResize(Index rows, Index cols){
            coeffecients.conservativeResize(rows, cols);
            constants.conservativeResize(rows);
        }

        void substituteRowAndCol(const /*TableauType*/ auto& replacementTableau, Index row, const /*TableauType*/ auto& originalTableau, Index col){
            coeffecients+=originalTableau.coeffecients.col(col)*replacementTableau.coeffecients.row(row); 
            constants.array()*=pow(replacementTableau.constants.coeff(row), originalTableau.coeffecients.col(col).array());
        }
        Tableau reducedCopy(const auto& v1, const auto& v2) const {
            return {coeffecients(v1, v2), constants(v1)};
        }
        Tableau reducedCopy(const decltype(all)& v1, const auto& v2) const {
            return {coeffecients(v1, v2), constants};
        }
};
template<typename MatrixType=MatrixXd, typename VectorType=VectorXd, typename RowVectorType=RowVectorXd>
class TableauWithTotal : public Tableau<MatrixType, VectorType, RowVectorType>{
    using parent=Tableau<MatrixType, VectorType, RowVectorType>;
    public:
        RowVectorType total;

        TableauWithTotal reducedCopy(const auto& v1, const auto& v2) const {
            return {parent::reducedCopy(v1, v2), total(v2)};
        }
        TableauWithTotal reducedCopy(const auto& v1, const decltype(all)& v2) const {
            return {parent::reducedCopy(v1, v2), total};
        }
        TableauWithTotal reducedCopy(const decltype(all)& v1, const auto& v2) const {
            return {parent::reducedCopy(v1, v2), total(v2)};
        }
        void substituteRowAndCol(const /*TableauType*/ auto& replacementTableau, Index row, const TableauWithTotal& originalTableau, Index col) {
            parent::substituteRowAndCol(replacementTableau, row, originalTableau, col);
            total+=originalTableau.total.coeff(col)*replacementTableau.coeffecients.row(row);
        }
        RowVectorType eval(const auto& x) const {
            return parent::eval(x)-total;
        }
        void resize(Index rows, Index cols){
            parent::resize(rows, cols);
            total.resize(cols); 
        }
        void conservativeResize(Index rows, Index cols){
            parent::conservativeResize(rows, cols);
            total.conservativeResize(cols); 
        }
        std::tuple<RowVectorType, VectorType, MatrixType, RowVectorType> evalForSolution(const RowVectorType& x) const{
            const VectorType speciesConcentrations=parent::evalTerms(x);

            const MatrixType addends=parent::evalAddends(speciesConcentrations);

            const RowVectorType maxAddend=abs(addends.array()).colwise().maxCoeff();

            //x^c*c/x=(x^c)'
            const MatrixType jacobian=addends.transpose()*(parent::coeffecients.array().rowwise()/x.array()).matrix();

            const RowVectorType yResult=TableauWithTotal::eval(addends);

            return {std::move(yResult), std::move(speciesConcentrations), std::move(jacobian), std::move(maxAddend)};
        }

};

template<typename Matrix1, bool resize=true>
void removeRow(Map<Matrix1>& matrix, Index indexToRemove){
    matrix(seq(indexToRemove, last-1), all)=matrix(seq(indexToRemove+1, last), all);
    if(resize){
        new (&matrix) decltype(matrix)(matrix.data(), matrix.rows()-1, matrix.cols());
    }
}
template<typename Matrix1, bool resize=true>
void addRow(Map<Matrix1>& matrix, Index where){
    if(resize){
        new (&matrix) decltype(matrix)(matrix.data(), matrix.rows()+1, matrix.cols());
    }
    matrix(seq(where+1, last), all)=matrix(seq(where, last-1), all);
}
template<bool resize=true>
void addRow(auto& matrix, Index indexToRemove){
    if(resize){
        matrix.conservativeResize(matrix.rows()+1, NoChange);
    }
    matrix(seq(indexToRemove+1, last), all)=matrix(seq(indexToRemove, last-1), all);
}
template<bool resize=true>
void removeRow(auto& matrix, Index where){
    matrix(seq(where, last-1), all)=matrix(seq(where+1, last), all);
    if(resize){
        matrix.conservativeResize(matrix.rows()-1, NoChange);
    }
}



struct Solid{
    //literally ALL of these should be const but you can't insert in the middle of a vector if you have const data members
    //say it with me THANK YOU CPP
    Solid * firstOfContainer;
    Index solidIndex;
    std::size_t hash=1<<solidIndex;
    RowVectorXd row;
    double constant;
    Index column;

/*
    //&@$^&$ standards people remove the ability to brace initialize when constructors are deleted, and their example doesn't work
    //"A rare, but interesting use case .... This accounts for about 50% of all breaks". THEN ITS NOT RARE &!@%^$@"
    Solid(Solid * const a, const Index b, const std::size_t c, const RowVectorXd& d, const double e, const Index f):
    firstOfContainer(a),
    solidIndex(b),
    hash(c),
    row(d),
    constant(e),
    column(f)
    {}
*/

    Index presenceIndex() const {
        return this-firstOfContainer;
    }

    friend bool operator<(const Solid& solid1, const Solid& solid2){
        return solid1.solidIndex<solid2.solidIndex;
    }
/*
    Solid(Solid&&)=default;
    Solid& operator=(Solid&&)=default;
    Solid(const Solid&)=delete;
    Solid& operator=(const Solid&)=delete;
*/
};

using SolidMatrix=Matrix<double, Dynamic, Dynamic, RowMajor, 16, Dynamic>;
using SolidVector=Matrix<double, Dynamic, 1, 0, 16, 1>;


template<typename T>
using SolidStaticVector=boost::container::static_vector<T, 16>;

template<typename Comp>
using SolidVectorHeapIndexCompare=std::priority_queue<Index, SolidStaticVector<Index>, SM_utils::IndexCompare<SolidVector, Comp, Index>>;

class SolidSystem{
    public:
        Index numPresent;
        //solid is currently small enough that random insertion is good with a vector. If solid grows, then you should want to. I'm doing it myself instead of using flat_set cause I want to use a static_vector (which I think you can do but I don't know how)
        SM_utils::flat_set<Solid, SolidStaticVector<Solid>> solidsPresent;
        SM_utils::flat_set<Solid, SolidStaticVector<Solid>> solidsNotPresent;
        const Index size;
        const Index cols;
        std::unordered_set<std::size_t> combinationsHash;
        std::size_t currentCombinationHash;

        Tableau<SolidMatrix, SolidVector> notPresentTableau;

    private:
        template<bool adding>
        std::reference_wrapper<Solid> addOrRemove(Solid& solidBeingChanged){
            auto& addingToContainer=adding ? solidsPresent : solidsNotPresent;
            auto& removingFromContainer=!adding ? solidsPresent : solidsNotPresent;

            const Index fromRow=solidBeingChanged.presenceIndex();
            const Index toRow=std::distance(addingToContainer.begin(), std::lower_bound(addingToContainer.begin(), addingToContainer.end(), solidBeingChanged));
            addingToContainer.insert(solidBeingChanged);
            addingToContainer[toRow].firstOfContainer=addingToContainer.data();
            removingFromContainer.erase(solidBeingChanged); //invalidates solidBeingChanged
            if(adding){
                ++numPresent;
                removeRow(notPresentTableau.coeffecients, fromRow);
                removeRow(notPresentTableau.constants, fromRow);
            } else {
                --numPresent;
                addRow(notPresentTableau.coeffecients, toRow);
                addRow(notPresentTableau.constants, toRow);
                notPresentTableau.coeffecients.row(toRow)=addingToContainer[toRow].row;
                notPresentTableau.constants.coeffRef(toRow)=addingToContainer[toRow].constant;
            }
            return addingToContainer[toRow];
        }

        std::reference_wrapper<Solid> add(Solid& solidBeingChanged){
            return addOrRemove<true>(solidBeingChanged);
        }
        std::reference_wrapper<Solid> remove(Solid& solidBeingChanged){
            return addOrRemove<false>(solidBeingChanged);
        }
        std::pair<std::reference_wrapper<Solid>, std::reference_wrapper<Solid>> replace(Solid& solidToAdd, Solid& solidToRemove){
            return {add(solidToAdd), remove(solidToRemove)};
        }
        bool conditionallyAddHash(const Solid& solid){
            const std::size_t newHash=currentCombinationHash^solid.hash;
            return combinationsHash.insert(newHash).second && (currentCombinationHash=newHash, true);
        }
        bool conditionallyAddHash(const Solid& solid1, const Solid& solid2){
            const std::size_t newHash=currentCombinationHash^solid1.hash^solid2.hash;
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
        
        std::optional<std::pair<std::reference_wrapper<Solid>, std::reference_wrapper<Solid>>> conditionallyReplace(Solid& solidToForm, Solid& solidToRemove){
            if(conditionallyAddHash(solidToForm, solidToRemove)){
                return replace(solidToForm, solidToRemove);
            } else {
                return std::nullopt;
            }
        }
        
        SolidVector calculateSolidAmts(const RowVectorXd& leftOvers, const auto& solidColumns) const{
            SolidMatrix solidAmtEqns(solidColumns.size(), numPresent);
            for(const Solid& solid : solidsPresent){
                solidAmtEqns.col(solid.presenceIndex())=solid.row(solidColumns).transpose();
            }
            const SolidVector solidAmtLeftOver=leftOvers.transpose()(solidColumns);
            return solidAmtEqns.partialPivLu().solve(solidAmtLeftOver);
        }
        std::pair<std::optional<std::reference_wrapper<Solid>>, std::optional<std::reference_wrapper<Solid>>> possiblyRemoveSolid(const SolidVector& solidAmts){
            std::optional<std::reference_wrapper<Solid>> solidNeedsToDisolve{std::nullopt};
            //we use a heap cause we usually wont need the full sort
            for(auto indexHeap=SolidVectorHeapIndexCompare<std::greater<void>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solidAmts.rows()), {solidAmts}); 
                Index iThSolidPresent : SM_utils::ConsumingRange(indexHeap)) {
                if(solidAmts.coeff(iThSolidPresent)<0.0) [[unlikely]] {
                    //not const because if we remove the solid then we're changing it
                    Solid& solid=solidsPresent[iThSolidPresent];
                    if(auto newSolidRef=conditionallyRemove(solid); newSolidRef) [[likely]] {
                        return {newSolidRef, std::nullopt};
                    } else if(!solidNeedsToDisolve){
                        std::cout<<"WARNING: EITHER NEARLY LOOPED OR GIBBS RULE FAILED (remove)"<<std::endl;
                        solidNeedsToDisolve=solid;
                    }
                } else {
                    return {std::nullopt, solidNeedsToDisolve};
                }
            }
            return {std::nullopt, solidNeedsToDisolve};
        }
        std::pair<std::optional<std::reference_wrapper<Solid>>, std::optional<std::reference_wrapper<Solid>>> possiblyAddSolid(const SolidVector& solubilityProducts){
            std::optional<std::reference_wrapper<Solid>> solidNeedsToForm{std::nullopt};
            for(auto indexHeap=SolidVectorHeapIndexCompare<std::greater<Index>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solubilityProducts.rows()), {solubilityProducts}); //used to test remove
            //for(auto indexHeap=SolidVectorHeapIndexCompare<std::less<void>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solubilityProducts.rows()), {solubilityProducts});
                Index iThSolidNotPresent : SM_utils::ConsumingRange(indexHeap)) {

                if(solubilityProducts.coeff(iThSolidNotPresent)>1.0) [[likely]] { //the long running cases will have lots of solids being added
                    Solid& solid=solidsNotPresent[iThSolidNotPresent];
                    if(auto newSolidRef=conditionallyAdd(solid); newSolidRef) [[likely]] {
                        //conditionally add invalidated our reference 
                        return {newSolidRef, std::nullopt};
                    } else if(!solidNeedsToForm){
                        std::cout<<"WARNING: EITHER NEARLY LOOPED OR GIBBS RULE FAILED (add)"<<std::endl;
                        solidNeedsToForm=solid;
                    }
                } else {
                    //return {std::nullopt, solidNeedsToForm}; //comment out to test remove
                } 
            }
            return {std::nullopt, solidNeedsToForm};
        }
        SolidSystem(const Tableau<>& tableau, const std::unordered_set<Index> starting_solids):
            numPresent{0},
            size{tableau.rows()},
            cols{tableau.cols()},
            notPresentTableau{SolidMatrix(size-starting_solids.size(), cols), SolidVector(size-starting_solids.size())}
        {
            for(Index i=0; i<tableau.rows(); ++i){
                const bool starting=starting_solids.contains(i);
                const std::size_t hash=std::size_t(1)<<i;
                if(starting){
                    ++numPresent;
                    currentCombinationHash^=hash;
                    solidsPresent.insert({solidsPresent.data(), i, hash, tableau.coeffecients.row(i), tableau.constants.coeff(i), -1});
                } else {
                    notPresentTableau.coeffecients.row(i-numPresent)=tableau.coeffecients.row(i);
                    notPresentTableau.constants.coeffRef(i-numPresent)=tableau.constants.coeff(i);
                    solidsNotPresent.insert({solidsNotPresent.data(), i, hash, tableau.coeffecients.row(i), tableau.constants.coeff(i), -1});
                }
            }
            combinationsHash.insert(currentCombinationHash);
        }
};

class SimpleReplacementDict{
    public:
        Index numColumns;
        //which terms have been replaced out of existence
        SM_utils::flat_set<Index> columns;
        SM_utils::flat_set<Index> columnsNotReplaced;
        SM_utils::IncreasingPQ<Index> nextRowToFill;
        std::vector<Index> columnToRow;//because columns is not in order, and we always append to our replacement, this tells which column goes to which row
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
                if(std::any_of(SM_utils::NestingIterator(columnToRow, columns.begin()), SM_utils::NestingIterator(columnToRow, columns.end()), [&](Index row) { return replacement.coeffecients.coeff(row, column)!=0; })) {
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
            replacementWithoutColumns=replacement.reducedCopy(all, columnsNotReplaced);
        }

        void simplifyFromUnsimplified(){
            replacement=unsimplifiedReplacement;
            simplify();
        }

        auto createReplacedTableau(const /*TableauType*/ auto& orig) const {
            auto replaced=orig.reducedCopy(all, columnsNotReplaced);
            if(orig.rows()) [[likely]] {
                for(auto column : columns){
                    replaced.substituteRowAndCol(replacementWithoutColumns, columnToRow[column], orig, column);
                }
            }
            return replaced;
        }
        Index size() const {
            assert(static_cast<Index>(columns.size())==replacement.rows());
            return columns.size();
        }
        Index addColumn(const Index column){
            columnToRow[column]=nextRowToFill.top();
            nextRowToFill.pop();
            columns.insert(column);
            columnsNotReplaced.erase(column);
            return columnToRow[column];
        }
        void removeColumn(const Index column){
            nextRowToFill.push(columnToRow[column]);
            columns.erase(column);
            columnsNotReplaced.insert(column);
        }

        void solveForTermAndAddToRow(const auto& rowVect, const double constant, const Index term, const Index row){
            const double termPowerInverse=-1.0/rowVect.coeff(term);

            unsimplifiedReplacement.coeffecients.row(row)=termPowerInverse*rowVect.array();
            unsimplifiedReplacement.coeffecients.coeffRef(row, term)=0.0;
            unsimplifiedReplacement.constants.coeffRef(row)=pow(constant, termPowerInverse);
            replacement.coeffecients.row(row)=unsimplifiedReplacement.coeffecients.row(row);
            replacement.constants.coeffRef(row)=unsimplifiedReplacement.constants.coeff(row);
        }

        SimpleReplacementDict(const /*std::ranges::range*/ auto& columns_, const Tableau<>& replacement_):
        numColumns{replacement_.cols()},
        columnsNotReplaced{{SM_utils::CountingIterator(0), SM_utils::CountingIterator(replacement_.cols())}},
        nextRowToFill{0},
        columnToRow(numColumns),
        unsimplifiedReplacement(replacement_),
        replacement(replacement_)
        {
            for(const Index column: columns_) {
                const Index row=addColumn(column);
                solveForTermAndAddToRow(replacement_.coeffecients.row(row), replacement_.constants(row), column, row);
            }
            simplifyFromUnsimplified();
        }
};
class ReplacementDictWithSolids : public SimpleReplacementDict{
    public:
        SM_utils::flat_set<Index, SolidStaticVector<Index>> solidColumns;
        const SolidSystem& solidSystem;
        void addSolid(Solid& solid){

            //should just segfault if it can't find a row
            //Index term=*std::ranges::find_if(std::ranges::iota_view(0), [&](Index term){ return solid.row.coeff(term)!=0.0 && !columns.contains(term); });
            Index term=*std::find_if(SM_utils::CountingIterator(0), SM_utils::CountingIterator(numColumns), [&](Index term){ return solid.row.coeff(term)!=0.0 && !columns.contains(term); });
            
            Index row=addColumn(term);

            solid.column=term;
            solidColumns.insert(solid.column);

            solveForTermAndAddToRow(solid.row, solid.constant, term, row);
            
            //mostly already simplifed, just the last row, but we still have to iterate over all the columns
            simplify();
        }
        void removeSolid(Solid& solid){
            removeColumn(solid.column);

            solidColumns.erase(solid.column);

            //TODO We should probably be able to plug it back into all our equations and then resimplify, but sounds hard and I know this works
            simplifyFromUnsimplified();
        }


        ReplacementDictWithSolids(const SimpleReplacementDict& origReplacementDict, SolidSystem& solidSystem_) : 
        SimpleReplacementDict{origReplacementDict},
        solidSystem{solidSystem_}
        {
            //think of this as a reserve() call
            replacement.conservativeResize(origReplacementDict.replacement.rows()+solidSystem.size, numColumns);
            unsimplifiedReplacement.conservativeResize(origReplacementDict.replacement.rows()+solidSystem.size, numColumns);


            for(auto& solid : solidSystem_.solidsPresent) {
                addSolid(solid);
            }
            simplifyFromUnsimplified();
        }
};

std::pair<VectorXd, SolidVector> solveWithReplacement(
    const TableauWithTotal<>& tableau,
    const SimpleReplacementDict& replacementDict,
    const /*TableauType*/ auto& solids) {
    const TableauWithTotal workingTableau=replacementDict.createReplacedTableau(tableau);

    RowVectorXd currentSolution=RowVectorXd::Constant(workingTableau.cols(), 1e-5);
    for(std::size_t iter=0; iter<30; ++iter){
        const auto& [yResult, speciesConcentrations, jacobian, maxAddend]=workingTableau.evalForSolution(currentSolution);

        if(abs(yResult.array()/maxAddend.array()).maxCoeff()<1e-5) [[unlikely]] {
            return {std::move(speciesConcentrations), replacementDict.createReplacedTableau(solids).evalTerms(currentSolution)};
        }

        RowVectorXd delta=jacobian.partialPivLu().solve(yResult.transpose()).transpose();

        delta=(delta.array()<currentSolution.array()).select(delta, currentSolution*0.9);

        currentSolution-=delta;
    }
    throw POSSIBLE_ERRORS::no_converge;
}

struct Result {
    VectorXd aqueousConcentrations;
    RowVectorXd totalConcentrations;
    std::vector<Index> solidsPresent;
    VectorXd solidConcentrations;
    std::vector<Index> solidsNotPresent;
    VectorXd solidSolubilityProducts;
};

Result solve(const TableauWithTotal<>& tableau,
                SolidSystem solidSystem,
                const SimpleReplacementDict& origReplacementDict){
    //std::cout<<tableau.coeffecients<<std::endl;
    //std::cout<<tableau.constants<<std::endl;
    //std::cout<<tableau.total<<std::endl;
    VectorXd speciesConcentrations;
    SolidVector solubilityProducts;
    SolidVector solidAmts;


    ReplacementDictWithSolids replacementDict{origReplacementDict, solidSystem};

    for(;;){

        std::tie(speciesConcentrations, solubilityProducts)=solveWithReplacement(tableau, replacementDict, solidSystem.notPresentTableau);

        //std::cout<<speciesConcentrations<<std::endl<<std::endl;

        solidAmts=solidSystem.calculateSolidAmts(-tableau.eval(speciesConcentrations), replacementDict.solidColumns); 
        
        const auto [solidDisolved, solidNeedsToDisolve]=solidSystem.possiblyRemoveSolid(solidAmts);
        if(solidDisolved) [[unlikely]] {
            std::cout<<"WARNING: removing solid should happen very rarely"<<std::endl;
            replacementDict.removeSolid(solidDisolved.value());
            continue;
        }

        const auto [solidFormed, solidNeedsToForm]=solidSystem.possiblyAddSolid(solubilityProducts);
        if(solidFormed) [[likely]] {
            replacementDict.addSolid(solidFormed.value());
            continue;
        }

        
        //recovery attempts, should happen EXTREMELY rarely
        
        {
            if(solidNeedsToDisolve) [[unlikely]] {
                std::cout<<"WARNING: RECOVERING: UNTESTED"<<std::endl;
                [&, &solidNeedsToDisolve=solidNeedsToDisolve](){  
                    //yes, we do recalculate the heaps. This should run so rarely the overhead of copying it (it's on the stack so it can't be moved) unconditionally would be worse than the recalculation probably
                    for(auto indexHeap=SolidVectorHeapIndexCompare<std::less<void>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solubilityProducts.rows()), {solubilityProducts});
                        Index iThSolidNotPresent : SM_utils::ConsumingRange(indexHeap)) {
                        if(solidSystem.conditionallyReplace(solidSystem.solidsNotPresent[iThSolidNotPresent], solidNeedsToDisolve.value())){
                            return;
                        }
                    }
                    std::cout<<"failed to recover from loop or gibbs"<<std::endl;
                    std::abort();
                }();
                continue;
            }
            if(solidNeedsToForm) [[unlikely]] {
                std::cout<<"WARNING: RECOVERING: UNTESTED"<<std::endl;
                [&, &solidNeedsToForm=solidNeedsToForm](){
                    for(auto indexHeap=SolidVectorHeapIndexCompare<std::greater<void>>(SM_utils::CountingIterator(0), SM_utils::CountingIterator(solidAmts.rows()), {solidAmts});
                        Index iThSolidPresent : SM_utils::ConsumingRange(indexHeap)) {
                        if(solidSystem.conditionallyReplace(solidNeedsToForm.value(), solidSystem.solidsPresent[iThSolidPresent])){
                            return;
                        }
                    }
                    std::cout<<"failed to recover from loop or gibbs"<<std::endl;
                    std::abort();
                }();
                continue;
            }
        }
        
        
        break;
    }
    RowVectorXd calculatedTotals=static_cast<Tableau<>>(tableau).eval(speciesConcentrations);
    for(const auto& solid : solidSystem.solidsPresent){
        calculatedTotals+=solid.row*solidAmts(solid.presenceIndex());
    }
    std::vector<Index> solidsPresent;
    for(const auto& solid : solidSystem.solidsPresent){
        solidsPresent.push_back(solid.solidIndex);
    }
    std::vector<Index> solidsNotPresent;
    for(const auto& solid : solidSystem.solidsNotPresent){
        solidsNotPresent.push_back(solid.solidIndex);
    }
    return {
        speciesConcentrations, calculatedTotals,
        solidsPresent, solidAmts,
        solidsNotPresent, solubilityProducts
    };
}

int main(){
    /*
    MatrixXd tableau(14, 4);
    tableau<<
    1   , 0   , 0   , 0,
    0   , 1   , 0   , 0,
    0   , 0   , 1   , 0,
    0   , 0   , 0   , 1,
    -1  , 0   , 0   , 0,
    -1  , 1   , 0   , 0,
    1   , 0   , 1   , 0,
    2   , 0   , 1   , 0,
    0   , 1   , 1   , 0,
    1   , 1   , 1   , 0,
    0   , 2   , 1   , 0,
    -1  , 0   , 0   , 1,
    1   , 0   , 1   , 1,
    0   , 0   , 1   , 1;

    VectorXd Ks(14);
    Ks<<
    0,
    0,
    0,
    0,
    -13.997,
    -11.417,
    10.2,
    16.5,
    2.92,
    11.34,
    3.59,
    -12.2,
    11.6,
    3.0;

    Ks=pow(10, Ks.array());


    RowVectorXd totalConcentrations(4);
    //totalConcentrations<<1e-2, 5e-3, 5e-2, 4.8e-2;
    totalConcentrations<<0, 5e-3, 5e-2, 4.8e-2;
    MatrixXd replacementTableau(1, 4);
    replacementTableau<<1,0,0,0;
    VectorXd replacementConstants(1);
    replacementConstants<<1/3.47904e-07;
    std::vector<Index> replacementColumns{0};
    //replacementConstants<<5.011872336272715e-09;

    SolidMatrix solidsTableau(3, 4);
    solidsTableau<<
    0   , 1   , 1   , 0,
    0   , 0   , 1   , 1,
    0   , 1   , 2   , 1;

    SolidVector solidKs(3);
    solidKs<<
    7.46,
    8.3,
    17.09;
    solidKs=pow(10, solidKs.array());

    //auto start = std::chrono::high_resolution_clock::now();
    Result res=solve({{tableau, Ks}, totalConcentrations},
    {{solidsTableau, solidKs}, {}},
    {replacementColumns, {replacementTableau, replacementConstants}});
    //auto end = std::chrono::high_resolution_clock::now();
    //std::chrono::duration<double> diff = end-start;
    std::cout<<res.aqueousConcentrations<<std::endl<<std::endl;
    std::cout<<res.totalConcentrations<<std::endl<<std::endl;
    SM_utils::print_vect(res.solidsPresent);
    std::cout<<res.solidConcentrations<<std::endl<<std::endl;
    SM_utils::print_vect(res.solidsNotPresent);
    std::cout<<res.solidSolubilityProducts<<std::endl<<std::endl;
*/
}
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

 0.01 0.005  0.05 0.048

1 2
 0.0375636
0.00254916

0
0.0467735
*/