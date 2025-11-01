import { message } from '..';
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, disconnect, getConversation, deleteMessage } from '../../api/ChatApi';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from '../../store/authSlice';
import { RootState } from '../../store/store';
import Loading from '../../common/Loading';
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
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

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

    useEffect(() => { 
     if (!user) {
                const storedUser = sessionStorage.getItem('userInfo');
                if (storedUser) {
                    dispatch(setUser(JSON.parse(storedUser)));
                }
            }

        if(user?.role !== 'ADMIN')
        {
            alert('관리자만 접근 가능합니다.');
            navigate(-1);
            return;
        }

        if (!memberId || !roomId || !receiver) {
            alert('잘못된 접근입니다.');
            navigate(-1);
            return;
        }

        setConnected(true);

        connect(() => {
            subscribe(Number(roomId), (newMessage) => {
                // 삭제 타입 메시지인 경우
                if (newMessage.type === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.chatId !== newMessage.chatId));
                    return;
                }
                
                // 새 메시지 추가
                if (newMessage.type === 'CREATE') {
                    setMessages(prev => [...prev, newMessage]);
                }
            },memberId);

            getConversation(receiver, 10, chatId, Number(roomId),memberId)
                .then(response => {
                    console.log(response.data.data.content);
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

            getConversation( receiver!, 10, chatId, Number(roomId),memberId!)
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
            <div className="chatroom-header">
                <div className="chatroom-header-content">
                    <h2 className="chatroom-title">
                        {memberId} ↔ {receiver}
                    </h2>
                    <span className={`chatroom-status ${connected ? 'connected' : 'disconnected'}`}>
                        {connected ? '● 연결됨' : '○ 연결 중...'}
                    </span>
                </div>
                <div className="admin-badge">관리자 모드</div>
            </div>

            <div className="admin-notice">
                <span className="admin-notice-icon">🔒</span>
                읽기 전용 모드 - 메시지 삭제만 가능합니다
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="chatroom-messages"
            >
                {isLoading && (
                    <Loading/>
                )}
                {messages.map((msg, idx) => {
                    // memberId가 보낸 메시지는 좌측, receiver가 보낸 메시지는 우측
                    const isLeftSide = msg.sender === memberId;
                    return (
                        <div
                            key={idx}
                            className={`message-wrapper ${isLeftSide ? 'left' : 'right'}`}
                        >
                            <div className={`message-bubble ${isLeftSide ? 'left' : 'right'}`}>
                                <div className="message-sender">
                                    {msg.sender}
                                </div>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                                <div className="message-time">
                                    {formatDateTime(msg.createdAt)}
                                </div>
                            </div>
                            
                            {msg.chatId && (
                                <button
                                    onClick={() => handleDelete(msg.chatId!)}
                                    className="message-delete-btn"
                                    title="메시지 삭제"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    );
                })}
                <div ref={messageEndRef} />
            </div>
        </div>
    );
};

export default AdminChatRoomComponent;