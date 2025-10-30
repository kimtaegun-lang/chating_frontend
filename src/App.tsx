import React from 'react';
import '../src/css/App.css';
import {RouterProvider} from "react-router-dom";
import root from "./router/Root";
import { store } from './store/store';
import { Provider } from 'react-redux';
function App() {
  return (

      <Provider store={store}>
      <RouterProvider router={root} />
    </Provider>
  );
}

export default App;