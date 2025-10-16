import React from 'react';
import './App.css';
import {RouterProvider} from "react-router-dom";
import root from "./router/Root";
function App() {
  return (
    <RouterProvider router={root}/>
  );
}

export default App;