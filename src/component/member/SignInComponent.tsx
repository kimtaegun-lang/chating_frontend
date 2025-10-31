import { useState } from "react";
import { signInData } from '..';
import { useNavigate } from "react-router-dom";
import { signIn, validateAndGetUserInfo } from "../../api/MemberApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

const SignInComponent = () => {
    const [userData, setUserData] = useState<signInData>({
        memId: "",
        pwd: ""
    }); // form 데이터

    const [error, setError] = useState<{ [key: string]: string }>({}); // 에러 메시지
    const navigate = useNavigate(); // 페이지 이동 훅
    const dispatch = useDispatch();

    //  input 변화 감지
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value
        }));
        // 입력 시 에러 초기화
        if (error[name]) {
            setError((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    };


    //  form 제출
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newError: { [key: string]: string } = {};

        // 유효성 검사
        if (userData.memId === "") {
            newError.memId = "아이디를 입력해 주세요.";
        }

        if (userData.pwd === "") {
            newError.pwd = "비밀번호를 입력해 주세요.";
        }

        if (Object.keys(newError).length > 0) {
            setError(newError);
            return;
        }

        signIn(userData)
            .then(async (res) => {
                alert(res.data); // 쿠키 설정을 위한 대기
        await new Promise(resolve => setTimeout(resolve, 10000));
                // 로그인 성공 후, 서버에서 쿠키 설정이 완료되었을 때 사용자 정보 동기화
                try {
                    const info = await validateAndGetUserInfo();
                    const userInfo = info.data.userInfo;
                    dispatch(setUser(userInfo));
                    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                } catch (e) {
                    // 사용자 정보 동기화 실패 시에도 일단 메인으로 이동 (비로그인 UI 노출)
                }
                navigate('/');
            })
            .catch((err) => {
                alert(err.response.data);
            });
        setError({});
    }; 



    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>로그인</h2>

                <form onSubmit={onSubmit}>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            아이디
                        </label>
                        <input
                            type="text"
                            name="memId"
                            value={userData.memId}
                            placeholder="아이디를 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: error.memId ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.memId && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.memId}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            name="pwd"
                            value={userData.pwd}
                            placeholder="비밀번호를 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: error.pwd ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.pwd && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.pwd}</p>}
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                    >
                        로그인
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <a href="/member/signUp" style={{ color: '#4CAF50', textDecoration: 'none', fontSize: '14px' }}>
                            회원가입
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignInComponent;