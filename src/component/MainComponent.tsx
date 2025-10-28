import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const MainComponent = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const username=localStorage.getItem("name");

    // 페이지 포커스될 때마다 체크 (로그아웃 반영)
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('accessToken');
            const name = localStorage.getItem('userName');

            if (token) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        };

        // 초기 체크
        checkLoginStatus();

        // storage 이벤트 리스너 (다른 탭에서 로그아웃 시)
        window.addEventListener('storage', checkLoginStatus);
        
        // 페이지 포커스 시 체크
        window.addEventListener('focus', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
            window.removeEventListener('focus', checkLoginStatus);
        };
    }, []);

    return (
        <div className="main-container">
            <div className="main-content">
                <h1 className="main-title">채팅 애플리케이션</h1>

                {isLoggedIn ? (
                    <div className="user-section">
                        <p className="welcome-text">환영합니다, <span className="username">{username}</span>님!</p>

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/chat/list')}
                            >
                                채팅 목록
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/chat/matching')}
                            >
                                랜덤 매칭
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="guest-section">
                        <p className="guest-text">로그인하여 채팅을 시작하세요</p>

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/member/signIn')}
                            >
                                로그인
                            </button>

                            <button
                                className="btn btn-outline"
                                onClick={() => navigate('/member/signUp')}
                            >
                                회원가입
                            </button>
                        </div>
                    </div>
                )}

                <div className="features">
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>실시간 채팅</h3>
                        <p>WebSocket을 이용한 실시간 메시징</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎲</div>
                        <h3>랜덤 매칭</h3>
                        <p>새로운 사람들과 랜덤으로 대화</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>채팅 내역</h3>
                        <p>이전 대화 내역 저장 및 조회</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainComponent;