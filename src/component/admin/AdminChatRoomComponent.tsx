import { message } from '..';
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, disconnect, getConversation, deleteMessage } from '../../api/ChatApi';
import { useNavigate, useParams } from "react-router-dom";
import Loading from '../../common/Loading';
import '../../css/ChatRoom.css';

const AdminChatRoomComponent = () => {
    const [messages, setMessages] = useState<message[]>([]);
    const [chatId, setChatId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const { memberId, roomId, receiver } = useParams<{ memberId: string; roomId: string; receiver: string }>();
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
    const navigate = useNavigate();

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const year = String(date.getFullYear()).slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImageFile = (filename: string): boolean => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const handleFileDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404 || response.status === 403) {
                    alert('30일이 경과하여 다운로드할 수 없습니다.');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
    };

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
        if(userInfo.role !== 'ADMIN') {
            alert('관리자만 접근 가능합니다.');
            navigate(-1);
            return;
        }

        if (!memberId || !roomId || !receiver) {
            alert('잘못된 접근입니다.');
            navigate(-1);
            return;
        }

        connect(() => {
            subscribe(Number(roomId), (newMessage) => {
                if (newMessage.type === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.chatId !== newMessage.chatId));
                    return;
                }
                
                if (newMessage.type === 'FILE' || newMessage.type === 'TEXT') {
                    setMessages(prev => [...prev, newMessage]);
                }
            }, memberId);

            getConversation(receiver, 10, chatId, Number(roomId), memberId)
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container || isLoading || chatId === 0) return;

        if (container.scrollTop === 0) {
            setIsLoading(true);
            prevScrollHeightRef.current = container.scrollHeight;

            getConversation(receiver!, 10, chatId, Number(roomId), memberId!)
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

    const renderMessageContent = (msg: any, isLeftSide: boolean) => {
        const isFile = msg.url && msg.fileName;

        // 이미지 타입
        if (isFile && isImageFile(msg.fileName)) {
            return (
                <div className={`message-bubble file-bubble ${isLeftSide ? 'left' : 'right'}`}>
                    <div className="message-sender">{msg.sender}</div>
                    <div className="image-preview-container">
                        <img
                            src={msg.url}
                            alt={msg.fileName}
                            className="message-image"
                            onClick={() => window.open(msg.url, '_blank')}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="expired-file-message">📅 30일이 경과하여 사용할 수 없습니다.</div>';
                            }}
                        />
                    </div>
                    <div className="file-info">
                        <div className="file-icon">🖼️</div>
                        <div className="file-details">
                            <div className="file-name">{msg.fileName}</div>
                            <div className="file-size-display">{formatFileSize(msg.fileSize || 0)}</div>
                        </div>
                        <button
                            className="file-download-btn"
                            onClick={() => handleFileDownload(msg.url, msg.fileName)}
                            title="다운로드"
                        >
                            ⬇️
                        </button>
                    </div>
                    <div className={`message-time ${isLeftSide ? 'left' : 'right'}`}>
                        {formatDateTime(msg.createdAt)}
                    </div>
                </div>
            );
        }

        // 파일 타입
        if (isFile) {
            return (
                <div className={`message-bubble file-bubble ${isLeftSide ? 'left' : 'right'}`}>
                    <div className="message-sender">{msg.sender}</div>
                    <div className="file-info">
                        <div className="file-icon">📎</div>
                        <div className="file-details">
                            <div className="file-name">{msg.fileName}</div>
                            <div className="file-size-display">{formatFileSize(msg.fileSize || 0)}</div>
                        </div>
                        <button
                            className="file-download-btn"
                            onClick={() => handleFileDownload(msg.url, msg.fileName)}
                            title="다운로드"
                        >
                            ⬇️
                        </button>
                    </div>
                    <div className={`message-time ${isLeftSide ? 'left' : 'right'}`}>
                        {formatDateTime(msg.createdAt)}
                    </div>
                </div>
            );
        }

        // 텍스트 타입
        return (
            <div className={`message-bubble ${isLeftSide ? 'left' : 'right'}`}>
                <div className="message-sender">{msg.sender}</div>
                <div className="message-content">{msg.content}</div>
                <div className={`message-time ${isLeftSide ? 'left' : 'right'}`}>
                    {formatDateTime(msg.createdAt)}
                </div>
            </div>
        );
    };

    return (
        <div className="chatroom-container">
            <div className="chatroom-header">
                <div className="chatroom-header-content">
                    <h2 className="chatroom-title">
                        {memberId} ↔ {receiver}
                    </h2>
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
                {isLoading && <Loading />}
                {messages.map((msg, idx) => {
                    const isLeftSide = msg.sender === memberId;
                    return (
                        <div
                            key={msg.chatId || idx}
                            className={`message-wrapper ${isLeftSide ? 'left' : 'right'}`}
                        >
                            {renderMessageContent(msg, isLeftSide)}
                            
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