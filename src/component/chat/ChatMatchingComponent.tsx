import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StompSubscription } from '@stomp/stompjs';
import { connect, requestRandomMatch, cancelRandomMatch, disconnect } from '../../api/ChatApi';
import { useSelector } from "react-redux";
import { RootState } from '../../store/store';
import '../../css/ChatMatching.css';

const ChatMatchingComponent = () => {
    const [isMatching, setIsMatching] = useState(false);
    const isMatchingRef = useRef(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const subscriptionRef = useRef<StompSubscription | null>(null);
    const hasStartedRef = useRef(false);
    const isConnectedRef = useRef(false);  // ← 연결 상태 추적
    const {isLoggedIn, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // 컴포넌트 마운트 시 WebSocket 연결 (세션 기반 로그인도 인정)
        const stored = sessionStorage.getItem('userInfo');
        const sessionUser = stored ? JSON.parse(stored) : null;
        const effectiveIsLoggedIn = isLoggedIn || !!sessionUser;

        if (!isConnectedRef.current && effectiveIsLoggedIn) {
            console.log("=== WebSocket 연결 시작 ===");
            connect(() => {
                console.log('WebSocket 연결 완료');
                isConnectedRef.current = true;
                
                // 연결 후 자동 매칭 시작
                if (!hasStartedRef.current) {
                    hasStartedRef.current = true;
                    startMatchingRequest();  // ← 연결 없이 매칭만 요청
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
                cancelRandomMatch(user?.memId).catch(console.error);
            }
            disconnect();
            isConnectedRef.current = false;
        };
    }, [isLoggedIn]);

    
    const startMatching = () => {
        const stored = sessionStorage.getItem('userInfo');
        const sessionUser = stored ? JSON.parse(stored) : null;
        const effectiveIsLoggedIn = isLoggedIn || !!sessionUser;
        if (!effectiveIsLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
            return;
        }

        console.log("=== 매칭 시작 버튼 클릭 ===");
        
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
        
        console.log("=== 매칭 요청 전송 ===");
        const stored = sessionStorage.getItem('userInfo');
        const sessionUser = stored ? JSON.parse(stored) : null;
        const effectiveUser = user ?? sessionUser;
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
        }, effectiveUser?.memId);
        
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
            const stored = sessionStorage.getItem('userInfo');
            const sessionUser = stored ? JSON.parse(stored) : null;
            const effectiveUser = user ?? sessionUser;
            await cancelRandomMatch(effectiveUser?.memId);
            
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