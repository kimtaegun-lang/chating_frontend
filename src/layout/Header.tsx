import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "../api/MemberApi";
import '../css/Header.css'

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const username=localStorage.getItem('name');
    const [isAdmin, setIsAdmin] = useState(false);  
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('userName');

        if (token) {
            setIsLoggedIn(true);
            setIsAdmin(role === 'ADMIN'); 
        }
    }, []);

    const handleLogout = () => {
        signOut()
            .then((response) => {
                alert(response.data);
                localStorage.clear();
                setIsLoggedIn(false);
                setIsAdmin(false);
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
                    {isLoggedIn ? (
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
                                            <button onClick={() => {
                                                navigate('/admin/statistics');
                                                setShowAdminDropdown(false);
                                            }}>
                                                통계
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </nav>

                <div className="header-user">
                    {isLoggedIn ? (
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
                                        navigate('member/profile');
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