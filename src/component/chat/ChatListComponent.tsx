import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChatRooms } from '../../api/ChatApi';
import { chatRoom } from '..';
import '../../css/ChatList.css';

const ChatListComponent = () => {
    const [chatRooms, setChatRooms] = useState<chatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const loginUserId = localStorage.getItem('memId') || '';

    useEffect(() => {
        fetchChatRooms();
    }, [loginUserId]);

    const fetchChatRooms = async () => {
        getMyChatRooms(loginUserId)
            .then((response) => {
                console.log(response.data.message);
                setChatRooms(response.data.data);
                setLoading(false);
            })
            .catch((err) => {
                alert(err.response.data);
                setLoading(false);
            });
    };

    const handleChatRoomClick = (roomId: number, receiver: string) => {
        navigate(`../room/${roomId}/${receiver}`);
    };

    if (loading) {
        return <div className="chat-loading">로딩 중...</div>;
    }

    return (
        <div className="chat-list-container">
            <h2 className="chat-list-title">채팅 목록</h2>

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
                                {room.receiver}
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

export default ChatListComponent;