import { message } from '..';
import { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage, disconnect, getConversation, deleteMessage, getReceiverStatus, sendFile } from '../../api/ChatApi';
import { useNavigate } from "react-router-dom";
import Loading from '../../common/Loading';
import '../../css/ChatRoom.css';

const ChatRoomComponent = ({ roomId, receiver }: { roomId: number; receiver: string }) => {
    const [messages, setMessages] = useState<message[]>([]);
    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set());
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isReceiverActive, setIsReceiverActive] = useState<boolean>();
    const navigate = useNavigate();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleFileCancel = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileDownload = async (url: string, filename: string, isDownloaded: boolean) => {
        // 이미 다운로드된 파일이면 새 탭에서 열기
        if (isDownloaded) {
            window.open(url, '_blank');
            return;
        }

        // 다운로드
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            // 다운로드 완료 후 상태 업데이트
            setDownloadedFiles(prev => new Set(prev).add(url));
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
    };

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
        if (selectedFile) {
            try {
                await sendFile(receiver, selectedFile, roomId, userInfo.memId);
                handleFileCancel();
            } catch (error: any) {
                console.error('파일 전송 실패:', error);
                alert('파일 전송에 실패했습니다.');
            }
        } else if (input.trim()) {
            try {
                sendMessage(receiver, input, roomId, userInfo.memId);
                setInput('');
            } catch (error: any) {
                console.log(error.data.message);
            }
        }
    };

    useEffect(() => {
        if (!userInfo) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
            return;
        }

        getReceiverStatus(receiver).then(response => {
            setIsReceiverActive(true);
        }).catch(error => {
            console.error('회원 상태 조회 실패:', error);
        });

        connect(() => {
            subscribe(roomId, (newMessage) => {
                console.log("받은 메시지:", newMessage);

                if (newMessage.type === 'DELETE') {
                    setMessages(prev => prev.filter(msg => msg.chatId !== newMessage.chatId));
                    return;
                }

                // FILE, TEXT 타입 모두 추가
                if (newMessage.type === 'FILE' || newMessage.type === 'TEXT') {
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    const renderMessageContent = (msg: any) => {
        const isMine = msg.sender === userInfo.memId;
        const isDownloaded = downloadedFiles.has(msg.url);

        // url과 fileName이 있으면 파일로 처리 (type과 무관하게)
        const isFile = msg.url && msg.fileName;

        // 이미지 타입
        if (isFile && isImageFile(msg.fileName)) {
            return (
                <div className={`message-bubble ${isMine ? 'right' : 'left'}`}>
                    <div className="image-container">
                        <img
                            src={msg.url}
                            alt={msg.fileName}
                            className="message-image"
                            onClick={() => window.open(msg.url, '_blank')}
                        />
                    </div>
                    <div className={`message-time ${isMine ? 'right' : 'left'}`}>
                        {formatDateTime(msg.createdAt)}
                    </div>
                </div>
            );
        }

        // 파일 타입
        if (isFile) {
            return (
                <div className={`message-bubble file-bubble ${isMine ? 'right' : 'left'}`}>
                    <div className="file-info">
                        <div className="file-icon">📎</div>
                        <div className="file-details">
                            <div className="file-name">{msg.fileName}</div>
                            <div className="file-size-display">{formatFileSize(msg.fileSize || 0)}</div>
                        </div>
                        <button
                            className="file-download-btn"
                            onClick={() => handleFileDownload(msg.url, msg.fileName, isDownloaded)}
                            title={isDownloaded ? "파일 열기" : "다운로드"}
                        >
                            {isDownloaded ? '📄' : '⬇'}
                        </button>
                    </div>
                    <div className={`message-time ${isMine ? 'right' : 'left'}`}>
                        {formatDateTime(msg.createdAt)}
                    </div>
                </div>
            );
        }

        // 텍스트 타입
        return (
            <div className={`message-bubble ${isMine ? 'right' : 'left'}`}>
                <div className="message-content">{msg.content}</div>
                <div className={`message-time ${isMine ? 'right' : 'left'}`}>
                    {formatDateTime(msg.createdAt)}
                </div>
            </div>
        );
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
                {isLoading && <Loading />}
                {messages.map((msg, idx) => {
                    const isMine = msg.sender === userInfo.memId;
                    return (
                        <div
                            key={idx}
                            className={`message-wrapper ${isMine ? 'right' : 'left'}`}
                        >
                            {renderMessageContent(msg)}

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

            {selectedFile && (
                <div className="file-preview-container">
                    <div className="file-preview-content">
                        {filePreview ? (
                            <img src={filePreview} alt="preview" className="file-preview-image" />
                        ) : (
                            <div className="file-preview-info">
                                <span className="file-icon">📎</span>
                                <span className="file-name">{selectedFile.name}</span>
                                <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                            </div>
                        )}
                        <button onClick={handleFileCancel} className="file-cancel-btn">×</button>
                    </div>
                </div>
            )}

            <div className="chatroom-input-area">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={!isReceiverActive}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isReceiverActive}
                    className="chatroom-file-btn"
                    title="파일 첨부"
                >
                    📎
                </button>
                <input
                    type="text"
                    value={isReceiverActive === false ? "탈퇴한 사용자와 대화 할 수 없습니다." : input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    className="chatroom-input"
                    disabled={!isReceiverActive || selectedFile !== null}
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