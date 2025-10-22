import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StompSubscription } from '@stomp/stompjs';
import { connect, requestRandomMatch, cancelRandomMatch, disconnect } from '../api/ChatApi';

const ChatMatchingComponent = () => {
    const [isMatching, setIsMatching] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const loginUserId = localStorage.getItem('memId') || "";
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        // 자동 매칭 시작
        if (!hasStartedRef.current && loginUserId) {
            hasStartedRef.current = true;
            startMatching();
        }
        
        // 컴포넌트 언마운트 시 정리
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            if (isMatching) {
                cancelRandomMatch(loginUserId).catch(console.error);
            }
            disconnect();
        };
    }, []);

    const startMatching = () => {
        if (!loginUserId) {
            alert('로그인이 필요합니다.');
            navigate('../member/signIn');
            return;
        }

        setIsMatching(true);
        setMessage('서버 연결 중...');

        console.log("=== ChatMatchingComponent: 매칭 시작전 ===");
        connect(() => {
            console.log('WebSocket 연결 완료');
            setMessage('매칭 대기 중...');
            
            const subscription = requestRandomMatch(loginUserId, (data) => {
                
                if (data.matched) {
                    const { roomId, receiver } = data;
                    
                    // 데이터 검증
                    if (!roomId || !receiver) {
                        console.error('매칭 데이터 불완전:', { roomId, receiver });
                        setMessage('매칭 오류가 발생했습니다.');
                        return;
                    }
                    
                    console.log('매칭 성공! 이동 준비:', {
                        roomId: roomId,
                        receiver: receiver,
                        roomIdType: typeof roomId
                    });
                    
                    setMessage(`매칭 성공! ${receiver}님과 연결되었습니다.`);
                    
                    // 구독 해제
                    if (subscriptionRef.current) {
                        subscriptionRef.current.unsubscribe();
                        subscriptionRef.current = null;
                    }
                    
                    // 채팅방으로 이동
                    setTimeout(() => {
                        console.log(roomId, receiver);
                        navigate(`/chat/room/${roomId}/${receiver}`, {
                            state: { 
                                receiver: receiver,
                                roomId: roomId
                            }
                        });
                    }, 1000);
                } else {
                    // 대기 중 메시지 업데이트
                    setMessage(data.message || '매칭 대기 중...');
                }
            });
            
            // 구독 객체 저장
            if (subscription) {
                subscriptionRef.current = subscription;
            }
        });
    };

    const handleCancel = async () => {
        try {
            console.log('매칭 취소 요청');
            
            // 구독 해제
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            
            // 서버에 취소 요청
            await cancelRandomMatch(loginUserId);
            disconnect();
            
            setIsMatching(false);
            setMessage('매칭이 취소되었습니다.');
            
            // 이전 페이지로 이동
            setTimeout(() => {
                navigate(-1);
            }, 500);
        } catch (error) {
            console.error('매칭 취소 실패:', error);
            alert('매칭 취소에 실패했습니다.');
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '50px auto',
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#fff',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ marginBottom: '20px', color: '#333', fontSize: '32px' }}>
                랜덤 채팅 🎲
            </h1>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px' }}>
                랜덤으로 매칭된 상대와 채팅을 시작해보세요!
            </p>

            {!isMatching ? (
                <button
                    onClick={startMatching}
                    style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    매칭 시작
                </button>
            ) : (
                <div>
                    <div style={{
                        padding: '30px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '15px',
                        marginBottom: '20px',
                        border: '2px solid #e9ecef'
                    }}>
                        <div style={{
                            fontSize: '50px',
                            animation: 'spin 2s linear infinite',
                            marginBottom: '15px'
                        }}>
                            ⌛
                        </div>
                        <p style={{ 
                            fontSize: '18px', 
                            color: '#495057',
                            fontWeight: '500',
                            margin: 0
                        }}>
                            {message}
                        </p>
                        <p style={{
                            fontSize: '14px',
                            color: '#6c757d',
                            marginTop: '10px'
                        }}>
                            잠시만 기다려주세요...
                        </p>
                    </div>
                    
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '12px 30px',
                            fontSize: '16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'background-color 0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        매칭 취소
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ChatMatchingComponent;