import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyChatRooms } from '../../api/ChatApi';
import { chatRoom } from '..';
import '../../css/ChatList.css';

const AdminChatListComponent = () => {
    const [chatRooms, setChatRooms] = useState<chatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { memberId } = useParams<{ memberId: string }>();

    useEffect(() => {
        if (!memberId) {
            alert('회원 정보가 없습니다.');
            navigate(-1);
            return;
        }
        fetchChatRooms();
    }, [memberId]);

    const fetchChatRooms = async () => {
        try {
            const response = await getMyChatRooms(memberId!);
            console.log(response.data.message);
            setChatRooms(response.data.data);
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

    const handleBack = () => {
        navigate(`/admin/member/${memberId}`);
    };

    if (loading) {
        return <div className="chat-loading">로딩 중...</div>;
    }

    return (
        <div className="chat-list-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <button onClick={handleBack} className="btn btn-outline">
                    ← 돌아가기
                </button>
                <h2 className="chat-list-title">{memberId}님의 채팅 목록</h2>
            </div>

            {chatRooms.length === 0 ? (
                <div className="chat-list-empty">
                    채팅이 없습니다
                </div>
            ) : (
                <div className="chat-rooms-grid">
                    {chatRooms.map((room) => (
                        <div
                            key={room.roomId}
                            className="chat-room-card"
                            onClick={() => handleChatRoomClick(room.roomId, room.receiver)}
                        >
                            <div className="chat-room-receiver">
                                상대방: {room.receiver}
                            </div>
                            <div className="chat-room-date">
                                {new Date(room.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminChatListComponent;