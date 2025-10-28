import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://chat-backend-v1-0.onrender.com'
  : 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL
});

// http 요청 인터셉터 설정 api를 사용해서 요청할 때마다 토큰을 헤더에 포함
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// http 응답 인터셉터 설정  토큰 만료 시 재발급 로직
api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        const errorData = error.response?.data as { error?: string; message?: string };
        
         if (error.response?.status === 401 && !originalRequest._retry) {
            const errorCode = errorData?.error;
            
            // TOKEN_EXPIRED 또는 INVALID_TOKEN 모두 재발급 시도
            if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
                originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                console.log("Refresh Token 없음");
                localStorage.clear();
                window.location.href = '../member/signIn';
                return Promise.reject(error);
            }

            try {
                const result = await axios.post(`${API_BASE_URL}/api/refresh`, { refreshToken });
                
                if (result.data.accessToken) {
                    localStorage.setItem('accessToken', result.data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${result.data.accessToken}`;
                    console.log("토큰 재발급 완료");
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                if (axios.isAxiosError(refreshError) && refreshError.response?.status === 403) {
                    console.error("Refresh Token 만료");
                    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                    localStorage.clear();
                    window.location.href = '../member/signIn';
                }
                return Promise.reject(refreshError);
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export { API_BASE_URL, api };