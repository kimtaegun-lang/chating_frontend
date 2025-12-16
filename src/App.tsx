import React from 'react';
import '../src/css/App.css';
import { RouterProvider } from "react-router-dom";
import root from "./router/Root";
import { WebSocketProvider } from './context/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      <RouterProvider router={root} />
    </WebSocketProvider>
  );
}

export default App;