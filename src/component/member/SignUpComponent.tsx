import { useState } from "react";
import { userInfo } from "..";
import { signUp } from "../../api/MemberApi";
import { useNavigate } from "react-router-dom";
import "../../css/SignUp.css";

const SignUpComponent = () => {
  const [userData, setUserData] = useState<userInfo>({
    memId: "",
    pwd: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    addr: "",
    birth: "",
  });
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [checkPwd, setCheckPwd] = useState<string>("");
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "checkPwd") {
      setCheckPwd(value);
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onChangeOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newError: { [key: string]: string } = {};

    // 유효성 검사
    if (!userData.memId) newError.memId = "아이디를 입력해 주세요.";
    else if (userData.memId.length < 6 || userData.memId.length > 12)
      newError.memId = "아이디는 6자 이상 12자 이내로 입력해주세요.";
    else if (!/^[A-Za-z0-9]+$/.test(userData.memId))
      newError.memId = "아이디는 영어와 숫자만 사용할 수 있습니다.";

    if (!userData.pwd) newError.pwd = "비밀번호를 입력해 주세요.";
    else if (userData.pwd.length < 6 || userData.pwd.length > 12)
      newError.pwd = "비밀번호는 6자 이상 12자 이내로 입력해주세요.";
    else if (
      !/^(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-])[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-]+$/.test(
        userData.pwd
      )
    )
      newError.pwd =
        "비밀번호는 영문, 숫자, 특수문자만 사용 가능하며 특수문자를 최소 1개 포함해야 합니다.";
    else if (checkPwd !== userData.pwd) newError.checkPwd = "비밀번호가 다릅니다.";

    if (!userData.name) newError.name = "이름을 입력해 주세요.";
    if (!userData.email) newError.email = "이메일을 입력해 주세요.";
    else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(userData.email))
      newError.email = "올바른 이메일 형식으로 입력해 주세요.";

    if (!userData.phone) newError.phone = "전화번호를 입력해 주세요.";
    else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(userData.phone))
      newError.phone = "올바른 전화번호 형식으로 입력해 주세요.";

    if (!userData.gender) newError.gender = "성별을 선택해 주세요.";
    if (!userData.addr) newError.addr = "주소를 입력해 주세요.";
    if (!userData.birth) newError.birth = "생년월일을 입력해 주세요.";

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    setError({});
    signUp(userData)
      .then((res) => {
        alert(res.data);
        navigate("../signIn");
      })
      .catch((err) => {
        console.log(err.response.data);
        alert(err.response.data);
      });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
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

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="checkPwd"
              value={checkPwd}
              placeholder="비밀번호를 입력해 주세요."
              onChange={onChange}
              className={error.checkPwd ? "input-error" : ""}
            />
            {userData.pwd !== checkPwd && (
              <p className="error-msg">비밀번호가 다릅니다.</p>
            )}
          </div>

          {/* 이름 */}
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              placeholder="이름을 입력해 주세요."
              onChange={onChange}
              className={error.name ? "input-error" : ""}
            />
            {error.name && <p className="error-msg">{error.name}</p>}
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              placeholder="이메일을 입력해 주세요."
              onChange={onChange}
              className={error.email ? "input-error" : ""}
            />
            {error.email && <p className="error-msg">{error.email}</p>}
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label>전화번호</label>
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              placeholder="전화번호를 입력해 주세요."
              onChange={onChange}
              className={error.phone ? "input-error" : ""}
            />
            {error.phone && <p className="error-msg">{error.phone}</p>}
          </div>

          {/* 성별 */}
          <div className="form-group">
            <label>성별</label>
            <select
              name="gender"
              value={userData.gender}
              onChange={onChangeOption}
              className={error.gender ? "input-error" : ""}
            >
              <option value="">선택</option>
              <option value="MALE">남자</option>
              <option value="FEMALE">여자</option>
            </select>
            {error.gender && <p className="error-msg">{error.gender}</p>}
          </div>

          {/* 주소 */}
          <div className="form-group">
            <label>주소</label>
            <input
              type="text"
              name="addr"
              value={userData.addr}
              placeholder="주소를 입력해 주세요."
              onChange={onChange}
              className={error.addr ? "input-error" : ""}
            />
            {error.addr && <p className="error-msg">{error.addr}</p>}
          </div>

          {/* 생년월일 */}
          <div className="form-group">
            <label>생년월일</label>
            <input
              type="date"
              name="birth"
              value={userData.birth}
              onChange={onChange}
              className={error.birth ? "input-error" : ""}
            />
            {error.birth && <p className="error-msg">{error.birth}</p>}
          </div>

          <button type="submit" className="submit-btn">
            회원 가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpComponent;
