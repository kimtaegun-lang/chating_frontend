import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChatRooms } from '../api/ChatApi';
import { chatRoom } from '../component';

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
//
    const handleChatRoomClick = (roomId: number, receiver: string) => {
        navigate(`../room/${roomId}/${receiver}`);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
    }


    return (
        <div style={{
            maxWidth: '400px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                채팅 목록
            </h2>

            {chatRooms.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#999'
                }}>
                    채팅이 없습니다
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {chatRooms.map((room) => (
                        <div
                            key={room.roomId}
                            onClick={() => handleChatRoomClick(room.roomId, room.receiver)}
                            style={{
                                padding: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: '#f9f9f9',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f0f0f0';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f9f9f9';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                fontWeight: 'bold',
                                color: '#333',
                                marginBottom: '5px',
                                fontSize: '16px'
                            }}>
                                {room.receiver}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#999'
                            }}>
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