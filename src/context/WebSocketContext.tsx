import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connect, isConnected } from '../api/ChatApi';
import Loading from '../component/common/Loading';

interface WebSocketContextType {
    isConnected: boolean;
    isConnecting: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('WebSocketProvider 에러');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");

    useEffect(() => {
        // 로그인 안 했으면 연결 안 함
        if (!userInfo) {
            setConnected(false);
            setIsConnecting(false);
            return;
        }

        // 이미 연결되어 있으면
        if (isConnected()) {
            setConnected(true);
            setIsConnecting(false);
            return;
        }

        // WebSocket 연결 시작
        setIsConnecting(true);

        try {
            connect(() => {
                setConnected(true);
                setIsConnecting(false);
            });
            
            const timeout = setTimeout(() => {
                if (!isConnected()) {
                    setIsConnecting(false);
                }
            }, 10000); 
            
            return () => clearTimeout(timeout);
        } catch (err) {
            setIsConnecting(false);
            setConnected(false);
        }
    }, [userInfo?.memId]);

    
    // 로그인한 사용자가 연결 중일 때 로딩 화면
    if (userInfo && isConnecting) {
        return <Loading />;
    }

    return (
        <WebSocketContext.Provider 
            value={{ 
                isConnected: connected, 
                isConnecting
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};