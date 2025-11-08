import { message } from '..';
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage, disconnect, getConversation, deleteMessage, getReceiverStatus } from '../../api/ChatApi';
import { useNavigate } from "react-router-dom";
import Loading from '../../common/Loading';
import '../../css/ChatRoom.css';

const ChatRoomComponent = ({ roomId, receiver }: { roomId: number; receiver: string }) => {
    const [messages, setMessages] = useState<message[]>([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const [isReceiverActive, setIsReceiverActive] = useState<boolean>();
    const navigate = useNavigate();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");

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

    const handleSend = async () => {
        if (input.trim()) {
            try {
                sendMessage(receiver, input, roomId, userInfo.memId);
            }
            catch (error: any) {
                console.log(error.data.message);
            }
            setInput('');
        }
    };

    useEffect(() => {
        if (!userInfo) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
            return;
        }

        getReceiverStatus(receiver).then(response => {
            const isActive = response.data;
            setIsReceiverActive(isActive);
        }).catch(error => {
            console.error('회원 상태 조회 실패:', error);
        });
        connect(() => {

            subscribe(roomId, (newMessage) => {

                // 삭제 타입 메시지인 경우
                if (newMessage.type === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.chatId !== newMessage.chatId));
                    return;
                }

                // 일반 메시지인 경우
                if (newMessage.sender !== userInfo.memId || newMessage.type === 'CREATE') {
                    setMessages(prev => [...prev, newMessage]);
                }
            }, userInfo.memId);

            getConversation(receiver, 10, chatId, roomId, userInfo.memId).then(response => {
                console.log(response.data.data);
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

            const stored = sessionStorage.getItem('userInfo');
            const sessionUser = stored ? JSON.parse(stored) : null;
            const effectiveUser = userInfo ?? sessionUser;
            getConversation(receiver, 10, chatId, roomId, effectiveUser?.memId).then(response => {
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
                </div>
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
                    const isMine = msg.sender === userInfo.memId;
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
                    value={isReceiverActive === false ? "탈퇴한 사용자와 대화 할 수 없습니다." : input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    className="chatroom-input"
                    disabled={!isReceiverActive}
                    readOnly={!isReceiverActive}
                />
                <button
                    onClick={handleSend}
                    disabled={!isReceiverActive}
                    className="chatroom-send-btn"
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatRoomComponent;