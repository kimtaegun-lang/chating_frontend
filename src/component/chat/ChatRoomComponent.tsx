import { message } from '..';
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage, disconnect, getConversation, deleteMessage } from '../../api/ChatApi';
import { useNavigate } from "react-router-dom";
import '../../css/ChatRoom.css';

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
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
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
                deleteMessage(roomId, msgChatId);
                setMessages(prev => prev.filter(msg => msg.chatId !== msgChatId));
            } catch (error) {
                console.error('채팅 삭제 실패:', error);
                alert('채팅 삭제에 실패했습니다.');
            }
        }
    };

    const handleSend = async() => {
        if (input.trim()) {
            try {
            sendMessage(loginUserId, receiver, input, roomId);
            }
            catch(error:any)
            {
                console.log(error.data.message);
            }
            setInput('');
        }
    };

    useEffect(() => { 
        if (!loginUserId) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
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
                if (newMessage.sender !== loginUserId || newMessage.type === 'CREATE') {
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
        <div className="chatroom-container">
            <div className="chatroom-header">
                <div className="chatroom-header-content">
                    <h2 className="chatroom-title">💬 1:1 채팅</h2>
                    <p className={`chatroom-status ${connected ? 'connected' : 'disconnected'}`}>
                        {connected ? '✓ 연결됨' : '✗ 연결 중...'}
                    </p>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="chatroom-messages"
            >
                {isLoading && (
                    <div className="chatroom-loading">
                        <div className="loading-spinner"></div>
                        <span>로딩 중...</span>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMine = msg.sender === loginUserId;
                    return (
                        <div
                            key={idx}
                            className={`message-wrapper ${isMine ? 'right' : 'left'}`}
                        >
                            <div className={`message-bubble ${isMine ? 'right' : 'left'}`}>
                                <div className="message-content">{msg.content}</div>
                                <div className={`message-time ${isMine ? 'right' : 'left'}`}>
                                    {formatDateTime(msg.createdAt)}
                                </div>
                            </div>
                            
                            {isMine && msg.chatId && (
                                <button
                                    onClick={() => handleDelete(msg.chatId!)}
                                    className="message-delete-btn"
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

            <div className="chatroom-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    className="chatroom-input"
                />
                <button
                    onClick={handleSend}
                    disabled={!connected}
                    className="chatroom-send-btn"
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatRoomComponent;