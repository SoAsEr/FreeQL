import { useCallback } from "react";

import memoize from "fast-memoize";
import { stringMatchAllReplace } from "../../utils/string-utils.js";

const chargeSignRegex =
  /(?<Charge>(?<ChargeSign>[+-])(?:(?:1|(?<ChargeValue>[2-9]))|(?<EndMatcher>$|[:\s])))/g;
const chargeSignSwitcher = (match) =>
  match.groups.ChargeValue + match.groups.ChargeSign;
const memoizedStringMatchAllReplace = memoize(stringMatchAllReplace);
const testifregexneeded = /[0-9][+-]/;

const chemicalNameSearch = (name, inputValue) => {
  return (
    name.toLowerCase().includes(inputValue.toLowerCase()) ||
    (name.match(testifregexneeded) &&
      memoizedStringMatchAllReplace(name, chargeSignRegex, chargeSignSwitcher)
        .toLowerCase()
        .includes(inputValue.toLowerCase()))
  );
};

export default chemicalNameSearch;
