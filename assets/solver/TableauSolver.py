import numpy as np
import copy
import io
import csv
import itertools



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
    def print(*vargs):
        pass
except:
    with open("comp.vdb") as f:
        componentCSVStringToDatabase(f.read())
    with open("thermo0.vdb") as f:
        speciesCSVStringToDatabase(f.read())
    import cProfile
    import timeit


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
        thisRoundReplacedTurns=[]
        replacedAnything=False
        for term in self.terms:
            if(term.id in replaceDict):
                replacedAnything=True
                #print(factor, replaceDict[term.id].factor, term.power)
                factor*=pow(replaceDict[term.id].factor, term.power)
                for replacingTerms in replaceDict[term.id].terms:
                    thisRoundReplacedTurns.append(Term(replacingTerms.id, replacingTerms.power*term.power))
            else:
                thisRoundReplacedTurns.append(term)
        if replacedAnything:
            replacedTerms=thisRoundReplacedTurns
            totalPowerDict={}

            for term in replacedTerms:
                if(not term.id in totalPowerDict):
                    totalPowerDict[term.id]=term.power
                else:
                    totalPowerDict[term.id]+=term.power
            replacedTerms=[]
            for idPower in totalPowerDict:
                if(totalPowerDict[idPower]!=0):
                    replacedTerms.append(Term(idPower, totalPowerDict[idPower]))

            return replacedTerms, factor, True
        else:
            return self.terms, self.factor, False
    def eval(self, x, idToPos, replaceDict):
        replacedTerms, result, _=self.replace(replaceDict)
        for term in replacedTerms:
            result*=pow(x[idToPos[term.id]], term.power)
        return result
    def partialDerivative(self, id, replaceDict):
        replacedTerms, factor, _=self.replace(replaceDict)
        hitSelf=False
        terms=[]
        for term in replacedTerms:
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

    def eval(self, x, idToPos, replaceDict):
        maxAddend=0
        result=self.constant
        for addend in self.addends:
            evalAddend=addend.eval(x, idToPos, replaceDict)
            result+=evalAddend
            if(abs(evalAddend)>maxAddend):
                maxAddend=abs(evalAddend)
        return result, maxAddend
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

    def addEqn(self, eqn, replaceDict):
        #replace the eqn with the right jacobian position
        for addend in eqn.addends:
            for term in addend.terms:
                if term.id in self.idToPos or term.id in replaceDict:
                    continue
                else:
                    self.posToId[self.size]=term.id
                    self.idToPos[term.id]=self.size
                    term.position=self.size
                    self.size+=1

        self.eqns.append(eqn)

    def calcJacobian(self, replaceDict):
        self.jacobianeqns=[]

        for i in range(len(self.eqns)):
            self.jacobianeqns.append([])
            for j in range(len(self.eqns)):
                self.jacobianeqns[-1].append(Eqn([], 0))

        for i in range(len(self.eqns)):
            eqn=self.eqns[i]
            for addend in eqn.addends:
                for id in self.idToPos:
                #for term in addend.terms:
                    #id=term.id
                    if(id in replaceDict):
                        continue
                    self.jacobianeqns[i][self.idToPos[id]].addends.append(addend.partialDerivative(id, replaceDict))
    def eval(self, x, replaceDict):
        y, maxy=np.zeros((self.size, 1)), np.zeros((self.size, 1))
        for i in range(self.size):
            y[i], maxy[i]=self.eqns[i].eval(x, self.idToPos, replaceDict)
        return y, maxy

    def evalResultToDict(self, x):
        ret={}
        for pos in self.posToId:
            ret[self.posToId[pos]]=x[pos]
        return ret

    def evalJacobian(self, x, replaceDict):
        evaluatedJacobian=np.zeros((self.size, self.size))
        for i in range(self.size):
            for j in range(self.size):
                evaluatedJacobian[i][j], _=self.jacobianeqns[i][j].eval(x, self.idToPos, replaceDict)
        #print(evaluatedJacobian)
        return evaluatedJacobian

