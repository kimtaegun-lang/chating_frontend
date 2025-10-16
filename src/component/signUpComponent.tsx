import { useState } from "react";
import { userInfo, errors } from "./index";
import { signUp } from "../api/MemberApi";
import { useNavigate } from "react-router-dom";
const SignUpComponent = () => {
    const [userData, setUserData] = useState<userInfo>({
        memId: "",
        pwd: "",
        name: "",
        email: "",
        phone: "",
        gender: "",
        addr: "",
        birth:"",
    }); // form 데이터

    const [error, setError] = useState<{ [key: string]: string }>({}); // 에러 메시지
    const [checkPwd, setCheckPwd] = useState<string>(""); // 비밀번호 확인
    const navigate = useNavigate(); // 페이지 이동 훅
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => { // input 변화 감지
        const { name, value } = e.target;
        if(name==='checkPwd'){
            setCheckPwd(value);
        }
        else {
            setUserData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    }

    // select 변화 감지
    const onChangeOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    // form 제출
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newError: { [key: string]: string } = {};

        // 유효성 검사
        if (userData.memId === "") {
            newError.memId = "아이디를 입력해 주세요.";
        }
        else if (userData.memId.length < 6 || userData.memId.length > 12) {
            newError.memId = "아이디는 6자 이상 12자 이내로 입력해주세요.";
        }
        else if (!/^[A-Za-z0-9]+$/.test(userData.memId)) {
            newError.memId = "아이디는 영어와 숫자만 사용할 수 있습니다.";
        }

        if (userData.pwd === "") {
            newError.pwd = "비밀번호를 입력해 주세요.";
        }
        else if (userData.pwd.length < 6 || userData.pwd.length > 12) {
            newError.pwd = "비밀번호는 6자 이상 12자 이내로 입력해주세요.";
        }
        else if (!/^(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-])[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-]+$/.test(userData.pwd)) {
            newError.pwd = "비밀번호는 영문, 숫자, 특수문자만 사용 가능하며 특수문자를 최소 1개 포함해야 합니다.";
        }
        else if (checkPwd!==userData.pwd) {
            newError.checkPwd = "비밀번호가 다릅니다.";
        }

        if (userData.name === "") {
            newError.name = "이름을 입력해 주세요.";
        }

        if (userData.email === "") {
            newError.email = "이메일을 입력해 주세요.";
        }
        else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(userData.email)) {
            newError.email = "올바른 이메일 형식으로 입력해 주세요.";
        }

        if (userData.phone === "") {
            newError.phone = "전화번호를 입력해 주세요.";
        }
        else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(userData.phone)) {
            newError.phone = "올바른 전화번호 형식으로 입력해 주세요.";
        }

        if (userData.gender === "") {
            newError.gender = "성별을 선택해 주세요.";
        }

        if (userData.addr === "") {
            newError.addr = "주소를 입력해 주세요.";
        }

        if (userData.birth === null) {
            newError.birth = "생년월일을 입력해 주세요.";
        }

        // 예외 사항이 없을 경우, 회원 가입 진행
        if (Object.keys(newError).length > 0) {
            setError(newError);
            return;
        }

        setError({});
        signUp(userData)
            .then((res) => {
                alert(res.data);
                navigate('../signIn');
            })
            .catch((err) => {
                alert(err.response.data.message);
            });
    }

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
                maxWidth: '500px',
                width: '100%'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>회원가입</h2>

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
                                padding: '10px',
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
                                padding: '10px',
                                border: error.pwd ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.pwd && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.pwd}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            비밀번호 확인
                        </label>
                        <input
                            type="password"
                            name="checkPwd"
                            value={checkPwd}
                            placeholder="비밀번호를 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.pwd ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {userData.pwd!==checkPwd && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>비밀번호가 다릅니다.</p>}
                    </div>


                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            이름
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={userData.name}
                            placeholder="이름을 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.name ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.name && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.name}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            placeholder="이메일을 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.email ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.email && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.email}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            전화번호
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={userData.phone}
                            placeholder="전화번호를 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.phone ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.phone && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.phone}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            성별
                        </label>
                        <select
                            name="gender"
                            value={userData.gender}
                            onChange={onChangeOption}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.gender ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="">선택</option>
                            <option value="MALE">남자</option>
                            <option value="FEMALE">여자</option>
                        </select>
                        {error.gender && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.gender}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            주소
                        </label>
                        <input
                            type="text"
                            name="addr"
                            value={userData.addr}
                            placeholder="주소를 입력해 주세요."
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.addr ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.addr && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.addr}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
                            생년월일
                        </label>
                        <input
                            type="date"
                            name="birth"
                            value={userData.birth} 
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: error.birth ? '1px solid #ff4444' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error.birth && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error.birth}</p>}
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
                        회원 가입
                    </button>
                </form>
            </div>
        </div>
    )
}
export default SignUpComponent;