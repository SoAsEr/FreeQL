import numpy as np
import copy
import io
import csv
import itertools
np.set_printoptions(precision=20)

def grouper(n, iterable, fillvalue=None):
  args = [iter(iterable)] * n
  return itertools.zip_longest(fillvalue=fillvalue, *args)


class Term:
    def __init__(self, position, power):
        self.position=position
        self.power=power
    def __str__(self):
        return "["+str(self.position)+"]^"+str(self.power)
    def __repr__(self):
        return str(self)

class Addend:
    def __init__(self, factor, terms):
        self.terms=terms
        self.factor=factor
    def eval(self, x):
        result=self.factor
        for term in self.terms:
            result*=pow(x[term.position], term.power)
        return result
    def partialDerivative(self, position):
        factor=self.factor
        terms=[]
        for term in self.terms:
            if(term.position!=position):
                terms.append(term)
            else:
                factor*=term.power
                if(term.power!=1):
                    terms.append(Term(term.position, term.power-1))
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
    def __init__(self, addends, constant):
        self.addends=[addend for addend in addends if addend.factor!=0]
        self.constant=constant

    def eval(self, x):
        result=self.constant
        for addend in self.addends:
            result+=addend.eval(x)
        return result
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
        for addend in eqn.addends:
            for term in addend.terms:
                if term.position in self.idToPos:
                    term.position=self.idToPos[term.position]
                else:
                    self.posToId[self.size]=term.position
                    self.idToPos[term.position]=self.size
                    term.position=self.size
                    self.size+=1

        self.eqns.append(eqn)

    def calcJacobian(self):
        self.jacobianeqns=[]

        for i in range(len(self.eqns)):
            self.jacobianeqns.append([])
            for j in range(len(self.eqns)):
                self.jacobianeqns[-1].append(Eqn([], 0))

        for i in range(len(self.eqns)):
            eqn=self.eqns[i]
            for addend in eqn.addends:
                for term in addend.terms:
                    self.jacobianeqns[i][term.position].addends.append(addend.partialDerivative(term.position))
    def eval(self, x):
        ret=np.zeros((self.size, 1))
        for i in range(self.size):
            ret[i]=self.eqns[i].eval(x)
        return ret

    def evalResultToDict(self, x):
        ret={}
        for pos in self.posToId:
            ret[self.posToId[pos]]=x[pos]
        return ret

    def evalJacobian(self, x):
        evaluatedJacobian=np.zeros((self.size, self.size))
        for i in range(self.size):
            for j in range(self.size):
                evaluatedJacobian[i][j]=self.jacobianeqns[i][j].eval(x)
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

        self.TotalAlkalinityFactor=int(line2[0])
        self.componentAmts=[]
        self.componentIds=[]
        for i in range(int(line2[1])):
            self.componentAmts.append(float(line2[i*2+2]))
            self.componentIds.append(int(line2[i*2+3]))

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
        speciesDict[int(rowGroup[0][0])]=Species(rowGroup[0], rowGroup[1], rowGroup[2])

def componentCSVStringToDatabase(componentCSVString):
    for row in csv.reader(io.StringIO(componentCSVString)):
        if(row[0]):
            componentDict[int(row[0])]=Component(row)


def solutionFromPiecedTableau(tableau, horizontalLables, verticalLables, alkEqn, alk):
    #print(tableau)
    #print(horizontalLables)
    #print(verticalLables)
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

            horizontalEqns.append(Eqn([Addend(pow(10, speciesDict[int(verticalLables[i][1:])].logK)*fixedReplace, terms)], 0)) #K*[component]^n*[compoenent]^n
        elif(verticalLables[i][0]=="c"):
            horizontalEqns.append(Eqn([Addend(fixedReplace, terms)], 0))

    #print("horiz", horizontalEqns)

    if(alk is None):
        verticalEqns=[Eqn([], -tableau[-1][j]) for j in range(len(horizontalLables))]
        #print("vert 1", verticalEqns)
        for j in range(len(horizontalLables)):
            for i in range(len(verticalLables)-1):
                if(tableau[i][j]!=0):
                    copyAddend=copy.deepcopy(horizontalEqns[i].addends[0])
                    copyAddend.factor*=tableau[i][j]
                    verticalEqns[j].addends.append(copyAddend)
    else:
        verticalEqns=[Eqn([], -tableau[-1][j]) if horizontalLables[j][0]!="a" else Eqn([], -alk) for j in range(len(horizontalLables))]
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

    #print(verticalEqns)

    #print(len(verticalEqns))

    #print("vert 2", verticalEqns)4
    totals=[]
    sys=System()
    #print(sys.eqns)
    for i in range(len(verticalEqns)):
        #print(sys.eqns)
        if(horizontalLables[i][0]!="f"):
            eqnCopy=copy.deepcopy(verticalEqns[i])
            #print("Should be raw",eqnCopy)
            sys.addEqn(eqnCopy)
            totals.append([eqnCopy.constant])

    #print(sys.eqns)
    #print(len(sys.eqns))

    #print("eqns", sys.eqns)
    #print(sys.idToPos)
    #print(horizontalLables)
    sys.calcJacobian()
    #print(sys.eqns)
    #print(sys.jacobianeqns)

    totals=np.array(totals)

    converged=False

    xn=np.full((len(horizontalLables) ,1), 1e-8)
    delta=0
    for i in range(10000):
        delta=np.linalg.solve(sys.evalJacobian(xn), sys.eval(xn))
        xn=xn-delta
        xn=np.abs(xn)
        if(np.amax(np.abs(np.divide(delta, totals)))<1e-10):
        #if(np.amax(np.abs(delta))<1e-20):
            converged=True;
            print("took", i, "iterations")
            break
    else:
        print("did not converge")
        print(delta)
        print(sys.eval(xn))
    #print(xn)
    systemSolution=sys.evalResultToDict(xn)
    #print(xn)
    #print(systemSolution)
    result={}
    for i in range(len(verticalLables)-1):
        if(verticalLables[i][0]=="c" or verticalLables[i][0]=="f"):
            result[componentDict[int(verticalLables[i][1:])].name]=horizontalEqns[i].eval(systemSolution)[0]
        else:
            result[speciesDict[int(verticalLables[i][1:])].name]=horizontalEqns[i].eval(systemSolution)[0]
    #print(result)
    return result, converged

def solutionFromWholeTableau(tableau, alkEquation=[["c330", -1], ["s3301400", 1], ["c140", 2], ["s3300020", 1], ["s3305800", 1], ["c580", 2], ["s3307700", 1], ["s3307701", 2], ["s3300900", 1], ["s303302", 1], ["s3305802", -1]], alk=None):
    strTableau=[i[1:] for i in tableau[1:]]
    for i in range(len(strTableau)):
        for j in range(len(strTableau[0])):
            strTableau[i][j]=float(strTableau[i][j])
    return solutionFromPiecedTableau(strTableau, tableau[0][1:], [i[0] for i in tableau[1:]], alkEquation, alk)

'''
solutionFromWholeTableau(
[
["", "c330","c140"],
["c330", 1, 0],
["s3300020", -1, 0],
["c140", 0, 1],
["s3301400", 1, 1],
["s3301401", 2, 1],
["Total Concentrations", 1e-3, 1e-4]
])



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

componentCSVStringToDatabase(componentCSVString)
speciesCSVStringToDatabase(speciesCSVString)
