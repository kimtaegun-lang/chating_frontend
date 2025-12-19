import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMemberInfo, deleteMember } from "../../api/MemberApi";
import { updateFormData } from "..";
import Loading from '../common/Loading';
import '../../css/Profile.css';
import '../../css/MemberList.css';

const ProfileComponent = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => 
  JSON.parse(sessionStorage.getItem("userInfo") || "null")
);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [confirmPwd, setConfirmPwd] = useState<string>("");
  const [formData, setFormData] = useState<updateFormData>({
    email: userInfo?.email || "",
    phone: userInfo?.phone || "",
    addr: userInfo?.addr || "",
    currentPwd: "",
    newPwd: ""
  });


  useEffect(() => {
        if (!userInfo) {
            alert('로그인이 필요합니다.');
            navigate('../../member/signIn');
            return;
        }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: updateFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
  if (formData.newPwd) {
    if (formData.newPwd !== confirmPwd) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!formData.currentPwd) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
  }
  
  setLoading(true);
  setIsEditing(false);
  
  const { currentPwd, newPwd, ...basicData } = formData;
  
  const dataToSend = formData.newPwd?.trim() 
    ? formData  
    : basicData; 
  
  updateMemberInfo(dataToSend)
    .then(response => {
      const updatedInfo = response.data.updatedMember
      sessionStorage.removeItem("userInfo");
      sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
       setUserInfo(updatedInfo);
      alert("회원 정보가 수정되었습니다.");
    })
    .catch(error => {
      console.error('회원 상태 조회 실패:', error);   
    });
}
        
  const handleDelete = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) {
      return;
    }

    try {
      await deleteMember();
      alert("회원 탈퇴가 완료되었습니다.");
      sessionStorage.clear();

      navigate("/member/signIn");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "회원 탈퇴에 실패했습니다.");
    }
  };


  if (error) return <div className="error-text">{error}</div>;
  if (!userInfo) return <div className="error-text">회원 정보를 찾을 수 없습니다.</div>;

  return (
    <>
    {loading && <Loading />}
    <div className="main-container">
      <div className="main-content profile-content">
      <h2 className="main-title">👤 내 프로필</h2>

        {!isEditing ? (
          <>
          <div className="profile-card">
          <table className="member-table">
              <tbody>
                <tr>
                  <th className="column-name">아이디</th>
                  <td>{userInfo.memId}</td>
                </tr>
                <tr>
                  <th className="column-name">이름</th>
                  <td>{userInfo.name}</td>
                </tr>
                <tr>
                  <th className="column-name">이메일</th>
                  <td>{userInfo.email}</td>
                </tr>
                <tr>
                  <th className="column-name">전화번호</th>
                  <td>{userInfo.phone}</td>
                </tr>
                <tr>
                  <th className="column-name">주소</th>
                  <td>{userInfo.addr}</td>
                </tr>
                <tr>
                  <th className="column-name">생년월일</th>
                  <td>{userInfo.birth}</td>
                </tr>
                <tr>
                  <th className="column-name">성별</th>
                  <td>{userInfo.gender === "MALE" ? "남성" : "여성"}</td>
                </tr>
                <tr>
                  <th className="column-name">권한</th>
                  <td>

                    {userInfo.role}

                  </td>
                </tr>
                <tr>
                  <th className="column-name">상태</th>
                  <td>{userInfo.status ?? "ACTIVE"}</td>
                </tr>
                <tr>
                  <th className="column-name">가입일</th>
                  <td>{userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              </tbody>
          </table>
          <div className="button-container">
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                정보 수정
              </button>
              <button className="btn btn-delete" onClick={handleDelete}>
                회원 탈퇴
              </button>
            </div>
          </div>
          </>
        ) : (
          <>
          <div className="profile-card">
          <table className="member-table">
              <tbody>
                <tr>
                  <th className="column-name">아이디</th>
                  <td>{userInfo.memId}</td>
                </tr>
                <tr>
                  <th className="column-name">이름</th>
                  <td>{userInfo.name}</td>
                </tr>
                <tr>
                  <th className="column-name">이메일</th>
                  <td>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">전화번호</th>
                  <td>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">주소</th>
                  <td>
                    <input
                      type="text"
                      name="addr"
                      value={formData.addr}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">현재 비밀번호</th>
                  <td>
                    <input
                      type="password"
                      name="currentPwd"
                      value={formData.currentPwd}
                      onChange={handleInputChange}
                      placeholder="현재 비밀번호"
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">새 비밀번호</th>
                  <td>
                    <input
                      type="password"
                      name="newPwd"
                      value={formData.newPwd}
                      onChange={handleInputChange}
                      placeholder="새 비밀번호"
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">새 비밀번호 확인</th>
                  <td>
                    <input
                      type="password"
                      name="confirmPwd"
                      value={confirmPwd}
                      onChange={handleInputChange}
                      placeholder="새 비밀번호 확인"
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">생년월일</th>
                  <td>{userInfo.birth}</td>
                </tr>
                <tr>
                  <th className="column-name">성별</th>
                  <td>{userInfo.gender === "MALE" ? "남성" : "여성"}</td>
                </tr>
              </tbody>
          </table>
          <div className="button-container">
              <button className="btn btn-save" onClick={handleUpdate}>
                저장
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    email: userInfo.email || "",
                    phone: userInfo.phone || "",
                    addr: userInfo.addr || "",
                    currentPwd: "",
                    newPwd: ""
                  });
                }}
              >
                취소
              </button>
          </div>
          </div>
          </>
        )}
      </div>
    </div>
    </>
  ); 
};
      
export default ProfileComponent;