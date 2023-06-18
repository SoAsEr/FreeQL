import React from "react";
import { subregex, supsubregex, wordRegex } from "./chemicalRegexes";

const hyphenTester = /[a-z]{2}/;
const FormattedChemicalCompound = React.memo(({ children, ...props }) => {
  const tree = [];
  for (const match of children.matchAll(supsubregex)) {
    const block = [];
    const wordMatches = Array.from(
      match.groups.WordMatcher.matchAll(wordRegex)
    );
    for (const [i, subMatch] of wordMatches.entries()) {
      const adding = subMatch[0].match(hyphenTester) ? (
        <span className="hyphens-auto">{subMatch[0]}</span>
      ) : (
        <>{subMatch[0]}</>
      );
      if (i === wordMatches.length - 1) {
        block.push(React.cloneElement(adding, { key: block.length }));
      } else {
        tree.push(
          <div className="inline-block" key={tree.length}>
            {adding}
          </div>
        );
      }
    }
    if (match.groups.SubMatcher) {
      for (const subMatch of match.groups.SubMatcher.matchAll(subregex)) {
        block.push(
          <React.Fragment key={block.length}>
            {subMatch[1]}
            <sub>{subMatch[2]}</sub>
          </React.Fragment>
        );
      }
    }
    if (match.groups.SupMatcher) {
      block.push(
        <sup key={block.length}>
          {match.groups.ChargeValue !== "1" && match.groups.ChargeValue}
          {match.groups.ChargeSign}
        </sup>
      );
    }
    tree.push(
      <React.Fragment key={tree.length}>
        <div className="inline-block">
          {block}
          {match.groups.EndBlockMatcher}
        </div>
        {match.groups.EndMatcher}
      </React.Fragment>
    );
  }
  return <span {...props}>{tree}</span>;
});
export default FormattedChemicalCompound;
