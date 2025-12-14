import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "../api/MemberApi";
import { connect, disconnect, subscribeNotification, isConnected } from "../api/ChatApi";
import '../css/Header.css'

interface Notification {
    chatId: number;
    chatRoomId: number;
    sender: string;
    receiver: string;
    content: string;
    createdAt: string;
    type: string; 
    url?: string;
    fileName?: string;
    fileSize?: number;
}

const Header = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const isAdmin = userInfo?.role === 'ADMIN';
    const username = userInfo?.name;

    // WebSocket 연결 및 알림 구독
    useEffect(() => {
        if (!userInfo) return;

        let subscription: any = null;

        const setupSubscription = () => {
            subscription = subscribeNotification((notification: Notification) => {               
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                if (Notification.permission === "granted") {
                    let body = '';
                    if (notification.type === 'IMAGE') {
                        body = `${notification.sender}님이 이미지를 보냈습니다`;
                    } else if (notification.type === 'FILE') {
                        body = `${notification.sender}님이 ${notification.fileName || '파일'}을 보냈습니다`;
                    } else {
                        body = `${notification.sender}: ${notification.content.substring(0, 50)}`;
                    }
                    
                    new Notification("새 메시지", {
                        body: body,
                        icon: "/chat-icon.png"
                    });
                }
            });
        };

        if (!isConnected()) {
            connect(() => {
                setupSubscription();
            });
        } else {
            setupSubscription();
        }

        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [userInfo]);

    // 다른 탭에서 다른 계정 로그인
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "logined") {
                const currentUserInfo = sessionStorage.getItem("userInfo");
                const newLogined = e.newValue;
                
                if (currentUserInfo && newLogined) {
                    const current = JSON.parse(currentUserInfo);
                    
                    // 다른 계정이 로그인됨
                    if (current.memId !== newLogined) {
                        alert("다른 탭에서 다른 계정이 로그인되었습니다.");
                        
                        disconnect();
                        sessionStorage.clear();
                        navigate('/member/signIn');
                    }
                }
                
                // logined가 삭제됨 
                if (e.oldValue && !e.newValue) {
                    alert("다른 탭에서 로그아웃되었습니다.");
                    disconnect();
                    sessionStorage.clear();
                    navigate('/member/signIn');
                }
            }
        };
        
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [navigate]);

    const handleLogout = () => {
        signOut()
            .then((response) => {
                alert(response.data);
                sessionStorage.removeItem('userInfo');
                localStorage.removeItem("logined");
                disconnect();
                navigate('/');
            })
            .catch((error) => {
                alert(error.response?.data || '로그아웃 실패');
            });
    };

    const handleNotificationClick = (notification: Notification) => {
        navigate(`/chat/room/${notification.chatRoomId}/${notification.sender}`);
        setShowNotifications(false);
        
        setNotifications(prev => prev.filter(n => n.chatId !== notification.chatId));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleNotificationIconClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setUnreadCount(0);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
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
                        <>
                            <div className="notification-container">
                                <button 
                                    className="notification-btn"
                                    onClick={handleNotificationIconClick}
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </button>
                                
                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        <div className="notification-header">
                                            <h3>알림</h3>
                                            {notifications.length > 0 && (
                                                <button 
                                                    className="clear-all-btn"
                                                    onClick={() => setNotifications([])}
                                                >
                                                    모두 지우기
                                                </button>
                                            )}
                                        </div>
                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <div className="no-notifications">
                                                    알림이 없습니다
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div 
                                                        key={notif.chatId}
                                                        className="notification-item"
                                                        onClick={() => handleNotificationClick(notif)}
                                                    >
                                                        <div className="notification-sender">
                                                            {notif.sender}
                                                        </div>
                                                        <div className="notification-content">
                                                            {notif.type === 'IMAGE' ? (
                                                                <span>🖼️ 이미지를 보냈습니다</span>
                                                            ) : notif.type === 'FILE' ? (
                                                                <span>📎 {notif.fileName || '파일'}을 보냈습니다</span>
                                                            ) : (
                                                                <>
                                                                    {notif.content.length > 50 
                                                                        ? notif.content.substring(0, 50) + '...' 
                                                                        : notif.content}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="notification-time">
                                                            {formatTime(notif.createdAt)}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

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
                        </>
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