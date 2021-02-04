import React, { Suspense } from 'react';

import './App.scss';

const FreeQL = React.lazy(() => import("./FreeQL.js"));

function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="flex-shrink-0 flex flex-row w-full px-16 py-8 items-center bg-gray-600 text-gray-100">
        <div className="flex-grow sm:flex-grow-0">
          <a href={process.env.PUBLIC_URL}>
            <img src={process.env.PUBLIC_URL+"/assets/img/logo.svg"} width="65" alt="FreeQL"/>
          </a>
        </div>
        <a href={process.env.PUBLIC_URL}>FreeQL</a>
        <div className="sm:invisible flex-grow text-gray-400">
          <div className="mr-auto">
            <a href="https://stephmorel8910.gitbook.io/freeql/" target="_blank">Help</a>
            <a href="https://github.com/SoAsEr/FreeQL/blob/master/README.md" target="_blank">README</a>
            <a href="https://github.com/SoAsEr/FreeQL/" target="_blank">Github</a>
          </div>
        </div>
      </nav>
      <div className="flex-grow container mx-auto">
        <Suspense fallback="">
          <FreeQL/>
        </Suspense>
      </div>
      <footer className="flex-shrink-0 w-full bg-gray-600 p-4 md:p-5 justify-center text-gray-100">
        <p>Created by Stephane Morel</p>  
      </footer>
    </div>

  );
}

export default App;
