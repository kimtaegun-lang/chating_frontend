const Loading = () => { // 서버로딩시 보여질 화면
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="p-5 bg-white rounded-lg text-center">
                <div className="text-2xl font-semibold">로딩 중...</div>
            </div>
        </div>
    );
};
export default Loading;