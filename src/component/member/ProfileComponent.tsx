import { useEffect, useState } from "react";
import { getUserInfo, updateMemberInfo, deleteMember } from "../../api/MemberApi";
import '../../css/MemberList.css';

interface UpdateFormData {
  email: string;
  phone: string;
  addr: string;
  currentPwd: string;
  newPwd: string;
  confirmPwd: string;
}

const ProfileComponent = () => {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateFormData>({
    email: "",
    phone: "",
    addr: "",
    currentPwd: "",
    newPwd: "",
    confirmPwd: "",
  });

  useEffect(() => {
    setLoading(true);
    getUserInfo()
      .then((res) => {
        const memberData = res.data.data;
        setMember(memberData);
        setFormData({
          email: memberData.email || "",
          phone: memberData.phone || "",
          addr: memberData.addr || "",
          currentPwd: "",
          newPwd: "",
          confirmPwd: "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("회원 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    if (formData.newPwd) {
      if (formData.newPwd !== formData.confirmPwd) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
      }
      if (!formData.currentPwd) {
        alert("현재 비밀번호를 입력해주세요.");
        return;
      }
    }

    try {
      const updateData: any = {
        email: formData.email,
        phone: formData.phone,
        addr: formData.addr,
      };

      if (formData.newPwd) {
        updateData.currentPwd = formData.currentPwd;
        updateData.newPwd = formData.newPwd;
      }

      await updateMemberInfo(updateData);
      alert("회원 정보가 수정되었습니다.");
      setIsEditing(false);
      
      const res = await getUserInfo();
      setMember(res.data.data);
      
      setFormData(prev => ({
        ...prev,
        currentPwd: "",
        newPwd: "",
        confirmPwd: "",
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "회원 정보 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await deleteMember();
      alert("회원 탈퇴가 완료되었습니다.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "회원 탈퇴에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-inner"></div>
          </div>
          <p className="loading-text">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="error-text">{error}</div>;
  if (!member) return <div className="error-text">회원 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="main-container">
      <div className="main-content">
        <h2 className="main-title">👤 내 프로필</h2>
        
        {!isEditing ? (
          <>
            <table className="member-table">
              <tbody>
                <tr>
                  <th className="column-name">아이디</th>
                  <td>{member.memId}</td>
                </tr>
                <tr>
                  <th className="column-name">이름</th>
                  <td>{member.name}</td>
                </tr>
                <tr>
                  <th className="column-name">이메일</th>
                  <td>{member.email}</td>
                </tr>
                <tr>
                  <th className="column-name">전화번호</th>
                  <td>{member.phone}</td>
                </tr>
                <tr>
                  <th className="column-name">주소</th>
                  <td>{member.addr}</td>
                </tr>
                <tr>
                  <th className="column-name">생년월일</th>
                  <td>{member.birth}</td>
                </tr>
                <tr>
                  <th className="column-name">성별</th>
                  <td>{member.gender === "MALE" ? "남성" : "여성"}</td>
                </tr>
                <tr>
                  <th className="column-name">권한</th>
                  <td>
                    <span className={`role-badge ${member.role === "ADMIN" ? "role-admin" : "role-user"}`}>
                      {member.role}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="column-name">상태</th>
                  <td>{member.status ?? "ACTIVE"}</td>
                </tr>
                <tr>
                  <th className="column-name">가입일</th>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button 
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "10px 20px",
                  marginRight: "10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                정보 수정
              </button>
              <button 
                onClick={handleDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                회원 탈퇴
              </button>
            </div>
          </>
        ) : (
          <>
            <table className="member-table">
              <tbody>
                <tr>
                  <th className="column-name">아이디</th>
                  <td>{member.memId}</td>
                </tr>
                <tr>
                  <th className="column-name">이름</th>
                  <td>{member.name}</td>
                </tr>
                <tr>
                  <th className="column-name">이메일</th>
                  <td>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ width: "100%", padding: "8px" }}
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
                      style={{ width: "100%", padding: "8px" }}
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
                      style={{ width: "100%", padding: "8px" }}
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
                      placeholder="비밀번호 변경 시 입력"
                      style={{ width: "100%", padding: "8px" }}
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
                      placeholder="변경하지 않으려면 비워두세요"
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">새 비밀번호 확인</th>
                  <td>
                    <input
                      type="password"
                      name="confirmPwd"
                      value={formData.confirmPwd}
                      onChange={handleInputChange}
                      placeholder="새 비밀번호 확인"
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">생년월일</th>
                  <td>{member.birth}</td>
                </tr>
                <tr>
                  <th className="column-name">성별</th>
                  <td>{member.gender === "MALE" ? "남성" : "여성"}</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button 
                onClick={handleUpdate}
                style={{
                  padding: "10px 20px",
                  marginRight: "10px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                저장
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    email: member.email || "",
                    phone: member.phone || "",
                    addr: member.addr || "",
                    currentPwd: "",
                    newPwd: "",
                    confirmPwd: "",
                  });
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#9E9E9E",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileComponent;
