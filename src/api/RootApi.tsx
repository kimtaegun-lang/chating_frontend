import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const serverPort = 'http://localhost:8080';
//const serverPort = process.env.REACT_APP_SERVER_PORT;
const api = axios.create({
    baseURL: serverPort,
    withCredentials: true
});

let refreshPromise: Promise<any> | null = null;

const doRefresh = () => {
    if (!refreshPromise) {
        refreshPromise = api.post('/api/refresh')
            .then(res => {
                if (res.data?.expiresIn) {
                    const newExpiry = Date.now() + (res.data.expiresIn * 1000);
                    sessionStorage.setItem('tokenExpiry', newExpiry.toString());
                }
                return res;
            })
            .catch(err => {
                // 409 error
                if (err.response?.status === 409) {
                    console.log('토큰이 아직 유효합니다.');
                    return Promise.resolve(); 
                }
                
              console.log('토큰 갱신 실패:', err);
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

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
                await doRefresh().catch(() => {});
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // /api/refresh의 409는 여기서 처리
        if (originalRequest?.url?.includes('/api/refresh')) {
            if (error.response?.status === 409) {
                console.log('토큰이 아직 유효합니다.');
                return Promise.resolve({ data: {} }); // ← 빈 응답 반환
            }
            return Promise.reject(error);
        }

        // 409 토큰 유효, 무시하고 계속
        if (error.response?.status === 409) {
            console.log('토큰이 아직 유효합니다. 요청을 계속합니다.');
            return api(originalRequest);
        }

         // 403 refresh 토큰 만료 → 로그아웃
        if (error.response?.status === 403) {
            sessionStorage.clear();
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/member/signIn';
        }
        
        // 401 refresh 한 번 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await doRefresh();
                return api(originalRequest);
            } catch (e) {
                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);

export { serverPort, api };