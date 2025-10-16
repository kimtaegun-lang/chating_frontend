import axios from 'axios';
const serverPort = "http://localhost:8080";

const api = axios.create({
    baseURL: serverPort
});

// 모든 요청에 token 자동 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { serverPort, api };