import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signOut } from "../api/MemberApi";
import '../css/Header.css'

const Header = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    
    // user 객체에서 정보 추출
    const isAdmin = userInfo?.role === 'ADMIN';
    const username = userInfo?.name;

    const handleLogout = () => {
        signOut()
            .then((response) => {
                alert(response.data);
                // 저장소 정리
                sessionStorage.removeItem('userInfo');
                navigate('/');
            })
            .catch((error) => {
                alert(error.response?.data || '로그아웃 실패');
            });
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-logo" onClick={() => navigate('/')}>
                    <h1>💬 채팅 앱</h1>
                </div>

                <nav className="header-nav">
                    {userInfo ? (
                        <>
                            <button 
                                className="nav-btn"
                                onClick={() => navigate('/chat/list')}
                            >
                                채팅 목록
                            </button>
                            <button 
                                className="nav-btn"
                                onClick={() => navigate('/chat/matching')}
                            >
                                랜덤 매칭
                            </button>
                            {isAdmin && (
                                <div className="admin-menu">
                                    <button 
                                        className="nav-btn admin-btn"
                                        onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                                    >
                                        ⚙️ 관리자 ▾
                                    </button>
                                    {showAdminDropdown && (
                                        <div className="admin-dropdown">
                                            <button onClick={() => {
                                                navigate('/admin/memberList');
                                                setShowAdminDropdown(false);
                                            }}>
                                                회원 목록
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </nav>

                <div className="header-user">
                    {userInfo ? (
                        <div className="user-dropdown">
                            <button 
                                className="user-btn"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {username}님 ▾
                            </button>
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <button onClick={() => {
                                        navigate('/member/profile');
                                        setShowDropdown(false);
                                    }}>
                                        내 프로필
                                    </button>
                                    <button onClick={handleLogout}>
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <button 
                                className="login-btn"
                                onClick={() => navigate('/member/signIn')}
                            >
                                로그인
                            </button>
                            <button 
                                className="signup-btn"
                                onClick={() => navigate('/member/signUp')}
                            >
                                회원가입
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;