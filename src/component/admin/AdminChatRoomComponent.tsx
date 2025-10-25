import { message } from '..';
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, disconnect, getConversation, deleteMessage } from '../../api/ChatApi';
import { useNavigate, useParams } from "react-router-dom";
import '../../css/ChatRoom.css';

const AdminChatRoomComponent = () => {
    const [messages, setMessages] = useState<message[]>([]);
    const [connected, setConnected] = useState(false);
    const [chatId, setChatId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const { memberId, roomId, receiver } = useParams<{ memberId: string; roomId: string; receiver: string }>();
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

    // 채팅 삭제 핸들러 (관리자는 모든 메시지 삭제 가능)
    const handleDelete = async (msgChatId: number) => {
        if (window.confirm('이 메시지를 삭제하시겠습니까?')) {
            try {
                await deleteMessage(Number(roomId), msgChatId);
                setMessages(prev => prev.filter(msg => msg.chatId !== msgChatId));
                alert('메시지가 삭제되었습니다.');
            } catch (error) {
                console.error('채팅 삭제 실패:', error);
                alert('채팅 삭제에 실패했습니다.');
            }
        }
    };

    const handleBack = () => {
        navigate(`/admin/member/${memberId}/chat`);
    };

    useEffect(() => { 
        if (!memberId || !roomId || !receiver) {
            alert('잘못된 접근입니다.');
            navigate(-1);
            return;
        }

        setConnected(true);

        connect(() => {
            subscribe(memberId, Number(roomId), (newMessage) => {
                // 삭제 타입 메시지인 경우
                if (newMessage.type === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.chatId !== newMessage.chatId));
                    return;
                }
                
                // 새 메시지 추가
                if (newMessage.type === 'CREATE') {
                    setMessages(prev => [...prev, newMessage]);
                }
            });

            getConversation(memberId, receiver, 10, chatId, Number(roomId))
                .then(response => {
                    setMessages(response.data.data.content.reverse());
                    setChatId(response.data.data.currentPage);
                    setTimeout(() => scrollToBottom(), 100);
                })
                .catch(error => {
                    alert(error.response?.data || '채팅 조회 실패');
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

            getConversation(memberId!, receiver!, 10, chatId, Number(roomId))
                .then(response => {
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
                })
                .catch(error => {
                    console.error(error);
                    setIsLoading(false);
                });
        }
    };

    return (
        <div className="chatroom-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <button onClick={handleBack} className="btn btn-outline">
                    ← 돌아가기
                </button>
                <h2 className="chatroom-title">채팅 내역 조회 (관리자 모드)</h2>
            </div>
            
            <p className={`chatroom-status ${connected ? 'connected' : 'disconnected'}`}>
                {connected ? '✓ 연결됨' : '✗ 연결 중...'}
            </p>

            <div className="admin-chat-info" style={{
                padding: '12px',
                background: '#fff3cd',
                borderRadius: '6px',
                marginBottom: '12px',
                fontSize: '14px',
                color: '#856404'
            }}>
                📋 읽기 전용 모드입니다. 메시지 삭제만 가능합니다.
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="chatroom-messages"
            >
                {isLoading && (
                    <div className="chatroom-loading">로딩 중...</div>
                )}
                {messages.map((msg, idx) => {
                    const isSender = msg.sender === memberId;
                    return (
                        <div
                            key={idx}
                            className={`message-wrapper ${isSender ? 'mine' : 'other'}`}
                        >
                            <div className={`message-bubble ${isSender ? 'mine' : 'other'}`}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    {msg.sender}
                                </div>
                                {msg.content}
                                <div className={`message-time ${isSender ? 'mine' : 'other'}`}>
                                    {formatDateTime(msg.createdAt)}
                                </div>
                            </div>
                            
                            {msg.chatId && (
                                <button
                                    onClick={() => handleDelete(msg.chatId!)}
                                    className="message-delete-btn"
                                    title="삭제"
                                    style={{ background: '#dc3545' }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    );
                })}
                <div ref={messageEndRef} />
            </div>

            {/* 입력창 제거 - 읽기 전용 */}
        </div>
    );
};

export default AdminChatRoomComponent;