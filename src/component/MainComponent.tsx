import { useNavigate } from "react-router-dom";
import '../css/Page.css';

const MainComponent = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
    

    return (
        <div className="main-container">
            <div className="main-content">
                <h1 className="main-title">채팅 애플리케이션</h1>

                {userInfo ? (
                    <div className="user-section">
                        <p className="welcome-text">
                            환영합니다, <span className="username">{userInfo.name}</span>님!
                        </p>

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