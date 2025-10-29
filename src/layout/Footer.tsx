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
                    </ul>
                </div>


                <div className="footer-section">
                    <h4>contact</h4>
                    <div className="social-links">
                        <h5>GitHub: https://github.com/kimtaegun-lang</h5>
                        <h5>Email: tee1694@naver.com</h5>
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