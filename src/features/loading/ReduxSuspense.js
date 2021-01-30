import React, { Suspense } from "react";

import { useSelector } from "react-redux";

const ReduxSuspense=({subscribedItems, fallback, children}) => {
  const subscribedItemsStatus=useSelector(state => subscribedItems.map(item => state.loading[item]));
  if(subscribedItemsStatus.some(subscribedItem => subscribedItem==="pending")){
    return(
      fallback
    )
  } else {
    return (
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    );
  }
}

export default ReduxSuspense;