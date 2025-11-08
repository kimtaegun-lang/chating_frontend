import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { serverPort, api } from './RootApi';
import { StompSubscription } from '@stomp/stompjs';

let stompClient: Client | null = null;
const chat = `${serverPort}/api/chat`;

export const connect = async (onConnect: () => void) => {
    // 연결 전에 토큰 갱신 (쿠키 최신화)
        await api.post('/api/refresh');
        await new Promise(resolve => setTimeout(resolve, 500));
   
    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${serverPort}/ws-chat`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
            console.log('WebSocket 연결 성공!', frame);
            onConnect();
        },
        onStompError: (frame: any) => {
            console.error('STOMP Error:', frame.body);
            console.error('STOMP Error Headers:', frame.headers);
        },
        onWebSocketClose: () => {
            console.warn('WebSocket 연결 종료');
        }
    });

    stompClient.activate();
};

export const subscribe = (roomId: number, onMessage: (message: any) => void, loginId?: string) => {
    if (!stompClient?.connected) {
        console.error("stompClient가 연결되지 않음");
        setTimeout(() => subscribe(roomId, onMessage, loginId), 1000);
        return;
    }
    
    const path = `/topic/chatroom-${roomId}`;
    try {
        const subscription = stompClient.subscribe(
            path,
            (msg: any) => {
                try {
                    const message = JSON.parse(msg.body);
                    onMessage(message);
                } catch (parseError) {
                    console.error("JSON 파싱 오류:", parseError);
                }
            },
            {
                'id': `sub-${loginId}-${roomId}`
            }
        );
        return subscription;
    } catch (e) {
        console.error("구독 중 예외 발생:", e);
        return null;
    }
};

export const sendMessage = (receiver: string, content: string, roomId: number, sender?: string) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return;
    }
    stompClient.publish({
        destination: '/app/send',
        body: JSON.stringify({
            sender: sender,
            receiver: receiver,
            content: content,
            roomId: roomId
        })
    });
};

export const deleteMessage = (roomId: number, chatId: number) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return;
    }
    stompClient.publish({
        destination: '/app/delete',
        body: JSON.stringify({
            roomId: roomId,
            chatId: chatId
        })
    });
};

export const disconnect = () => {
    if (stompClient) {
        stompClient.deactivate();
        console.log('WebSocket 연결 종료');
    }
};

export const isConnected = (): boolean => {
    return stompClient?.connected || false;
};

export const getMyChatRooms = async (pageCount:number, size:number, userId?: string) => {
    const response = await api.get(`${chat}/chatRooms`, {
        params:{
            userId,
            size,
            pageCount
        }
    });
    return response;
};

export const getConversation = async (user2: string, limit: number, chatId: number, roomId: number, user1?: string) => {
    console.log(user1, user2, limit, chatId);
    const response = await api.post(`${chat}/getConversation`, {
        user1,
        user2,
        limit,
        chatId,
        roomId
    });
    return response;
};

export const requestRandomMatch = (onMatch: (data: any) => void, userId?: string): StompSubscription | null => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return null;
    }
    
    const subscription = stompClient.subscribe(
        `/queue/match-${userId}`,
        (msg: any) => {   
            try {
                const data = JSON.parse(msg.body);     
                onMatch(data);
            } catch (error) {
                console.error('메시지 파싱 오류:', error);
            }
        }
    );
    
    setTimeout(() => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/random/match',
                body: JSON.stringify({ userId })
            });
            console.log('매칭 요청 전송 완료');
        }
    }, 100);
    
    return subscription;
};

export const cancelRandomMatch = async (userId?: string) => {
    const response = await api.post(`api/random/cancel`, { userId });
    return response;
};

export const getReceiverStatus = async (receiverId: string) => {
    console.log("Axios 헤더 확인:", api.defaults.headers.common['Authorization']);
    const response = await api.get(`${chat}/receiver-status`, {
        params: { receiverId }
    });
    return response;
};