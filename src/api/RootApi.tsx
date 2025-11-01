import axios, { AxiosError } from 'axios';

const serverPort = process.env.REACT_APP_SERVER_PORT;

const api = axios.create({
    baseURL: serverPort,
    withCredentials: true
});



// http 응답 인터셉터 설정 - 토큰 만료 시 재발급 로직
api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const errorData = error.response?.data as { error?: string; message?: string };
        
        // refresh 요청 자체가 실패한 경우는 처리하지 않음 (무한 루프 방지)
        if (originalRequest.url?.includes('/api/refresh')) {
            return Promise.reject(error);
        }
        
        // 401 에러이고 아직 재시도하지 않은 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            const errorCode = errorData?.error;
                originalRequest._retry = true;
                
                try {
                    await api.post('/api/refresh');
                    console.log("토큰 재발급 완료");
                    return api(originalRequest); // 원래 요청 재시도
                } catch (refreshError) {
                    console.error("Refresh Token 만료 또는 재발급 실패");
                    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                    
                    // 로그인 페이지로 리다이렉트
                    setTimeout(() => {
                        window.location.href = '/member/signIn';
                    }, 100);
                    
                    // pending 상태로 유지 (무한 루프 방지)
                    return new Promise(() => {});
                }
            }
        
        
        return Promise.reject(error);
    }
);

export { serverPort, api };