import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { serverPort, api } from './RootApi';
import { StompSubscription } from '@stomp/stompjs';

let stompClient: Client | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const chat = `${serverPort}/api/chat`;
let currentOnConnect: (() => void) | null = null;

export const connect = (onConnect: () => void) => {
    currentOnConnect = onConnect;
    
    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${serverPort}/ws-chat`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
            console.log('WebSocket 연결 성공!', frame);
            reconnectAttempts = 0;
            onConnect();
        },
        onStompError: async (frame: any) => {
            console.error('STOMP Error:', frame.body);
            console.error('STOMP Error Headers:', frame.headers);
            
            // 인증 에러인 경우 (CONNECT 실패 = 토큰 만료)
            if (frame.headers?.message?.includes('인증') || 
                frame.body?.includes('인증') ||
                frame.headers?.message?.includes('실패')) {
                
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`토큰 갱신 후 재연결 시도 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                    
                    // 재시도마다 대기 시간 증가 (1초, 2초, 3초)
                    const waitTime = reconnectAttempts * 1000;
                    console.log(`${waitTime}ms 대기 후 재시도...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    
                    await handleTokenRefreshAndReconnect();
                } else {
                    console.error('최대 재연결 시도 횟수 초과');
                    handleSessionExpired();
                }
            }
        },
        onWebSocketClose: () => {
            console.warn('WebSocket 연결 종료');
        }
    });

    stompClient.activate();
};

// 토큰 갱신 및 재연결
const handleTokenRefreshAndReconnect = async () => {
    try {
        // 기존 연결 먼저 종료
        if (stompClient) {
            stompClient.deactivate();
            console.log('기존 WebSocket 연결 종료');
        }
        
        // Refresh Token으로 새 Access Token 발급
        await api.post('/api/refresh');
        console.log('액세스 토큰 재발급 완료');
        
        console.log('쿠키 반영 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (currentOnConnect) {
            console.log('WebSocket 재연결 시도');
            connect(currentOnConnect);
        }
        
    } catch (error) {
        console.error('토큰 갱신 실패:', error);
        handleSessionExpired();
    }
};

// 세션 만료 처리
const handleSessionExpired = () => {
    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    disconnect();
    setTimeout(() => {
        window.location.href = '/member/signIn';
    }, 100);
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

// 본인 채팅방 목록 조회
export const getMyChatRooms = async (userId?: string) => {
    const response = await api.get(`${chat}/chatRooms`, {
        params: { userId }
    });
    return response;
};

// 채팅 내역 조회
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

// 랜덤 매칭 요청
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

// 매칭 취소
export const cancelRandomMatch = async (userId?: string) => {
    const response = await api.post(`api/random/cancel`, { userId });
    return response;
};

// 상대방 회원 상태 확인
export const getReceiverStatus = async (receiverId: string) => {
    const response = await api.get(`${chat}/receiver-status`, {
        params: { receiverId }
    });
    return response;
};