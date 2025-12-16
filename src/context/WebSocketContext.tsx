import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connect, disconnect, isConnected } from '../api/ChatApi';
import Loading from '../component/common/Loading';

interface WebSocketContextType {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
        setError(null);

        try {
            connect(() => {
                console.log('WebSocket 연결 성공');
                setConnected(true);
                setIsConnecting(false);
            });
            
            const timeout = setTimeout(() => {
                if (!isConnected()) {
                    setError('연결 시간 초과');
                    setIsConnecting(false);
                }
            }, 10000); 
            
            return () => clearTimeout(timeout);
        } catch (err) {
            console.error('WebSocket 연결 실패:', err);
            setError('연결에 실패했습니다');
            setIsConnecting(false);
            setConnected(false);
        }
    }, [userInfo?.memId]);

    // 로그인한 사용자가 연결 중일 때 로딩 화면
    if (userInfo && isConnecting) {
        return <Loading />;
    }

    // 연결 실패 시 에러 화면
    if (error) {
       alert('연결에 실패했습니다.');
       window.location.reload();
    }

    return (
        <WebSocketContext.Provider 
            value={{ 
                isConnected: connected, 
                isConnecting,
                error 
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};