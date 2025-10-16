import { message } from "./index";
import { useEffect, useState } from "react";
import chatService from "../service/ChatService";

const ChatComponent = () => {
    const [messages, setMessages] = useState<message[]>([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [receiver, setReceiver] = useState('user2');  // 상대방 (임시)

    useEffect(() => {
        // WebSocket 연결
        chatService.connect(() => {
            setConnected(true);
            // 연결 후 구독
            chatService.subscribe(receiver, (message: message) => {
                setMessages((prev) => [...prev, message]);
            });
        });

        return () => {
            chatService.disconnect();
        };
    }, [receiver]);

    const handleSend = () => {
        if (input.trim()) {
            chatService.sendMessage(receiver, input);
            setInput('');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>채팅</h2>
            <p>상태: {connected ? '✓ 연결됨' : '✗ 연결 중...'}</p>
            
            <div style={{
                border: '1px solid #ccc',
                height: '400px',
                overflowY: 'auto',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                        <strong>{msg.sender}</strong>: {msg.content}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지 입력..."
                    style={{ flex: 1, padding: '10px' }}
                />
                <button 
                    onClick={handleSend}
                    disabled={!connected}
                    style={{ padding: '10px 20px', cursor: connected ? 'pointer' : 'not-allowed' }}
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;