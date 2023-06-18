import React, { Suspense } from "react";

import Spinner from "./reusable_components/Spinner/Animated.js";
const EquilibriumForm = React.lazy(() =>
  import("./features/EquilibriumForm/EquilibriumForm")
);

//const Equilibria = React.lazy(() => import('./features/equilibria/Equilibria.js'));
//const InputLists = React.lazy(() => import('./features/InputLists/InputLists.js'));
//const TableauTable = React.lazy(() => import('./features/species/tableau/Tableau.js'));

const FreeQL = (props) => {
  return (
    <div className="flex-grow max-w-[1400px] w-full md:px-6 lg:px-0 mx-auto min-h-0 flex">
      <Suspense
        fallback={
          <div className="flex w-full items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <EquilibriumForm />
      </Suspense>
    </div>
  );
};

export default FreeQL;
