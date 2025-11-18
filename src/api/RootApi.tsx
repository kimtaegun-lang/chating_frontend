import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

//const serverPort = process.env.REACT_APP_SERVER_PORT;
//const serverPort = localStorage.getItem("SERVER") || process.env.REACT_APP_SERVER_PORT;
const serverPort = 'http://localhost:8080';

const api = axios.create({
    baseURL: serverPort,
    withCredentials: true
});

// refresh 중복 호출 방지용 Promise
let refreshPromise: Promise<any> | null = null;

// 실제 refresh 함수
const doRefresh = () => {
    if (!refreshPromise) {
        refreshPromise = api.post('/api/refresh')
            .then(res => {
                if (res.data?.expiresIn) {
                    const newExpiry = Date.now() + (res.data.expiresIn * 1000);
                    sessionStorage.setItem('tokenExpiry', newExpiry.toString());
                }
            })
            .catch(err => {
                sessionStorage.clear();
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/member/signIn';
                throw err;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

// Request Interceptor - 만료 5분 전 자동 갱신
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (config.url?.includes('/api/refresh')) {
            return config;
        }
        const expiry = sessionStorage.getItem('tokenExpiry');

        if (expiry) {
            const timeLeft = Number(expiry) - Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (timeLeft < fiveMinutes && timeLeft > 0) {
                await doRefresh();
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - 401 / 403 처리
api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (originalRequest?.url?.includes('/api/refresh')) {
            return Promise.reject(error);
        }

         // 403 → refresh 토큰 만료 → 로그아웃
        if (error.response?.status === 403) {
            sessionStorage.clear();
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/member/signIn';
        }
        
        // 401 → access 토큰 만료 → refresh 한 번 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await doRefresh();
                return api(originalRequest); // 원래 요청 재실행
            } catch (e) {
                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);

export { serverPort, api };
