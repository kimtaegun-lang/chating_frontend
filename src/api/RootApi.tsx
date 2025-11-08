import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { signOut } from './MemberApi';

const serverPort = process.env.REACT_APP_SERVER_PORT;
const api = axios.create({
    baseURL: serverPort,
    withCredentials: true
});

// 토큰 갱신 상태 관리
let isRefreshing = false;
let lastRefreshTime = 0; // 마지막 갱신 시간 추적
const REFRESH_COOLDOWN = 3000; // 3초 쿨다운

let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // refresh 요청 자체가 실패한 경우
        if (originalRequest.url?.includes('/api/refresh')) {
            isRefreshing = false;
            processQueue(error);
            
            if (error.response?.status === 429) {
                // 3초 대기 후 자동 재시도
                await new Promise(resolve => setTimeout(resolve, 3000));
                isRefreshing = false;
                return api(originalRequest);
            }
            return Promise.reject(error);
        }

        // 401 에러이고 아직 재시도하지 않은 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            const now = Date.now();
            
            // 최근에 갱신했으면 대기
            if (now - lastRefreshTime < REFRESH_COOLDOWN) {
                const waitTime = REFRESH_COOLDOWN - (now - lastRefreshTime);
                console.log(`토큰 갱신 쿨다운 ${waitTime}ms 대기 중...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            
            // 이미 토큰 갱신 중이면 대기열에 추가
            if (isRefreshing) {
                console.log('토큰 갱신 대기 중...');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            console.log('토큰 갱신 시작');

            try {
                await api.post('/api/refresh');
                console.log("토큰 재발급 완료");
                
                lastRefreshTime = Date.now(); // 갱신 시간 기록
                isRefreshing = false;
                processQueue();
                
                return api(originalRequest);
            } catch (refreshError) {
                console.log("Refresh Token 만료 또는 재발급 실패");
                
                isRefreshing = false;
                processQueue(refreshError);
                
                signOut();
                sessionStorage.clear();
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/member/signIn';
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { serverPort, api };