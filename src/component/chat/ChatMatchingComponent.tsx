import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StompSubscription } from '@stomp/stompjs';
import { connect, requestRandomMatch, cancelRandomMatch, disconnect } from '../../api/ChatApi';
import '../../css/ChatMatching.css';

const ChatMatchingComponent = () => {
    const [isMatching, setIsMatching] = useState(false);
    const isMatchingRef = useRef(false);
    const [message, setMessage] = useState('');
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const hasStartedRef = useRef(false);
    const isConnectedRef = useRef(false); 
    const navigate = useNavigate();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");

    useEffect(() => {
        if (!isConnectedRef.current && userInfo) {
            console.log("=== WebSocket 연결 시작 ===");
            connect(() => {
                console.log('WebSocket 연결 완료');
                isConnectedRef.current = true;
                
                // 연결 후 자동 매칭 시작
                if (!hasStartedRef.current) {
                    hasStartedRef.current = true;
                    startMatchingRequest();  
                }
            });
        }
        
        // 컴포넌트 언마운트 시 정리
        return () => {
            console.log("=== 컴포넌트 언마운트 ===");
            if (subscriptionRef.current) {
                console.log("구독 취소");
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            if (isMatchingRef.current) {
                cancelRandomMatch(userInfo.memId).catch(console.error);
            }
            disconnect();
            isConnectedRef.current = false;
        };
    }, []);

    
    const startMatching = () => {

        if (!userInfo) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
            return;
        }
        
        // 이미 연결되어 있으면 바로 매칭 요청
        if (isConnectedRef.current) {
            startMatchingRequest();
        } else {
            // 연결되어 있지 않으면 연결 후 매칭
            setMessage('서버 연결 중...');
            connect(() => {
                console.log('WebSocket 연결 완료');
                isConnectedRef.current = true;
                startMatchingRequest();
            });
        }
    };

    // 매칭 요청 (연결과 분리)
    const startMatchingRequest = () => {
        setIsMatching(true);
        isMatchingRef.current = true;
        setMessage('매칭 대기 중...');
        
        const subscription = requestRandomMatch((data) => {
            if (data.matched) {
                const { roomId, receiver } = data;
                
                if (!roomId || !receiver) {
                    console.error('매칭 데이터 불완전:', { roomId, receiver });
                    setMessage('매칭 오류가 발생했습니다.');
                    return;
                }
                
                console.log('✅ 매칭 성공!', { roomId, receiver });
                setMessage(`매칭 성공! ${receiver}님과 연결되었습니다.`);
                
                // 구독 해제
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                    subscriptionRef.current = null;
                }
                
                // 채팅방으로 이동
                setTimeout(() => {
                    navigate(`/chat/room/${roomId}/${receiver}`, {
                        state: { 
                            receiver: receiver,
                            roomId: roomId
                        }
                    });
                }, 1000);
            } else {
                setMessage(data.message || '매칭 대기 중...');
            }
        }, userInfo.memId);
        
        if (subscription) {
            subscriptionRef.current = subscription;
        }
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
            await cancelRandomMatch(userInfo.memId);
            
            setIsMatching(false);
            isMatchingRef.current = false;
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
        <div className="matching-container">
            <h1 className="matching-title">랜덤 채팅 🎲</h1>
            <p className="matching-description">
                랜덤으로 매칭된 상대와 채팅을 시작해보세요!
            </p>

            {!isMatching ? (
                <button
                    onClick={startMatching}
                    className="matching-start-btn"
                >
                    매칭 시작
                </button>
            ) : (
                <div>
                    <div className="matching-progress">
                        <div className="matching-spinner">⌛</div>
                        <p className="matching-message">{message}</p>
                        <p className="matching-submessage">잠시만 기다려주세요...</p>
                    </div>
                    
                    <button
                        onClick={handleCancel}
                        className="matching-cancel-btn"
                    >
                        매칭 취소
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatMatchingComponent;