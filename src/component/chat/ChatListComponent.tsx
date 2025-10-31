import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChatRooms } from '../../api/ChatApi';
import { chatRoom } from '..';
import { useSelector, useDispatch } from "react-redux";
import { setUser } from '../../store/authSlice';
import { RootState } from '../../store/store';
import '../../css/ChatList.css';

const ChatListComponent = () => {
    const [chatRooms, setChatRooms] = useState<chatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        if (!user) {
            const storedUser = sessionStorage.getItem('userInfo');
            if (storedUser) {
                dispatch(setUser(JSON.parse(storedUser)));
            }
        }

        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
            return;
        }
        
        fetchChatRooms(user?.memId);
    }, [isLoggedIn, user?.memId, navigate]);

    const fetchChatRooms = async (memId?: string) => {
        getMyChatRooms(memId ?? user?.memId)
            .then((response) => {
                console.log(response.data.message);
                setChatRooms(response.data.data);
            })
            .catch((err) => {
                alert(err.response?.data || '채팅 목록 조회 실패');
                navigate(-1);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleChatRoomClick = (roomId: number, receiver: string) => {
        navigate(`../room/${roomId}/${receiver}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return '오늘';
        if (days === 1) return '어제';
        if (days < 7) return `${days}일 전`;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    };

    if (loading) {
        return (
            <div className="chat-list-container">
                <div className="chat-loading">
                    <div className="loading-spinner"></div>
                    <span>채팅 목록을 불러오는 중...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <div className="header-content">
                    <h2 className="chat-list-title">💬 채팅 목록</h2>
                    <p className="chat-list-subtitle">{user?.memId}님의 대화 내역</p>
                </div>
                <div className="chat-stats">
                    <div className="stat-item">
                        <span className="stat-label">전체 채팅방</span>
                        <span className="stat-value">{chatRooms.length}</span>
                    </div>
                </div>
            </div>

            {chatRooms.length === 0 ? (
                <div className="chat-list-empty">
                    <div className="empty-icon">💭</div>
                    <div className="empty-text">아직 채팅 내역이 없습니다</div>
                    <div className="empty-subtext">새로운 대화를 시작해보세요</div>
                </div>
            ) : (
                <div className="chat-rooms-grid">
                    {chatRooms.map((room, index) => (
                        <div
                            key={room.roomId}
                            className="chat-room-card"
                            onClick={() => handleChatRoomClick(room.roomId, room.receiver)}
                        >
                            <div className="room-number">#{index + 1}</div>
                            <div className="chat-room-avatar">
                                {room.receiver.charAt(0).toUpperCase()}
                            </div>
                            <div className="chat-room-content">
                                <div className="chat-room-header">
                                    <div className="chat-room-receiver">
                                        {room.receiver}
                                    </div>
                                    <div className="chat-room-badge">채팅방 ID: {room.roomId}</div>
                                </div>
                                <div className="chat-room-info">
                                    <span className="info-item">
                                        📅 {formatDate(room.createdAt)}
                                    </span>
                                    <span className="info-divider">•</span>
                                    <span className="info-item">
                                        🕐 {getTimeAgo(room.createdAt)}
                                    </span>
                                </div>
                                <div className="chat-room-meta">
                                    생성일시: {new Date(room.createdAt).toLocaleString('ko-KR')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatListComponent;