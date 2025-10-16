import { Client } from '@stomp/stompjs';
import { serverPort } from '../api/RootApi';

class ChatService {
    private stompClient: Client | null = null;
    
    connect(onConnect: () => void) {
        const token = localStorage.getItem('accessToken');
        console.log('1. Token:', token ? '있음' : '없음');
        console.log('2. brokerURL:', `ws://${serverPort.replace('http://', '')}/ws-chat`);
        
        this.stompClient = new Client({
            brokerURL: `ws://${serverPort.replace('http://', '')}/ws-chat`,
            reconnectDelay: 5000,
            connectHeaders: {
                'Authorization': `Bearer ${token}`
            },
            forceBinaryWSFrames: true,
            onConnect: () => {
                console.log('3. WebSocket 연결 성공!');
                onConnect();
            },
            onStompError: (frame: any) => {
                console.error('5. STOMP Error:', frame.body);
            }
        });

        this.stompClient.activate();
    }

    subscribe(receiver: string, onMessage: (message: any) => void) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.subscribe(`/user/${receiver}/queue/messages`, (msg: any) => {
                const message = JSON.parse(msg.body);
                onMessage(message);
            });
        }
    }

    sendMessage(receiver: string, content: string) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: '/app/send',
                body: JSON.stringify({
                    receiver: receiver,
                    content: content
                })
            });
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }
}

export default new ChatService();