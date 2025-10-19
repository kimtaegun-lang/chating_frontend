import axios from "axios";
import { serverPort } from "./RootApi";
import { userInfo,signInData } from "../component";
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
export const signIn=async(formData:signInData)=> {
    const response=await axios.post(member+"/signIn",formData,{
        headers:{"Content-Type":"application/json"}
    });
    return response;
}
