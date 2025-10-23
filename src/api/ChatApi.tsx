import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { serverPort } from './RootApi';
import { api } from './RootApi';
import { StompSubscription } from '@stomp/stompjs';
let stompClient: Client | null = null;
const chat = `${serverPort}/api/chat`;

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

export const subscribe = (loginId: string, roomId: number, onMessage: (message: any) => void) => {
    
    if (!stompClient?.connected) {
        console.error("stompClient가 연결되지 않음");
        setTimeout(() => subscribe(loginId, roomId, onMessage), 1000);
        return;
    }
    
    // 채팅방별 queue 구독
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
export const sendMessage = (sender:string,receiver: string, content: string,roomId:number) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return;
    }
    stompClient.publish({
        destination: '/app/send',
        body: JSON.stringify({
            sender:sender,
            receiver: receiver,
            content: content,
            roomId:roomId
        })
    });
};

export const deleteMessage = (roomId:number,chatId:number) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return;
    }
    stompClient.publish({
        destination: '/app/delete',
        body: JSON.stringify({
            roomId:roomId,
            chatId:chatId
        })
    });
};

export const disconnect = () => {
    if (stompClient) {
        stompClient.deactivate();
        console.log('WebSocket 연결 종료');
    }
};

// 본인 채팅방 목록 조회
export const getMyChatRooms = async(userId: string)=>{
    const response=await api.get(`${chat}/chatRooms`,{
        params:{userId}
    });
    return response;
};

// 채팅 내역 조회
export const getConversation = async(user1: string, user2: string, limit: number, chatId: number,roomId:number) => {
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

// 랜덤 매칭 요청
export const requestRandomMatch = (userId: string, onMatch: (data: any) => void): StompSubscription | null => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
        return null;
    }
    
    // 1. 먼저 매칭 결과 구독
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
    
    // 2. 구독 완료 후 매칭 요청
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

// 매칭 취소
export const cancelRandomMatch = async (userId: string) => {
    const response = await api.post(`api/random/cancel`, { userId });
    return response;
};
