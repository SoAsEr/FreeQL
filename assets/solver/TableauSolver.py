import numpy as np
import copy
import io
import csv
import itertools
import cProfile


class Species:
    def __init__(self, line1, line2, line3):
        self.id=int(line1[0])
        self.name=line1[1]
        self.deltaH=float(line1[2])
        self.logK=float(line1[3])
        self.charge=float(line1[6])
        self.DebeyeHuckelA=float(line1[7])
        self.DebeyeHuckelB=float(line1[8])

        self.componentAmts=[]
        self.componentIds=[]
        for i in range(len(line2)//2):
            self.componentAmts.append(float(line2[i*2]))
            self.componentIds.append(int(line2[i*2+1]))

        molWeight=float(line3[0])


class Component:
    def __init__(self, line):
        self.id=int(line[0])
        self.name=line[1]
        self.charge=float(line[2])
        self.DebeyeHuckelA=float(line[3])
        self.DebeyeHuckelB=float(line[4])
        molWeight=float(line[5])

componentDict={}
speciesDict={}

def grouper(n, iterable, fillvalue=None):
  args = [iter(iterable)] * n
  return itertools.zip_longest(fillvalue=fillvalue, *args)

def speciesCSVStringToDatabase(speciesCSVString):
    for rowGroup in grouper(3, csv.reader(io.StringIO(speciesCSVString))):
        if(rowGroup[0][0]==0 or rowGroup[1][0]==0 or rowGroup[2][0]==0):
            continue
        #print(rowGroup[0][0])
        speciesDict[int(rowGroup[0][0])]=Species(rowGroup[0], rowGroup[1], rowGroup[2])

def componentCSVStringToDatabase(componentCSVString):
    for row in csv.reader(io.StringIO(componentCSVString)):
        if(row[0]):
            componentDict[int(row[0])]=Component(row)

try:
    componentCSVStringToDatabase(componentCSVString)
    speciesCSVStringToDatabase(speciesCSVString)
except:
    with open("comp.vdb") as f:
        componentCSVStringToDatabase(f.read())
    with open("thermo0.vdb") as f:
        speciesCSVStringToDatabase(f.read())


class Term:
    def __init__(self, id, power):
        self.id=id
        self.power=power
    def __str__(self):
        return "["+str(self.id)+"]^"+str(self.power)
    def __repr__(self):
        return str(self)

class Addend:
    def __init__(self, factor, terms):
        self.terms=terms
        self.factor=factor

    def replace(self, replaceDict):
        factor=self.factor
        replacedAnything=False
        newFactor=self.factor
        totalPowerDict={}
        for term in self.terms:
            if(term.id in replaceDict):
                replacedAnything=True
                factor*=pow(replaceDict[term.id].factor, term.power)
                for replacingTerms in replaceDict[term.id].terms:
                    if(replacingTerms.id in totalPowerDict):
                        totalPowerDict[replacingTerms.id]+=replacingTerms.power*term.power
                    else:
                        totalPowerDict[replacingTerms.id]=replacingTerms.power*term.power
            else:
                if(term.id in totalPowerDict):
                    totalPowerDict[term.id]+=term.power
                else:
                    totalPowerDict[term.id]=term.power
        if replacedAnything:
            replacedTerms=[Term(id, totalPower) for id, totalPower in totalPowerDict.items() if totalPower!=0]
            return replacedTerms, factor, True
        else:
            return self.terms, self.factor, False
    def updateReplacedTerms(self, replaceDict):
        self.replacedTerms, self.replacedFactor, _=self.replace(replaceDict)

    def eval(self, x, idToPos):
        result=self.replacedFactor
        for term in self.replacedTerms:
            result*=pow(x[idToPos[term.id]], term.power)
        return result
    def partialDerivative(self, id):
        factor=self.replacedFactor
        hitSelf=False
        terms=[]
        for term in self.replacedTerms:
            if(term.id!=id):
                terms.append(term)
            else:
                hitSelf=True
                if(term.power!=1):
                    factor*=term.power
                    terms.append(Term(term.id, term.power-1))
        if(not hitSelf):
            return Addend(0, [])
        return Addend(factor, terms)

    def __str__(self):
        ret=str(self.factor)+"*"
        for term in self.terms:
            ret+=str(term)+"*"
        ret=ret[:-1]
        return ret
    def __repr__(self):
        return str(self)

class Eqn:
    def __init__(self, addends, constant, id="N/A"):
        self.addends=[addend for addend in addends if addend.factor!=0]
        self.constant=constant
        self.id=id

    def evalWithMax(self, x, idToPos):
        maxAddend=0
        result=self.constant
        for addend in self.addends:
            evalAddend=addend.eval(x, idToPos)
            result+=evalAddend
            if(abs(evalAddend)>maxAddend):
                maxAddend=abs(evalAddend)
        return result, maxAddend

    def eval(self, x, idToPos):
        result=self.constant
        for addend in self.addends:
            result+=addend.eval(x, idToPos)
        return result

    def updateReplacedTerms(self, replaceDict):
        for addend in self.addends:
            addend.updateReplacedTerms(replaceDict)

    def __str__(self):
        ret=""
        for addend in self.addends:
            ret+=str(addend)+"+"
        ret+=str(self.constant)
        return ret
    def __repr__(self):
        return str(self)

class System:
    def __init__(self):
        self.idToPos={}
        self.posToId={}
        self.size=0
        self.eqns=[]
        self.jacobianeqns=[]

    def addEqn(self, eqn):
        #replace the eqn with the right jacobian position
        self.posToId[self.size]=eqn.id
        self.idToPos[eqn.id]=self.size
        self.size+=1
        self.eqns.append(eqn)

    def calcJacobian(self, replaceDict):
        self.jacobianeqns=[[Eqn([addend.partialDerivative(self.posToId[j]) for addend in eqn.addends], 0) for j in range(self.size)] for eqn in self.eqns]
        for row in self.jacobianeqns:
            for eqn in row:
                eqn.updateReplacedTerms(replaceDict)

    def evalWithMax(self, x):
        return zip(*(self.eqns[i].evalWithMax(x, self.idToPos) for i in range(self.size)))
    def eval(self, x):
        return (self.eqns[i].evalWithMax(x, self.idToPos) for i in range(self.size))

    def evalJacobian(self, x):
        return [[float(eqn.eval(x, self.idToPos)) for eqn in row] for row in self.jacobianeqns]

    def updateReplacedTerms(self, replaceDict):
        for eqn in self.eqns:
            eqn.updateReplacedTerms(replaceDict)
        for row in self.jacobianeqns:
            for eqn in row:
                eqn.updateReplacedTerms(replaceDict)

def solutionFromPiecedTableau(tableau, horizontalLabels, verticalLabels, solidsTableau, solidsVerticalLabels,  alkEqn, alk):
    #assert verticalLabels[-1]=="Total Concentrations", "your last row should be the total concentrations"
    constantReplaceDict={horizontalLabel : Addend(total,[]) for total, horizontalLabel in zip(tableau[-1], horizontalLabels) if horizontalLabel[0]=="f"}

    horizontalEqns=[]
    for verticalLabel, tableauRow in zip(verticalLabels, tableau):
        terms=[Term(horizontalLabel, tableauValue) for tableauValue, horizontalLabel in zip(tableauRow, horizontalLabels) if tableauValue!=0]
        if(verticalLabel[0]=="s"):
            horizontalEqns.append(Eqn([Addend(pow(10, speciesDict[int(verticalLabel[1:])].logK), terms)], 0)) #K*[component]^n*[compoenent]^n
        elif(verticalLabel[0]=="c"):
            horizontalEqns.append(Eqn([Addend(1, terms)], 0))

    solidsHorizEqns=[Eqn([Addend(pow(10, speciesDict[int(solidsVerticalLabel[1:])].logK), [Term(horizontalLabel, solidsTableauValue) for solidsTableauValue, horizontalLabel in zip(solidsTableauRow, horizontalLabels) if solidsTableauValue!=0])], 0) for solidsTableauRow, solidsVerticalLabel in zip(solidsTableau, solidsVerticalLabels)]
    #print("horiz", horizontalEqns)
    solidCoeffDict={horizontalLabel : solidsTableauColumn for solidsTableauColumn, horizontalLabel in zip(zip(*solidsTableau), horizontalLabels)}

    if(not alk is None):
        alkalinityAddends=[]
        for pair in alkEqn:
            if(pair[0] in verticalLabels):
                i=verticalLabels.index(pair[0])
                currentAddend=horizontalEqns[i].addends[0]
                #print(pair, verticalLabels[i], copyAddend)
                alkalinityAddends.append(Addend(currentAddend.factor*pair[1], currentAddend.terms))


    verticalEqns=[Eqn([Addend(horizontalEqn.addends[0].factor*tableauValue, horizontalEqn.addends[0].terms) for tableauValue, horizontalEqn in zip(tableauColumn, horizontalEqns) if tableauValue!=0], -tableauColumn[-1], id=horizontalLabel) if horizontalLabel[0]!="a" else Eqn(alkalinityAddends, -alk, id="Alk") for tableauColumn, horizontalLabel in zip(zip(*tableau), horizontalLabels)]

    solidsPresentHash=0
    solidsCalcDict={}
    solidsPresent=[]
    solidsCorrect=False

    baseEqns={verticalEqn.id : verticalEqn for verticalEqn in verticalEqns if verticalEqn.id[0]!="f"}

    while(True):
        replaceDict=copy.copy(constantReplaceDict)
        currentEqnsSet={eqnid : Eqn([addend for addend in eqn.addends], eqn.constant, eqn.id) for (eqnid, eqn) in baseEqns.items()} #avoids copying the terms with deepcopy

        #eliminate solids from the original equations by subtracting according to stochiometric coeffecients, and add all of the replacements to the replacement dictionary
        for i in solidsPresent:
            replacingTerm=None
            for term in solidsHorizEqns[i].addends[0].terms:
                if term.id in constantReplaceDict:
                    continue
                if term.id not in replaceDict:
                    replacingTerm=term
                    break
            addend=Addend(pow(solidsHorizEqns[i].addends[0].factor, -1/replacingTerm.power), [Term(term.id, -term.power/replacingTerm.power) for term in solidsHorizEqns[i].addends[0].terms if term.id!=replacingTerm.id])
            replaceDict[replacingTerm.id]=addend
            subtrahendEqn=baseEqns[replacingTerm.id]
            for term in addend.terms:
                #print(subtrahendEqn)
                if(term.id in constantReplaceDict):
                    continue
                eqn=currentEqnsSet[term.id]
                for addend in subtrahendEqn.addends:
                    eqn.addends.append(Addend(addend.factor*term.power, addend.terms)) #term.power is a shortcut shortcut to its stochiometric coeffecient
                eqn.constant-=subtrahendEqn.constant
        #print(currentEqnsSet)
        #print("replaceDict", replaceDict)

        #simplify replacement dictionary
        replaceMade=True
        preReplaceDict=copy.copy(replaceDict)
        while(replaceMade):
            replaceMade=False
            for component in replaceDict:
                terms, factor, success=replaceDict[component].replace(preReplaceDict) #this peels away 1 layer, allowing us to simplify
                replaceMade=replaceMade or success
                if(success):
                    print("replaced")
                    newTerms=[]
                    adjustPower=1
                    for term in terms:
                        if(term.id==component):
                            adjustPower+=-term.power
                        else:
                            newTerms.append(term)
                    factor=pow(factor, adjustPower)
                    for term in newTerms:
                        term.power*=adjustPower
                    replaceDict[component]=Addend(factor, newTerms)
        #print("replaceDict", replaceDict)
        #print(currentEqnsSet)
        sys=System()
        for eqnid, eqn in currentEqnsSet.items():
            if(eqnid in replaceDict):
                continue
            sys.addEqn(eqn)

        #print("eqns", sys.eqns)
        if(len(sys.eqns)>0):
            sys.updateReplacedTerms(replaceDict)
            sys.calcJacobian(replaceDict)

            #print("jacs", sys.jacobianeqns)

            xn=np.full((len(sys.eqns), 1), 1e-5)
            delta=0
            xnOld=None
            #newton-rhapson
            for i in range(30):
                #print("xn",xn)
                y, maxy=sys.evalWithMax(xn)
                #print("y",y)
                jacEval=sys.evalJacobian(xn)
                #print("jac", jacEval)
                delta=np.linalg.solve(jacEval, y)
                #print("delta", delta)
                xnOld=xn
                xn=xn-delta;
                #print("maxy",maxy)
                #print("divide", np.divide(y, maxy))
                for term, termOld in zip(xn, xnOld):
                    if(term[0]<=0):
                        term[0]=termOld[0]/10 #john westall's thesis
                    elif(term[0] > 60): #no concentrations above 60 are allowed. If this happens something is very wrong, but i just want to limit it
                        term[0]=(540+termOld[0])/10


                if(np.amax(np.abs(np.divide(y, maxy)))<1e-5): #John westall's thesis, but with an extra order of magnitude of precision
                    #print("took", i, "iterations")
                    #print(xn)
                    #print(y)
                    break
            else:
                print("did not converge")
                print("xn", xn)
                print("delta", delta)
                print("y",y)
                print(sys.posToId)
                return None, False
        solidsCalcDict[solidsPresentHash]=True

        removedSolid=False
        solidNeedsToDisolve=False
        solidAmtResults=[]

        if(len(solidsPresent)>0):
            #print(replaceDict)
            #print(solidsPresent)
            solidCoeffs=[]
            solidAmts=[]
            i=0
            for component in replaceDict:
                if(component in constantReplaceDict):
                    continue
                baseEqns[component].updateReplacedTerms(replaceDict)
                solidAmts.append(-baseEqns[component].eval(xn, sys.idToPos)) #get the ammount of solid missing from each component equation
                solidCoeffs.append([solidCoeffDict[component][i] for i in solidsPresent]) #order the coeffecient data in solidsPresent order so that it can be retrieved in that order later
                i+=1
            solidAmtResults=sorted([(amt, solidPresent) for amt, solidPresent in zip(np.linalg.solve(solidCoeffs, solidAmts), solidsPresent)]) #solve linear system, telling us exactly how much of the solid there is and sort the results so that we pick the most undersaturated first, so that we fix it first since we only do 1 solid at a time
            #print(solidAmtResults)
            #print("solids could disolve sorted:", solidAmtResults)

            for amt, i in solidAmtResults:
                if(amt<0):
                    #bit representation of whether or not we have tried this particular set of solids before, to prevent backtracking.
                    newHash=solidsPresentHash^(1<<i)
                    if(newHash in solidsCalcDict):
                        if(not solidNeedsToDisolve):
                            solidNeedsToDisolve=(True, i)
                        #print("stopped loop1")
                        continue
                    else:
                        #print("removing solid", speciesDict[int(solidsVerticalLabels[i][1:])].name)
                        solidsPresent.remove(i)
                        solidsPresentHash=newHash
                        removedSolid=True
                        break;
                else:
                    break
        if(not removedSolid):
            gibbsRuleMatrix=[solidsTableau[i] for i in solidsPresent] #have the main part ready so that we dont recopy it every time
            addedSolid=False
            solidNeedsToForm=False
            for solidsHorizEqn in solidsHorizEqns:
                solidsHorizEqn.updateReplacedTerms(replaceDict)
            solubilityProductResult=sorted([(solidsHorizEqn.eval(xn, sys.idToPos), i) for i, solidsHorizEqn in enumerate(solidsHorizEqns) if i not in solidsPresent], reverse=True) #store the most oversaturated first so that we take care of it first since we only do 1 solid at a time
            #print("solubility product result sorted",solubilityProductResult)
            for amt, i in solubilityProductResult:
                if(amt>=1):
                    newHash=solidsPresentHash^(1<<i)

                    #check the gibbs phase rule, making sure we're not over constraining our system.
                    #[Component1]^n1*[Component2]^m1....=K1, [Component1]^n2*[Component2]^m2....=K2
                    #if we take the log of both sides, then
                    #n1*log(Component1)+m1*log(Component2)=log(K1), n2*log(Component1)+m2*log(Component2)=log(K2)
                    #if we substitute component=log(Component), then we have a linear system.
                    #whether or not a linear system is overconstrained can be determined by if it has any rank defeciencies. https://en.wikipedia.org/wiki/Rouch%C3%A9%E2%80%93Capelli_theorem
                    #this should rarely kick in as we add in the solid which's product is most exceeded every time.
                    tempGibbsRuleMatrix=copy.copy(gibbsRuleMatrix)
                    tempGibbsRuleMatrix.append(solidsTableau[i])
                    tempGibbsRuleMatrix=np.array(tempGibbsRuleMatrix)
                    if(newHash in solidsCalcDict or np.linalg.matrix_rank(tempGibbsRuleMatrix)<len(tempGibbsRuleMatrix)):
                        solidNeedsToForm=(True, i)
                        #print("stopped loop2")
                        continue
                    else:
                        addedSolid=True
                        #print("adding solid", speciesDict[int(solidsVerticalLabels[i][1:])].name)
                        solidsPresent.append(i)
                        solidsPresentHash=newHash
                        break;
                else:
                    break;
            if(not addedSolid):
                #these two if statements kick in if we have a solid which should be disolved or created, but it has already been checked or it would violate the gibbs phase rule
                #in this case, we simply remove/add the solid and replace it the solid that would be next in line

                if(solidNeedsToDisolve):
                    #print("We got cornered backtracking")
                    gibbsRuleMatrixCopyCopy=[solidsTableau[i] for i in solidsPresent if i != solidNeedsToDisolve[1]]
                    for (amt, i) in solubilityProductResult:
                        tempGibbsRuleMatrix=copy.copy(gibbsRuleMatrixCopyCopy)
                        tempGibbsRuleMatrix.append(solidsTableau[i])
                        tempGibbsRuleMatrix=np.array(tempGibbsRuleMatrix)
                        newHash=(solidsPresentHash^(1<<i))^(1<<solidNeedsToDisolve[1])
                        if(not newHash in solidsCalcDict and np.linalg.matrix_rank(tempGibbsRuleMatrix)==len(tempGibbsRuleMatrix)):
                            #print("adding solid", speciesDict[int(solidsVerticalLabels[i][1:])].name)
                            #print("removing solid", speciesDict[int(solidsVerticalLabels[solidNeedsToDisolve[1]][1:])].name)
                            solidsPresent.remove(solidNeedsToDisolve[1])
                            solidsPresent.append(i)
                            solidsPresentHash=newHash
                            break
                    else:
                        return
                elif(solidNeedsToForm):
                    #print("We got cornered backtracking")
                    for (amt, i) in solidAmtResults:
                        newHash=solidsPresentHash^(1<<i)^(1<<solidNeedsToForm[1])
                        tempGibbsRuleMatrix=[solidsTableau[j] for j in solidsPresent if j != solidNeedsToForm[1]]
                        tempGibbsRuleMatrix.append(solidsTableau[i])
                        tempGibbsRuleMatrix=np.array(tempGibbsRuleMatrix)
                        if(not newHash in solidsCalcDict and np.linalg.matrix_rank(tempGibbsRuleMatrix)==len(tempGibbsRuleMatrix)):
                            solidsPresent.remove(solidNeedsToDisolve[1])
                            solidsPresent.append(i)
                            break
                else:
                    result={}
                    for horizontalEqn, verticalLabel in zip(horizontalEqns, verticalLabels):
                        horizontalEqn.updateReplacedTerms(replaceDict)
                        res=float(horizontalEqn.eval(xn, sys.idToPos))
                        if(verticalLabel[0]=="c" or verticalLabel[0]=="f"):
                            result[componentDict[int(verticalLabel[1:])].name]=res
                        else:
                            result[speciesDict[int(verticalLabel[1:])].name]=res
                    for amt, i in solidAmtResults:
                        result[speciesDict[int(solidsVerticalLabels[i][1:])].name]=float(amt)
                    print(result)
                    return result, True

def solutionFromWholeTableau(tableau, alkEquation=[["c330", -1], ["s3301400", 1], ["c140", 2], ["s3300020", 1], ["s3305800", 1], ["c580", 2], ["s3307700", 1], ["s3307701", 2], ["s3300900", 1], ["s303302", 1], ["s3305802", -1]], alk=None):
    strTableau=[]
    strVerticalLabels=[]
    solidsTableau=[]
    solidsVerticalLabels=[]
    for row in tableau[1:]:
        if(row[0][0]=="z"):
            solidsTableau.append([float(element) for element in row[1:]])
            solidsVerticalLabels.append(row[0])
        else:
            strTableau.append([float(element) for element in row[1:]])
            strVerticalLabels.append(row[0])

    return solutionFromPiecedTableau(strTableau, tableau[0][1:], strVerticalLabels, solidsTableau, solidsVerticalLabels, alkEquation, alk)
'''
import timeit

solutionFromWholeTableau(
[
["","c140", "c330","c150"],
["c150", 0, 0, 1 ],
["c330", 0, 1, 0],
["c140", 1, 0, 0],
["s1501401", 1, 0, 1],
["s1501400", 1, 1, 1],
["s1503300", 0, -1, 1],
["s3301400", 1, 1, 0],
["s3301401", 1, 2, 0],
["s3300020", 0, -1, 0],
["z5015001", 1, 0, 1],
["z2015000", 0, -2, 1],
["Total Concentrations", 1e-3, 0, 1e-3]
])
solutionFromWholeTableau([
[""        , "c330", "c460", "c140", "c150"],
["c330"    , "1"   , "0"   , "0"   , "0"],
["c460"    , "0"   , "1"   , "0"   , "0"],
["c140"    , "0"   , "0"   , "1"   , "0"],
["c150"    , "0"   , "0"   , "0"   , "1"],
["s3300020", "-1"  , "0"   , "0"   , "0"],
["s4603300", "-1"  , "1"   , "0"   , "0"],
["s3301400", "1"   , "0"   , "1"   , "0"],
["s3301401", "2"   , "0"   , "1"   , "0"],
["s4601400", "0"   , "1"   , "1"   , "0"],
["s4601401", "1"   , "1"   , "1"   , "0"],
["s4601402", "0"   , "2"   , "1"   , "0"],
["s1503300", "-1"  , "0"   , "0"   , "1"],
["s1501400", "1"   , "0"   , "1"   , "1"],
["s1501401", "0"   , "0"   , "1"   , "1"],
["z5046002", "0"   , "1"   , "1"   , "0"],
["z5015001", "0"   , "0"   , "1"   , "1"],
["z5015002", "0"   , "1"   , "2"   , "1"],
["Total Concentrations", 1e-2, "5.0000e-3", "5.0000e-3", "5.0000e-3"]
])
'''
'''
solutionFromWholeTableau([["", "c330"],
["c330", "1"],
["s3300020", "-1"],
["Total Concentrations", "0.0000e+0"]])
'''

#["z5015001", 1, 0, 1]
#["2015000", 1, -2, 0]


'''

solutionFromWholeTableau(
[
["", "a330","c140"],
["c330", 1, 0],
["s3300020", -1, 0],
["c140", 0, 1],
["s3301400", 1, 1],
["s3301401", 2, 1],
["Total Concentrations", 0, 1e-4]
], alk=1e-3)
'''

'''
sysSystem()
sys.addEqn(Eqn([Addend(1.0, [Term("x", 1.0)]), Addend(1.0, [Term("y", 1.0)]), Addend(1.0, [Term("z", 1.0)])], -50.0))
sys.addEqn(Eqn([Addend(3.0, [Term("x", 2.0)]), Addend(2.0, [Term("y", 1.0), Term("x", 1.0)]), Addend(3.0, [Term("z", 1.0)])], -500.0))
sys.addEqn(Eqn([Addend(50.0, [Term("x", 1.0)]), Addend(3.0, [Term("y", -1.0)]), Addend(50.0, [Term("z", 1.0)])], -10.0))
#sys.addLinear([[[3, 100], [2, 500], [3, 250]], -500])
#sys.addLinear([[[50, 250], [1, 100], [50, 500]], -10])
sys.calcJacobian()
'''
'''
solutionFromWholeTableau([
[""              , "H^+", "HCO3^-", "logK"],
["H^+"            ,  1  ,    0   ,   0   ],
["OH^-"           , -1  ,    0   ,  -14  ],
["H2CO3"          ,  1  ,    1   ,  6.3  ],
["HCO3^-"         ,  0  ,    1   ,   0   ],
["CO3^2-"         , -1  ,    1   , -10.3 ],
["Concentrations" , 1e-3   ,  1e-4  ,   ""  ]
])
'''
'''
[1e-07+0, 1e-07+0, 0.1995262314968879*[HCO3^-]^1+0, 1*[HCO3^-]^1+0, 0.0005011872336272714*[HCO3^-]^1+0]
[1e-07+-1e-07+0.1995262314968879*[HCO3^-]^1+-0.0005011872336272714*[HCO3^-]^1+0, 0.1995262314968879*[HCO3^-]^1+1*[HCO3^-]^1+0.0005011872336272714*[HCO3^-]^1+-0.0001]
{'H^+': 1e-07, 'OH^-': 1e-07, 'H2CO3': array([1.662680605314524e-05]), 'HCO3^-': array([8.333142929833052e-05]), 'CO3^2-': array([4.176464852423683e-08])}
'''


'''
[[-350.        ]
 [ 349.18367347]
 [  50.81632653]]
'''
#componentCSVStringToDatabase(componentCSVString)
#speciesCSVStringToDatabase(speciesCSVString)
