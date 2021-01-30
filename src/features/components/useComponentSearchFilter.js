import { useCallback } from "react";

import memoize from 'fast-memoize';
import { stringMatchAllReplace } from "../../utils/string-utils.js";

const chargeSignRegex=/(?<Charge>(?<ChargeSign>[+-])(?:(?:1|(?<ChargeValue>[2-9]))|(?<EndMatcher>$|[:\s])))/g;
const chargeSignSwitcher=(match) => match.groups.ChargeValue+match.groups.ChargeSign;
const memoizedStringMatchAllReplace=memoize(stringMatchAllReplace);
const useComponentSearchFilter=(componentDB) => {
  return useCallback((componentId, inputValue) => {
    const componentName=componentDB.components.get(componentId).name;
    return componentName.toLowerCase().includes(inputValue.toLowerCase()) || memoizedStringMatchAllReplace(componentName, chargeSignRegex, chargeSignSwitcher).toLowerCase().includes(inputValue.toLowerCase());
  },[componentDB]);
};

export default useComponentSearchFilter;