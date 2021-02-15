import React, { Suspense } from 'react';

const FreeQL = React.lazy(() => import("./FreeQL.js"));

function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="flex-shrink-0 flex w-full py-4 px-4 bg-gray-700 text-gray-100">
        <div className="pr-4 mt-1">
          <a href={process.env.PUBLIC_URL}>
            <img src={process.env.PUBLIC_URL+"/assets/img/logo.svg"} width="65" alt="FreeQL"/>
          </a>
        </div>
        <a href={process.env.PUBLIC_URL} className="center-self sm:static sm:transform-none mr-5 text-xl">FreeQL</a>
        <div className="hidden sm:block text-lg children:text-gray-300 children:hover:text-gray-100 space-x-3">
          <a href="https://stephmorel8910.gitbook.io/freeql/" target="_blank" rel="noopener noreferrer" className="">Help</a>
          <a href="https://github.com/SoAsEr/FreeQL/blob/master/README.md" rel="noopener noreferrer" target="_blank">README</a>
          <a href="https://github.com/SoAsEr/FreeQL/" rel="noopener noreferrer" target="_blank">Github</a>
          <a href={process.env.PUBLIC_URL+"/FreeQL-Solving_Open_Systems.pdf"} rel="noopener noreferrer" target="_blank">Technical Reference</a>
        </div>
      </nav>
      <div className="flex-grow container mx-auto min-h-0">
        <Suspense fallback="">
          <FreeQL/>
        </Suspense>
      </div>
      <footer className="flex-shrink-0 flex w-full bg-gray-600 p-4 md:p-8 text-gray-100">
        <span className="mx-auto">Created by Stephane Morel</span>  
      </footer>
    </div>

  );
}

export default App;
