import { message } from "./index";
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage, disconnect, getConversation,  deleteMessage  } from "../api/ChatApi";
import { useNavigate } from "react-router-dom";

const ChatRoomComponent = ({ roomId, receiver }: { roomId: number; receiver: string }) => {
    const [messages, setMessages] = useState<message[]>([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [chatId, setChatId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const loginUserId = localStorage.getItem('memId') || "";
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 날짜/시간 포맷팅 함수
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const year = String(date.getFullYear()).slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    // 채팅 삭제 핸들러
    const handleDelete = async (msgChatId: number) => {
        if (window.confirm('채팅을 삭제하시겠습니까?')) {
            try {
                deleteMessage (roomId,msgChatId);
                setMessages(prev => prev.filter(msg => msg.chatId !== msgChatId));
            } catch (error) {
                console.error('채팅 삭제 실패:', error);
                alert('채팅 삭제에 실패했습니다.');
            }
        }
    };

        const handleSend = async() => {
        if (input.trim()) {
            sendMessage(loginUserId,receiver, input, roomId);
            setInput('');
        }
    };

    // 최초 로딩 시 스크롤 하단으로
    useEffect(() => {
        if (!loginUserId) {
            alert('로그인이 필요합니다.');
            navigate('../member/signIn');
            return;
        }

        setConnected(true);

        connect(() => {
            subscribe(loginUserId, roomId, (newMessage) => {
                
                // 삭제 타입 메시지인 경우
                if (newMessage.type === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.chatId !== newMessage.chatId));
                    return;
                }
                
                // 일반 메시지인 경우
                if (newMessage.sender !== loginUserId||newMessage.type==='CREATE') {
                    setMessages(prev => [...prev, newMessage]);
                }
            });

            getConversation(loginUserId, receiver, 10, chatId, roomId).then(response => {
            setMessages(response.data.data.content.reverse());
            setChatId(response.data.data.currentPage);
            setTimeout(() => scrollToBottom(), 100);
        }).catch(error => {
            alert(error.response.data);
            navigate(-1);
        });
        });

        return () => {
            disconnect();
        };
    }, []);

    // 새 메시지 도착 시 스크롤 하단으로
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container || isLoading || chatId === 0) return;

        if (container.scrollTop === 0) {
            setIsLoading(true);
            prevScrollHeightRef.current = container.scrollHeight;

            getConversation(loginUserId, receiver, 10, chatId, roomId).then(response => {
                const newMessages = response.data.data.content.reverse();
                const newChatId = response.data.data.currentPage;
                
                setMessages(prev => [...newMessages, ...prev]);
                setChatId(newChatId);
                
                setTimeout(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
                    }
                    setIsLoading(false);
                }, 100);
            }).catch(error => {
                console.error(error);
                setIsLoading(false);
            });
        }
    };


    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}> 1:1 채팅</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: connected ? '#4caf50' : '#f44336' }}>
                {connected ? '✓ 연결됨' : '✗ 연결 중...'}
            </p>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    height: '400px',
                    overflowY: 'auto',
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#f7f7f7',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                        로딩 중...
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMine = msg.sender === loginUserId;
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                justifyContent: isMine ? 'flex-start' : 'flex-end',
                                marginBottom: '10px',
                                alignItems: 'flex-start'
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
                                lineHeight: '1.4',
                                position: 'relative'
                            }}>
                                {msg.content}
                                <div style={{
                                    fontSize: '10px',
                                    marginTop: '5px',
                                    textAlign: 'right',
                                    color: isMine ? '#ddd' : '#555'
                                }}>
                                    {formatDateTime(msg.createdAt)}
                                </div>
                            </div>
                            
                            {isMine && msg.chatId && (
                                <button
                                    onClick={() => handleDelete(msg.chatId!)}
                                    style={{
                                        marginLeft: '8px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        backgroundColor: '#ff4444',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        padding: 0,
                                        lineHeight: 1
                                    }}
                                    title="삭제"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    );
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

