import '../../css/Loading.css';

const Loading = () => {
    return (
        <div className="app-loading-overlay">
            <div className="app-loading-content">
                <div className="app-spinner-container">
                    <div className="app-spinner"></div>
                    <div className="app-spinner-inner"></div>
                </div>
                <p className="app-loading-text">로딩 중...</p>
            </div>
        </div>
    );
};

export default Loading;