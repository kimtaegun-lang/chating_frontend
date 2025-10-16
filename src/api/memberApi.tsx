import axios from "axios";
import { serverPort } from "./rootApi";
import { userInfo,signInData } from "../component";
const member = `${serverPort}/member`;

export const signUp = async (formData: userInfo) => {
    console.log(member + "/signUp")
    console.log(formData);
    const response = await axios.post(member + "/signUp", formData, {
        headers: { "Content-Type": "application/json" }
    });
    return response;
}

export const signIn=async(formData:signInData)=> {
    const response=await axios.post(member+"/signIn",formData,{
        headers:{"Content-Type":"application/json"}
    });
    return response;
}
