import axios from "axios";
import { serverPort } from "./RootApi";
import { userInfo,signInData } from "../component";
import { api } from './RootApi';
import { updateMemberData } from "../component";
const member = `${serverPort}/member`;

// 회원가입
export const signUp = async (formData: userInfo) => {
    console.log(member + "/signUp")
    console.log(formData);
    const response = await axios.post(member + "/signUp", formData, {
        headers: { "Content-Type": "application/json" }
    });
    return response;
}

// 로그인
export const signIn = async (formData: signInData) => {
    const response = await api.post(member + "/signIn", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true   
    });
    return response;
}

// 로그아웃
export const signOut=async()=> {
    const response=await api.post(member+"/signOut");
    return response;
}

// 회원 정보 가져오기
export const getUserInfo=async()=> {
    const response=await api.get(member+"/getMemberInfo");  
    return response;
}

// 회원 정보 수정
export const updateMemberInfo = async (updateData: updateMemberData) => {
    const response = await api.put(`${member}/updateMemberInfo`, updateData);
    return response;
}
// 회원 탈퇴
export const deleteMember = async () => {
    const response = await api.delete(member + "/deleteMember");
    return response;
}

// 회원 인증 및 회원 정보 조회
export const validateAndGetUserInfo = async () => {
    const response = await api.get(`${member}/auth/check`);
    return response;
};