import { useNavigate } from "react-router-dom";
const MainComponent =() => {
    const navigate = useNavigate(); // 페이지 이동 훅
    return (
        <>
        <div>메인 컴포넌트 입니다.</div>
        <button onClick={()=>navigate('member/signUp')}>회원가입</button>
         <button onClick={()=>navigate('member/signIn')}>로그인</button>
         </>
    )
}
export default MainComponent;