import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { serverPort } from '../api/RootApi';
import { api } from './RootApi';
import { chatRoom } from '../component';
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
    console.log("=== subscribe 호출 ===");
    console.log("loginId:", loginId);
    console.log("roomId:", roomId);
    
    if (!stompClient?.connected) {
        console.error("stompClient가 연결되지 않음");
        setTimeout(() => subscribe(loginId, roomId, onMessage), 1000);
        return;
    }
    
    // ✅ 채팅방별 queue 구독
    const path = `/queue/chatroom-${roomId}`;
    console.log("구독 경로:", path);
    
    try {
        const subscription = stompClient.subscribe(
            path,
            (msg: any) => {
                console.log("=== 메시지 도착 ===");
                console.log("Raw 메시지:", msg);
                
                try {
                    const message = JSON.parse(msg.body);
                    console.log("파싱된 메시지:", message);
                    onMessage(message);
                } catch (parseError) {
                    console.error("JSON 파싱 오류:", parseError);
                }
            },
            {
                'id': `sub-${loginId}-${roomId}`
            }
        );
        
        console.log("구독 성공");
        return subscription;
    } catch (e) {
        console.error("구독 중 예외 발생:", e);
        return null;
    }
};
export const sendMessage = (receiver: string, content: string,roomId:number) => {
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
            content: content,
            roomId:roomId
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

// 본인 채팅방 목록 조회
export const getMyChatRooms = async(userId: string)=>{
    const response=await api.get(`${chat}/chatRooms`,{
        params:{userId}
    });
    return response;
};

// 채팅 내역 조회
export const getConversation = async(user1: string, user2: string, limit: number, chatId: number) => {
    console.log(user1, user2, limit, chatId);
    const response = await api.post(`${chat}/getConversation`, {
        user1,
        user2,
        limit,
        chatId
    });
    return response;
};


// 채팅방 생성 또는 조회
export const getOrCreateChatRoom = (sender: string, receiver: string)=> {
    return api.get(`/api/chatroom?sender=${sender}&receiver=${receiver}`)
        .then(response => response.data)
        .catch(error => {
            console.error('채팅방 생성/조회 실패:', error);
            throw error;
        });
};