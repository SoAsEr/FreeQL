import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import components from "./features/components/componentsSlice.js";
import loading from "./features/loadingSlice.js";
import species from "./features/species/speciesSlice.js";
import gasInput from "./features/species/gases/gasInputSlice.js";
import results from "./features/result/resultsSlice.js";

import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

const reducer=combineReducers({
  components,
  loading,
  species,
  gasInput,
  results,
});
const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
  }),
});

/*
ReactDOM.render(
  //<React.StrictMode>
    <App />,
  //</React.StrictMode>,
  document.getElementById('root')
);
*/
const rootEl = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, rootEl
);
//ReactDOM.unstable_createRoot(rootEl).render(<App />);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

