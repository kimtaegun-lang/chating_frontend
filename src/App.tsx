import React, { useEffect, useState } from 'react';
import '../src/css/App.css';
import { RouterProvider } from "react-router-dom";
import root from "./router/Root";
import { connect, disconnect } from './api/ChatApi';
import Loading from './common/Loading';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const userInfo = sessionStorage.getItem("userInfo");

    if (userInfo) {
      console.log("WebSocket 연결 시작");

      connect(() => {
        console.log("WebSocket 연결 완료");
        setIsConnected(true);
      });

    } else {
      setIsConnected(true);
    }

    return () => {
      disconnect();
    };

  }, []);

  if (!isConnected) {
    return <Loading />;
  }

  return <RouterProvider router={root} />;
}

export default App;