import { message } from "./index";
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage, disconnect } from "../api/ChatApi";

const ChatRoomComponent = () => {
    const [messages, setMessages] = useState<message[]>([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const searchParams = new URLSearchParams(window.location.search);
    const receiver = searchParams.get('receiver') || '';
    const currentUserId = localStorage.getItem('memId') || "";
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setConnected(true);

        connect(() => {
            subscribe(currentUserId, (newMessage) => {
                if (newMessage.sender !== currentUserId) {
                    setMessages(prev => [...prev, newMessage]);
                }
            });
        });

        return () => {
            disconnect();
        };
    }, [receiver]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            const newMsg: message = {
                content: input,
                sender: currentUserId,
                receiver: receiver,
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, newMsg]);
            sendMessage(receiver, input);
            setInput('');
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>💬 1:1 채팅</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: connected ? '#4caf50' : '#f44336' }}>
                {connected ? '✓ 연결됨' : '✗ 연결 중...'}
            </p>

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                height: '400px',
                overflowY: 'auto',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#f7f7f7',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {messages.map((msg, idx) => {
                    const isMine = msg.sender === currentUserId;
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                justifyContent: isMine ? 'flex-end' : 'flex-start',
                                marginBottom: '10px'
                            }}
                        >
                            <div style={{
                                maxWidth: '70%',
                                padding: '10px 14px',
                                borderRadius: '18px',
                                backgroundColor: isMine ? '#4caf50' : '#e0e0e0',
                                color: isMine ? 'white' : 'black',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                wordBreak: 'break-word',
                                fontSize: '14px',
                                lineHeight: '1.4'
                            }}>
                                {msg.content}
                                <div style={{
                                    fontSize: '10px',
                                    marginTop: '5px',
                                    textAlign: 'right',
                                    color: '#555'
                                }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messageEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!connected}
                    style={{
                        padding: '12px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        cursor: connected ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatRoomComponent;
