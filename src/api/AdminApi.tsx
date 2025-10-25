// src/api/AdminApi.ts
import { api } from './RootApi';
import { serverPort } from "./RootApi";
import { searchOptions } from '../component';
const admin = `${serverPort}/api/admin`;

// 회원 목록 조회 (페이징)
export const getMembers = async (
    pageCount: number = 0, 
    size: number = 10, 
    searchOption: searchOptions
) => {
    const response = await api.get(`${admin}/members`, {
        params: { 
            pageCount, 
            size,
            ...searchOption  
        }
    });
    return response;
}

// 회원 상세 조회
export const getMemberDetail = async (memberId: string) => {
    const response = await api.get(`${admin}/members/${memberId}`);
    return response;
}

// 회원 상태 변경
export const updateMemberStatus = async (memberId: string, status: string) => {
    const response = await api.put(`${admin}/members/${memberId}/status`, {
        status: status
    });
    return response;
}

// 회원 삭제
export const deleteMember = async (memberId: string) => {
    const response = await api.delete(`${admin}/members/${memberId}`);
    return response;
}

// 통계 조회 (추가)
export const getStatistics = async () => {
    const response = await api.get(`${admin}/statistics`);
    return response;
}