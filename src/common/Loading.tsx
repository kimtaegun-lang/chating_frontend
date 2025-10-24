const Loading = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <div className="spinner-inner"></div>
                </div>
                <p className="loading-text">로딩 중...</p>
            </div>
        </div>
    );
};

export default Loading;