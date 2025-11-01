import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyChatRooms } from '../../api/ChatApi';
import { deleteRoom } from '../../api/AdminApi';
import { chatRoom } from '..';
import { setUser } from '../../store/authSlice';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../../store/store';
import PageComponent from '../common/PageComponent';
import Loading from '../../common/Loading';
import '../../css/ChatList.css';

const AdminChatListComponent = () => {
    const [chatRooms, setChatRooms] = useState<chatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { memberId } = useParams<{ memberId: string }>();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);


    useEffect(() => {

        if (!user) {
            const storedUser = sessionStorage.getItem('userInfo');
            if (storedUser) {
                dispatch(setUser(JSON.parse(storedUser)));
            }
        }

        if (user?.role !== 'ADMIN') {
            alert('관리자만 접근 가능합니다.');
            navigate(-1);
            return;
        }

        fetchChatRooms(currentPage);
    }, []);

    const fetchChatRooms = async (currentPage: number) => {
        try {
            const response = await getMyChatRooms(currentPage, 10, memberId!);
            setChatRooms(response.data.data.content);
            setCurrentPage(response.data.data.currentPage);
            setTotalPages(response.data.data.totalPages);
        } catch (err: any) {
            alert(err.response?.data || '채팅 목록 조회 실패');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleChatRoomClick = (roomId: number, receiver: string) => {
        navigate(`/admin/member/${memberId}/chat/${roomId}/${receiver}`);
    };

    const handleDeleteRoom = async (e: React.MouseEvent, roomId: number) => {
        e.stopPropagation();

        if (!window.confirm('정말 이 채팅방을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteRoom(roomId);
            setChatRooms(chatRooms.filter(room => room.roomId !== roomId));
            alert('채팅방이 삭제되었습니다.');
        } catch (err: any) {
            alert(err.response?.data || '채팅방 삭제 실패');
        }
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


    // 페이지 변경
    const handlePageChange = (page: number): void => {
        if (page >= 0 && page < totalPages) {
            fetchChatRooms(page);
        }
    };

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <>
            <div className="chat-list-container">
                <div className="chat-list-header">
                    <div className="header-content">
                        <h2 className="chat-list-title">💬 채팅 목록</h2>
                        <p className="chat-list-subtitle">{memberId}님의 대화 내역</p>
                    </div>
                    <div className="chat-stats">
                        <div className="stat-item">
                            <span className="stat-label">전체 채팅방</span>
                            <span className="stat-value">{chatRooms.length}</span>
                        </div>
                    </div>
                </div>

                <div className="admin-info-banner">
                    <span className="banner-icon">🔐</span>
                    <div className="banner-content">
                        <strong>관리자 모드</strong>
                        <p>모든 채팅 내역을 조회하고 관리할 수 있습니다</p>
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
                                <button
                                    className="delete-button"
                                    onClick={(e) => handleDeleteRoom(e, room.roomId)}
                                    aria-label="채팅방 삭제"
                                    title="채팅방 삭제"
                                >
                                    <span className="delete-icon">🗑️</span>
                                </button>
                            </div>
                        ))}

                    </div>

                )}

            </div>
            <PageComponent currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );
};

export default AdminChatListComponent;