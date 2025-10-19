import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { serverPort } from '../api/RootApi';

let stompClient: Client | null = null;

export const connect = (onConnect: () => void) => {
    const token = localStorage.getItem('accessToken');
    
    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${serverPort}/ws-chat`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
            'Authorization': `Bearer ${token}`
        },
        onConnect: (frame) => {
            console.log('WebSocket 연결 성공!', frame);
            onConnect();
        },
        onStompError: (frame: any) => {
            console.error('STOMP Error:', frame.body);
        },
        onWebSocketClose: () => {
            console.warn('WebSocket 연결 종료');
        }
    });

    stompClient.activate();
};

export const subscribe = (loginId: string, onMessage: (message: any) => void) => {
    console.log("=== subscribe 호출 ===");
    console.log("loginId:", loginId);
    
    if (!stompClient) {
        console.error("stompClient가 null");
        return;
    }
    
    if (!stompClient.connected) {
        console.error("stompClient.connected = false");
        // 다시 시도
        setTimeout(() => subscribe(loginId, onMessage), 1000);
        return;
    }
    
    const path = `/queue/${loginId}`;
    console.log("구독 경로:", path);
    
    try {
        const subscription = stompClient.subscribe(
            path,
            (msg: any) => {
                console.log("=== 메시지 도착 ===");
                console.log("Raw 메시지:", msg);
                console.log("Body:", msg.body);
                
                try {
                    const message = JSON.parse(msg.body);
                    console.log("파싱된 메시지:", message);
                    onMessage(message);
                    console.log("콜백 실행 완료");
                } catch (parseError) {
                    console.error("JSON 파싱 오류:", parseError);
                    console.error("Body 내용:", msg.body);
                }
            },
            {
                // 에러 핸들러
                'id': `sub-${loginId}`
            }
        );
        
        console.log("구독 성공");
        return subscription;
    } catch (e) {
        console.error("구독 중 예외 발생:", e);
        return null;
    }
};

export const sendMessage = (receiver: string, content: string) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return;
    }
    
    console.log("=== 메시지 전송 ===");
    console.log("Receiver:", receiver);
    console.log("Content:", content);
    
    stompClient.publish({
        destination: '/app/send',
        body: JSON.stringify({
            receiver: receiver,
            content: content
        })
    });
    
    console.log('메시지 전송 완료');
};

export const disconnect = () => {
    if (stompClient) {
        stompClient.deactivate();
        console.log('WebSocket 연결 종료');
    }
};