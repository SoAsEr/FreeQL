import React from "react";
import FreeQL from "./FreeQL.js";
import Logo from "./Logo.js";

function App() {
  return (
    <div className="w-full flex min-h-screen flex-col">
      <nav className="flex-shrink-0 flex w-full py-4 px-4 bg-gray-700 relative z-40 text-gray-100">
        <div className="pr-4 mt-1">
          <a href={process.env.PUBLIC_URL}>
            <Logo width={65} />
          </a>
        </div>
        <a
          href={process.env.PUBLIC_URL}
          className="center-self sm:static sm:transform-none mr-5 text-xl"
        >
          FreeQL
        </a>
        <div className="hidden sm:block text-lg children:text-gray-300 children:hover:text-gray-100 space-x-3">
          <a
            href="https://stephmorel8910.gitbook.io/freeql/"
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            Help
          </a>
          <a
            href="https://github.com/SoAsEr/FreeQL/blob/master/README.md"
            rel="noopener noreferrer"
            target="_blank"
          >
            README
          </a>
          <a
            href="https://github.com/SoAsEr/FreeQL/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Github
          </a>
          <a
            href={process.env.PUBLIC_URL + "/open_systems.pdf"}
            rel="noopener noreferrer"
            target="_blank"
          >
            Technical Reference
          </a>
        </div>
      </nav>
      <FreeQL />
      <footer className="flex-shrink-0 flex w-full bg-gray-700 p-2 md:p-4 text-gray-100">
        <p className="mx-auto">Created by Stephane Morel</p>
      </footer>
    </div>
  );
}

export default App;
