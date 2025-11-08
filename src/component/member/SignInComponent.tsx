import { useState } from "react";
import { signInData } from "..";
import { useNavigate } from "react-router-dom";
import { signIn, validateAndGetUserInfo } from "../../api/MemberApi";
import "../../css/SignIn.css";

const SignInComponent = () => {
    const [userData, setUserData] = useState<signInData>({
        memId: "",
        pwd: ""
    });

    const [error, setError] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();
    

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));

        if (error[name]) {
            setError((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newError: { [key: string]: string } = {};

        if (!userData.memId) newError.memId = "아이디를 입력해 주세요.";
        if (!userData.pwd) newError.pwd = "비밀번호를 입력해 주세요.";

        if (Object.keys(newError).length > 0) {
            setError(newError);
            return;
        }

        signIn(userData)
            .then(async (res) => {
                alert(res.data);
                try {
                    const info = await validateAndGetUserInfo();
                    const userInfo = info.data.userInfo;
                    sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
                } catch (e: any) {
                    alert(e.data);
                }
                navigate("/");
            })
            .catch((err) => {
                alert(err.response.data);
            });

        setError({});
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2>로그인</h2>
                <form onSubmit={onSubmit}>
                    {/* 아이디 */}
                    <div className="form-group">
                        <label>아이디</label>
                        <input
                            type="text"
                            name="memId"
                            value={userData.memId}
                            placeholder="아이디를 입력해 주세요."
                            onChange={onChange}
                            className={error.memId ? "input-error" : ""}
                        />
                        {error.memId && <p className="error-msg">{error.memId}</p>}
                    </div>

                    {/* 비밀번호 */}
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="pwd"
                            value={userData.pwd}
                            placeholder="비밀번호를 입력해 주세요."
                            onChange={onChange}
                            className={error.pwd ? "input-error" : ""}
                        />
                        {error.pwd && <p className="error-msg">{error.pwd}</p>}
                    </div>

                    <button type="submit" className="submit-btn">
                        로그인
                    </button>

                    <div className="signup-link">
                        <span onClick={() => navigate("/member/signUp")}>
                            회원가입
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignInComponent;
