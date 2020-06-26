import numpy as np
import copy
import io
import csv
import itertools
import math
np.set_printoptions(precision=5)

def grouper(n, iterable, fillvalue=None):
  args = [iter(iterable)] * n
  return itertools.zip_longest(fillvalue=fillvalue, *args)

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
    def eval(self, x, idToPos, replaceDict):
        result=self.factor
        for term in self.terms:
            if(not term.id in replaceDict):
                result*=pow(x[idToPos[term.id]], term.power)
            else:
                result*=pow(replaceDict[term.id].eval(x, idToPos, replaceDict), term.power)
        return result
    def partialDerivative(self, id, replaceDict):
        factor=self.factor
        terms=[]
        hitSelf=False
        noReplaces=False
        replacedTerms=copy.deepcopy(self.terms)
        while(not noReplaces):
            noReplaces=True
            thisRoundReplacedTurns=[]
            for term in replacedTerms:
                if(term.id in replaceDict):
                    noReplaces=False
                    factor*=replaceDict[term.id].factor
                    for replacingTerms in replaceDict[term.id].terms:
                        thisRoundReplacedTurns.append(Term(replacingTerms.id, replacingTerms.power*term.power))
                else:
                    thisRoundReplacedTurns.append(term)
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


def solutionFromPiecedTableau(tableau, horizontalLables, verticalLables, solidsTableau, solidsVerticalLabels,  alkEqn, alk):
    print(tableau)
    print(horizontalLables)
    print(verticalLables)
    print(solidsTableau)
    print(solidsVerticalLabels)
    assert verticalLables[-1]=="Total Concentrations", "your last row should be the total concentrations"
    horizontalEqns=[]
    for i in range(len(verticalLables)-1):
        terms=[]
        fixedReplace=1
        for j in range(len(horizontalLables)):
            if(tableau[i][j]!=0):
                #print(horizontalLables[j])
                if(horizontalLables[j][0]=="f"):
                    fixedReplace*=pow(tableau[-1][j], tableau[i][j])
                else:
                    terms.append(Term(copy.copy(horizontalLables[j]), tableau[i][j])) #[component]^n
        if(verticalLables[i][0]=="s"):
            #print(speciesDict[int(verticalLables[i][1:])].logK)
            #print(speciesDict[int(verticalLables[i][1:])].logK)
            horizontalEqns.append(Eqn([Addend(pow(10, speciesDict[int(verticalLables[i][1:])].logK)*fixedReplace, terms)], 0)) #K*[component]^n*[compoenent]^n
        elif(verticalLables[i][0]=="c"):
            horizontalEqns.append(Eqn([Addend(fixedReplace, terms)], 0))

    #print("horiz", horizontalEqns)

    solidsHorizEqns=[]

    for i in range(len(solidsVerticalLabels)):
        terms=[]
        for j in range(len(horizontalLables)):
            if(solidsTableau[i][j]!=0):
                terms.append(Term(copy.copy(horizontalLables[j]), solidsTableau[i][j])) #[component]^n
        solidsHorizEqns.append(Eqn([Addend(pow(10, speciesDict[int(solidsVerticalLabels[i][1:])].logK), terms)], 0)) #K*[component]^n*[compoenent]^n

    #print("solid horiz", solidsHorizEqns)

    if(alk is None):
        verticalEqns=[Eqn([], -tableau[-1][j], id=horizontalLables[j]) for j in range(len(horizontalLables))]
        #print("vert 1", verticalEqns)
        for j in range(len(horizontalLables)):
            for i in range(len(verticalLables)-1):
                if(tableau[i][j]!=0):
                    copyAddend=copy.deepcopy(horizontalEqns[i].addends[0])
                    copyAddend.factor*=tableau[i][j]
                    verticalEqns[j].addends.append(copyAddend)
    else:
        verticalEqns=[Eqn([], -tableau[-1][j], id=horizontalLables[j]) if horizontalLables[j][0]!="a" else Eqn([], -alk, id="Alk") for j in range(len(horizontalLables))]
        for j in range(len(horizontalLables)):
            if(horizontalLables[j][0]!="a"):
                for i in range(len(verticalLables)-1):
                    if(tableau[i][j]!=0):
                        copyAddend=copy.deepcopy(horizontalEqns[i].addends[0])
                        copyAddend.factor*=tableau[i][j]
                        verticalEqns[j].addends.append(copyAddend)
            else:
                for i in range(len(verticalLables)-1):
                    for pair in alkEqn:
                        if(pair[0]==verticalLables[i]):
                            copyAddend=copy.deepcopy(horizontalEqns[i].addends[0])
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
    baseEqns=[]
    for i in range(len(verticalEqns)):
        #print(sys.eqns)
        if(horizontalLables[i][0]!="f"):
            #print("Should be raw",eqnCopy)
            baseEqns.append(verticalEqns[i])

    while(True):
        replaceDict={}
        currentEqnsSet=copy.deepcopy(baseEqns)
        for i in solidsPresent:
            replacing=0
            for j, term in enumerate(solidsHorizEqns[i].addends[0].terms):
                if term.id not in replaceDict:
                    replacing=j
                    break
            addend=Addend(1/solidsHorizEqns[i].addends[0].factor, [])
            for j, term in enumerate(solidsHorizEqns[i].addends[0].terms):
                if(j==replacing):
                    continue
                addend.terms.append(Term(term.id, -term.power/solidsHorizEqns[i].addends[0].terms[replacing].power))
            replaceDict[solidsHorizEqns[i].addends[0].terms[replacing].id]=addend
            subtrahends=None
            for eqn in baseEqns:
                if(eqn.id==solidsHorizEqns[i].addends[0].terms[replacing].id):
                    subtrahendEqn=eqn
                    break
            #print(currentEqnsSet)
            for eqn in currentEqnsSet:
                for term in addend.terms:
                    if(eqn.id==term.id):
                        subtrahendAppend=[]
                        for addend in copy.deepcopy(subtrahendEqn.addends):
                            addend.factor*=term.power*solidsHorizEqns[i].addends[0].terms[replacing].power
                            subtrahendAppend.append(addend)
                        #print("current addends", eqn.addends)
                        #print("what we're subtracting", subtrahendAppend)
                        eqn.addends+=subtrahendAppend
                        eqn.constant-=subtrahendEqn.constant
                        break
            #print(currentEqnsSet)

        #print("replaceDict", replaceDict)
        #print("solidsPresent", solidsPresent)

        sys=System()
        for eqn in currentEqnsSet:
            if(eqn.id in replaceDict):
                continue
            sys.addEqn(copy.deepcopy(eqn), replaceDict)
        #print("eqns", sys.eqns)

        sys.calcJacobian(replaceDict)

        #print("jacs", sys.jacobianeqns)
        converged=False

        #print(sys.eqns)
        #print(sys.idToPos)
        #xn=np.array([[pow(10, -9.91)], [pow(10, -3.91)]]+[[1e-7] for i in range(2, len(sys.eqns))])
        xn=np.full((len(sys.eqns), 1), 1e-7)
        #print(xn)
        delta=0
        xnOld=None
        for i in range(100):
            #print("xn",xn)
            y, maxy=sys.eval(xn, replaceDict)
            #print("y", y)
            #print("y", y)
            #print("eqns", sys.eqns)-----
            #print("jacs", sys.jacobianeqns)
            jacEval=sys.evalJacobian(xn, replaceDict)
            #print("jac", jacEval)
            delta=np.linalg.solve(jacEval, y)
            #print("delta", delta)
            #print("delta", delta)
            xnOld=xn
            xn=xn-delta;
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
            print("did not converge")
            print(delta)
            print(sys.eval(xn, replaceDict))
            print(xn)
            print(sys.posToId)

        solidsCalcDict[solidsPresentHash]=True

        for i in solidsPresent:
            if(solidsHorizEqns[i].eval(xn, sys.idToPos, replaceDict)[0]<0.99):
                newHash==solidsPresentHash^(1<<i)
                if(newHash in solidsCalcDict):
                    print("stopped loop1")
                    continue
                else:
                    solidsPresent.remove(i)
                    solidsPresentHash=newHash
                    print("removing solid")
                    break
        else:
            for i in range(len(solidsVerticalLabels)):
                if(not i in solidsPresent and solidsHorizEqns[i].eval(xn, sys.idToPos, replaceDict)[0]>=1):
                    newHash=solidsPresentHash^(1<<i)
                    print(newHash)
                    print(solidsCalcDict)
                    if(newHash in solidsCalcDict):
                        print("stopped loop2")
                        continue
                    else:
                        print("adding solid")
                        solidsPresent.append(i)
                        solidsPresentHash=newHash
                        break;
            else:
                #print("end", xn)
                #print(xn)
                #print(systemSolution)
                result={}
                #print("horiz", horizontalEqns)
                for i in range(len(verticalLables)-1):
                    res, _=horizontalEqns[i].eval(xn, sys.idToPos, replaceDict)
                    if(verticalLables[i][0]=="c" or verticalLables[i][0]=="f"):
                        result[componentDict[int(verticalLables[i][1:])].name]=-math.log10(res[0])
                    else:
                        result[speciesDict[int(verticalLables[i][1:])].name]=-math.log10(res[0])
                for i in solidsPresent:
                    result[speciesDict[int(solidsVerticalLabels[i][1:])].name]=1
                print(result)
                return result, converged


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

with open("comp.vdb") as f:
    componentCSVStringToDatabase(f.read())
with open("thermo0.vdb") as f:
    speciesCSVStringToDatabase(f.read())
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
["Total Concentrations", 1e-3, 0, 1e-3]
])

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
