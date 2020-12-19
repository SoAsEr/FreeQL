import React from "react";

import is_number from "is-number";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import TooltipButton from "../../reusable_components/TooltipButton";
import { getComponentsConc } from "../components/componentsSlice";
import { calculateNewResult, getCurrentContext } from "./resultsSlice";
import { getComponentToGases, getErroredGases, getGasReplacements, getPartialPressures } from "../species/gases/gasInputSlice";
import ReduxSuspense from "../../utils/ReduxSuspense";

const message=createSelector(
  [getErroredGases, getGasReplacements, getComponentsConc, getComponentToGases, getPartialPressures],
  (erroredGases, gasReplacements, componentsConc, componentToGases, partialPressures) => { 
    if (erroredGases.size>0) {
      return "Two gases are replacing the same component";
    } else if (gasReplacements.some(val => !val)) {
      return "You have not selected a replacement for at least one gas";
    } else if(componentsConc.deleteAll(componentToGases.keys()).some(conc => !is_number(conc))) {
      return "At least one component is empty or invalid";
    } else if(partialPressures.some(partialPressure => !is_number(partialPressure))) {
      return "At least one gas's partial pressure is empty or invalid";
    } else {
      return false;
    }
  }
);


const DisabledCalculateButton=React.memo(({disableMessage, ...otherProps}) => {
  return (
    <TooltipButton 
      disabled
      disableMessage={disableMessage} 
      children={"Calculate"} 
      {...otherProps} 
    />
  )
  
})
const EnabledCalculateButton=React.memo(({onClick, ...otherProps}) => {
  const dispatch=useDispatch()
  const context=useSelector(getCurrentContext);

  return (
    <TooltipButton 
      onClick={(e) => {
        onClick(e);
        dispatch(calculateNewResult(context))
      }} 
      children={"Calculate"} 
      {...otherProps} 
    />
  )
})


const CalculateButtonInternal=React.memo(({onClick, ...otherProps}) => {
  const disableMessage=useSelector(message);
  if(!!disableMessage){
    return(
      <DisabledCalculateButton {...otherProps} disableMessage={disableMessage} />
    )
  } else {
    return (
      <EnabledCalculateButton onClick={onClick} {...otherProps} />
    );
  }
});

const CalculateButton=React.memo((props) => {
  return (
    <ReduxSuspense fallback={<DisabledCalculateButton message="Getting Database..." {...props}/>} subscribedItems={["componentDB", "speciesDB"]}>
      <ReduxSuspense fallback={<DisabledCalculateButton message="Calculating..." {...props}/>} subscribedItems={["results"]}>
        <CalculateButtonInternal {...props} />
      </ReduxSuspense>
    </ReduxSuspense>
  )
});

export default CalculateButton;