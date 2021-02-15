import React from "react";

const FormattedChemicalCompound=React.memo((props) => {
  /*
  WordMatcher=(.*?[^0-9\[\(])
  SubMatcher=([0-9])
  EndMatcher=([$\s])
  SupMatcher=([+-])(?:(?:1|([2-9]))|{EndMatcher})
  WholeExp={WordMatcher}(?:{EndMatcher}|{SubMatcher}{SupMatcher}?|{SupMatcher})
  (WordMatcher[0])_(SubMatcher[0])^(SupMatcher[1]SupMatcher[0])EndMatcher[0]
  That would only work with ruby where the capture groups are changed on every recursion
  */
  //https://regex101.com/r/POrbvL/4
  const regex=/(?<WordMatcher>.*?[^0-9[(\s])(?:(?<EndMatcher1>$|[:.\s])|(?<Charge1>(?<ChargeSign1>[+-])(?:(?:1|(?<ChargeValue1>[2-9]))|(?<EndMatcher2>$|[:.\s])))|(?<SubMatcher>[0-9]+)(?<Charge2>(?<ChargeSign2>[+-])(?:(?:1|(?<ChargeValue2>[2-9]))|(?<EndMatcher3>$|[:.\s])))?)(?<EndMatcher4>$|[:.\s])?/g;
  //$<WordMatcher>_($<SubMatcher>)^($<ChargeValue1>$<ChargeValue2>$<ChargeSign1>$<ChargeSign2>)$<EndMatcher1>$<EndMatcher2>$<EndMatcher3>
  return(
    <>
        {Array.from(props.children.matchAll(regex)).map((match) => {
          const chargeValue=[match.groups.ChargeValue1, match.groups.ChargeValue2].reduce((prev, curr) => curr ? curr : prev, "");
          const chargeSign=[match.groups.ChargeSign1, match.groups.ChargeSign2].reduce((prev, curr) => curr ? curr : prev, "");
          const terminator=[match.groups.EndMatcher1, match.groups.EndMatcher2, match.groups.EndMatcher3, match.groups.EndMatcher4].reduce((prev, curr) => curr ? curr : prev, "");
          return (
            <span key={props.children.substring(0, match.index)}>
              {match.groups.WordMatcher}<sub>{match.groups.SubMatcher}</sub><sup>{chargeValue}{chargeSign}</sup>{terminator}
            </span>
          );
        })
        }
    </>
  );
});
export default FormattedChemicalCompound;