def solutionFromPiecedTableau(tableau, horizontalLables, verticalLables, solidsTableau, solidsVerticalLabels,  alkEqn, alk):
   #print(tableau)
   #print(horizontalLables)
   #print(verticalLables)
   #print(solidsTableau)
   #print(solidsVerticalLabels)
    assert verticalLables[-1]=="Total Concentrations", "your last row should be the total concentrations"
    horizontalEqns=[]
    constantReplaceDict={}
    for j in range(len(horizontalLables)):
        if(horizontalLables[j][0]=="f"):
            constantReplaceDict[horizontalLables[j]]=Addend(tableau[-1][j],[])
    for i in range(len(verticalLables)-1):
        terms=[]
        for j in range(len(horizontalLables)):
            if(tableau[i][j]!=0):
                terms.append(Term(horizontalLables[j], tableau[i][j])) #[component]^n
        if(verticalLables[i][0]=="s"):
            #print(speciesDict[int(verticalLables[i][1:])].logK)
            #print(speciesDict[int(verticalLables[i][1:])].logK)
            horizontalEqns.append(Eqn([Addend(pow(10, speciesDict[int(verticalLables[i][1:])].logK), terms)], 0)) #K*[component]^n*[compoenent]^n
        elif(verticalLables[i][0]=="c"):
            horizontalEqns.append(Eqn([Addend(1, terms)], 0))

    #print("horiz", horizontalEqns)

    solidsHorizEqns=[]

    for i in range(len(solidsVerticalLabels)):
        terms=[]
        for j in range(len(horizontalLables)):
            if(solidsTableau[i][j]!=0):
                terms.append(Term(horizontalLables[j], solidsTableau[i][j])) #[component]^n
        solidsHorizEqns.append(Eqn([Addend(pow(10, speciesDict[int(solidsVerticalLabels[i][1:])].logK), terms)], 0)) #K*[component]^n*[compoenent]^n

    solidCoeffDict={}
    for j in range(len(horizontalLables)):
        solidCoeffDict[horizontalLables[j]]=[solidsTableau[i][j] for i in range(len(solidsVerticalLabels))]
    #print("solid horiz", solidsHorizEqns)

    if(alk is None):
        verticalEqns=[Eqn([], -tableau[-1][j], id=horizontalLables[j]) for j in range(len(horizontalLables))]
        #print("vert 1", verticalEqns)
        for j in range(len(horizontalLables)):
            for i in range(len(verticalLables)-1):
                if(tableau[i][j]!=0):
                    copyAddend=horizontalEqns[i].addends[0]
                    copyAddend.factor*=tableau[i][j]
                    verticalEqns[j].addends.append(copyAddend)
    else:
        verticalEqns=[Eqn([], -tableau[-1][j], id=horizontalLables[j]) if horizontalLables[j][0]!="a" else Eqn([], -alk, id="Alk") for j in range(len(horizontalLables))]
        for j in range(len(horizontalLables)):
            if(horizontalLables[j][0]!="a"):
                for i in range(len(verticalLables)-1):
                    if(tableau[i][j]!=0):
                        copyAddend=horizontalEqns[i].addends[0]
                        copyAddend.factor*=tableau[i][j]
                        verticalEqns[j].addends.append(copyAddend)
            else:
                for i in range(len(verticalLables)-1):
                    for pair in alkEqn:
                        if(pair[0]==verticalLables[i]):
                            copyAddend=horizontalEqns[i].addends[0]
                            copyAddend.factor*=pair[1]
                            #print(pair, verticalLables[i], copyAddend)
                            verticalEqns[j].addends.append(copyAddend)
                            break

    #print()

    #print("vert", verticalEqns)

    #print(len(verticalEqns))

    #print("vert 2", verticalEqns)4
    solidsPresentHash=0
    solidsCalcDict={}
    solidsPresent=[]
    solidsCorrect=False

    #print(sys.eqns)
    baseEqns={}
    for i in range(len(verticalEqns)):
        #print(sys.eqns)
        if(horizontalLables[i][0]!="f"):
            #print("Should be raw",eqnCopy)
            baseEqns[verticalEqns[i].id]=verticalEqns[i]

    #printNoMatter(constantReplaceDict)
    while(True):
        replaceDict=copy.copy(constantReplaceDict)
        currentEqnsSet=copy.deepcopy(baseEqns)
        for i in solidsPresent:
            replacing=0
           #print(replaceDict)
            for j, term in enumerate(solidsHorizEqns[i].addends[0].terms):
                #print(term)
                if term.id in constantReplaceDict:
                    continue
                if term.id not in replaceDict:
                    replacing=j
                    break
            addend=Addend(pow(solidsHorizEqns[i].addends[0].factor, -1/solidsHorizEqns[i].addends[0].terms[replacing].power), [])
            for j, term in enumerate(solidsHorizEqns[i].addends[0].terms):
                if(j==replacing):
                    continue
                addend.terms.append(Term(term.id, -term.power/solidsHorizEqns[i].addends[0].terms[replacing].power))
            replaceDict[solidsHorizEqns[i].addends[0].terms[replacing].id]=addend
           #print(replaceDict)
            subtrahendEqn=baseEqns[solidsHorizEqns[i].addends[0].terms[replacing].id]
            #print(currentEqnsSet)
            for term in addend.terms:
                if(term.id in constantReplaceDict):
                    continue
                eqn=currentEqnsSet[term.id]
                subtrahendAppend=[]
                for addend in subtrahendEqn.addends:
                    addend.factor*=term.power #shortcut to stochiometric coeffecient
                    subtrahendAppend.append(addend)
                #print("current addends", eqn.addends)
                #print("what we're subtracting", subtrahendAppend)
                eqn.addends+=subtrahendAppend
                eqn.constant-=subtrahendEqn.constant
            #print(currentEqnsSet)
       #print("replaceDict", replaceDict)
        replaceMade=True
        preReplaceDict=copy.copy(replaceDict)
        while(replaceMade):
            replaceMade=False
            for component in replaceDict:
                terms, factor, success=replaceDict[component].replace(preReplaceDict)
                replaceMade=replaceMade or success
                if(success):
                    #print("hhhhh")
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

        sys=System()
        for eqnid in currentEqnsSet:
            eqn=currentEqnsSet[eqnid]
            if(eqnid in replaceDict):
                continue
            sys.addEqn(eqn, replaceDict)
       #print("eqns", sys.eqns)
        if(len(sys.eqns)>0):
            sys.calcJacobian(replaceDict)

            #print("jacs", sys.jacobianeqns)
            converged=False

           #print(sys.idToPos)
            #xn=np.array([[pow(10, -9.91)], [pow(10, -3.91)]]+[[1e-7] for i in range(2, len(sys.eqns))])
            xn=np.full((len(sys.eqns), 1), 1e-5)
            #print(xn)
            delta=0
            xnOld=None
            for i in range(30):
                #print("xn",xn)
                y, maxy=sys.eval(xn, replaceDict)
                #print("y",y)
                jacEval=sys.evalJacobian(xn, replaceDict)
                #print("jac", jacEval)
                delta=np.linalg.solve(jacEval, y)
                #print("delta", delta)
                #print("delta", delta)
                xnOld=xn
                xn=xn-delta;
                #print("maxy",maxy)
                #print("divide", np.divide(y, maxy))
                for term, termOld in zip(xn, xnOld):
                    if(term[0]<=0):
                        term[0]=termOld[0]/10
                    elif(term[0] > 60):
                        term[0]=(540+termOld[0])/10

                #print("xn", xn);

                if(np.amax(np.abs(np.divide(y, maxy)))<1e-5):
                    converged=True;
                    #print("took", i, "iterations")
                    #print(xn)
                    #print(sys.eval(xn, replaceDict))
                    #print(sys.posToId)
                    #print(sys.eval([pow(10, -3.16), pow(10, -3.36), pow(10, -10.41)], replaceDict))
                    break
            else:
                pass
               #print("did not converge")
               #print(delta)
               #print(sys.eval(xn, replaceDict))
               #print(xn)
               #print(sys.posToId)

       #print("PRESENT",solidsPresentHash)
        solidsCalcDict[solidsPresentHash]=True

        solidAmtEqnDict={}
       #print(replaceDict)
       #print(constantReplaceDict)
        for component in replaceDict:
            if(component in constantReplaceDict):
                continue
           #print(component)
            solidAmtEqnDict[component]=[solidCoeffDict[component][i] for i in solidsPresent]
        solidCoeffs=np.zeros((len(solidsPresent), len(solidsPresent)))
        solidAmts=np.zeros((len(solidsPresent), 1))
        for i, component in enumerate(solidAmtEqnDict):
           #print(baseEqns[component])
            solidAmts[i]=-baseEqns[component].eval(xn, sys.idToPos, replaceDict)[0]
            for j in range(len(solidsPresent)):
                solidCoeffs[i][j]=solidAmtEqnDict[component][j]
       #print(solidsVerticalLabels)
       #print(solidsPresent)
       #print(solidAmtEqnDict)
       #print(solidCoeffs)
       #print(solidAmts)
        solidAmtResults=np.linalg.solve(solidCoeffs, solidAmts)
        solidAmtResults=sorted([(a, solidsPresent[i]) for i, a in enumerate(solidAmtResults)])
       #print("solids could disolve sorted:", solidAmtResults)
        removedSolid=False
        solidNeedsToDisolve=False
        for amt, i in solidAmtResults:
            if(amt<0):
                newHash=solidsPresentHash^(1<<i)
               #print(newHash)
               #print(solidsCalcDict)
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
            gibbsRuleMatrix=[solidsTableau[i] for i in solidsPresent]
            addedSolid=False
            solidNeedsToForm=False
            solubilityProductResult=sorted([(solidsHorizEqns[i].eval(xn, sys.idToPos, replaceDict)[0], i) for i in range(len(solidsVerticalLabels)) if not i in solidsPresent], reverse=False)
           #print("solubility product result sorted",solubilityProductResult)
            for amt, i in solubilityProductResult:
               #print(solidsHorizEqns[i])
               #print("SOLIDS",solidsHorizEqns[i].eval(xn, sys.idToPos, replaceDict)[0])
                if(amt>=1):
                    newHash=solidsPresentHash^(1<<i)
                   #print(newHash)
                   #print(solidsCalcDict)
                   #print(solidsHorizEqns)
                    tempGibbsRuleMatrix=copy.copy(gibbsRuleMatrix)
                    tempGibbsRuleMatrix.append(solidsTableau[i])
                    tempGibbsRuleMatrix=np.array(tempGibbsRuleMatrix)
                    if(newHash in solidsCalcDict or np.linalg.matrix_rank(tempGibbsRuleMatrix)<len(tempGibbsRuleMatrix)):
                        solidNeedsToForm=(True, i)
                       #print()
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
                #print(xn)
                #print(systemSolution)
                if(solidNeedsToDisolve):
                   #print("We got cornered backtracking")
                    gibbsRuleMatrixCopyCopy=[solidsTableau[i] for i in solidsPresent if not i == solidNeedsToDisolve[1]]
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
                    for (amt, i) in solubilityProductResult:
                        gibbsRuleMatrixCopyCopy=[solidsTableau[j] for j in solidsPresent if not j == solidNeedsToForm[1]]
                        tempGibbsRuleMatrix=copy.copy(gibbsRuleMatrixCopyCopy)
                        tempGibbsRuleMatrix.append(solidsTableau[i])
                        tempGibbsRuleMatrix=np.array(tempGibbsRuleMatrix)
                        newHash=solidsPresentHash^(1<<i)^(1<<solidNeedsToForm[1])
                        if(not newHash in solidsCalcDict and np.linalg.matrix_rank(tempGibbsRuleMatrix)==len(tempGibbsRuleMatrix)):
                            solidsPresent.remove(solidNeedsToDisolve[1])
                            solidsPresent.append(i)
                            break
                else:
                    result={}
                    #print("horiz", horizontalEqns)
                    for i in range(len(verticalLables)-1):
                        res, _=horizontalEqns[i].eval(xn, sys.idToPos, replaceDict)
                       #print(res)
                        if(verticalLables[i][0]=="c" or verticalLables[i][0]=="f"):
                            result[componentDict[int(verticalLables[i][1:])].name]=float(res)
                        else:
                            result[speciesDict[int(verticalLables[i][1:])].name]=float(res)
                    for i in solidsPresent:
                        result[speciesDict[int(solidsVerticalLabels[i][1:])].name]=1
                    #print(result)
                    return result, converged
   #print("outa here")

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
'''

'''
solutionFromWholeTableau([
[""        , "f330", "c460", "c140", "c150"],
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
["Total Concentrations", pow(10, -10.3), "5.0000e-3", "5.0000e-3", "5.0000e-3"]
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
