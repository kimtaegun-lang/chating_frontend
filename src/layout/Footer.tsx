import '../css/Footer.css'

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>채팅 애플리케이션</h3>
                    <p>실시간 채팅과 랜덤 매칭을 즐겨보세요</p>
                </div>

                <div className="footer-section">
                    <h4>서비스</h4>
                    <ul>
                        <li><a href="/chat/list">채팅 목록</a></li>
                        <li><a href="/chat/matching">랜덤 매칭</a></li>
                        <li><a href="/about">서비스 소개</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>고객지원</h4>
                    <ul>
                        <li><a href="/faq">자주 묻는 질문</a></li>
                        <li><a href="/contact">문의하기</a></li>
                        <li><a href="/terms">이용약관</a></li>
                        <li><a href="/privacy">개인정보처리방침</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>연결하기</h4>
                    <div className="social-links">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="mailto:contact@example.com">Email</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} 채팅 애플리케이션. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;