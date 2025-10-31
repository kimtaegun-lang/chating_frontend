import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { clearUser, setUser } from "../../store/authSlice";
import { updateMemberInfo, deleteMember, validateAndGetUserInfo } from "../../api/MemberApi";
import { updateMemberData, updateFormData } from "..";
import '../../css/Profile.css';
import '../../css/MemberList.css';

const ProfileComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<updateFormData>({
    email: user?.email || "",
    phone: user?.phone || "",
    addr: user?.addr || "",
    currentPwd: "",
    newPwd: "",
    confirmPwd: "",
  });

  const refreshUserInfo = async () => {
    try {
      const res = await validateAndGetUserInfo();
      dispatch(setUser(res.data.userInfo));
    } catch (err) {
      console.error("회원 정보 갱신 실패:", err);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('userInfo');
    const sessionUser = stored ? JSON.parse(stored) : null;
    const effectiveUser = user ?? sessionUser;

    if (!effectiveUser) {
      alert("로그인이 필요합니다.");
      navigate("/member/signIn");
      return;
    }

    setFormData({
      email: effectiveUser.email || "",
      phone: effectiveUser.phone || "",
      addr: effectiveUser.addr || "",
      currentPwd: "",
      newPwd: "",
      confirmPwd: "",
    });
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: updateFormData) => ({
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
      setLoading(true);

      const updateData: updateMemberData = {
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

      await refreshUserInfo();

      setIsEditing(false);
      setFormData((prev: updateFormData) => ({
        ...prev,
        currentPwd: "",
        newPwd: "",
        confirmPwd: "",
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "회원 정보 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await deleteMember();
      alert("회원 탈퇴가 완료되었습니다.");

      dispatch(clearUser());
      localStorage.clear();

      navigate("/member/signIn");
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
  if (!user) return <div className="error-text">회원 정보를 찾을 수 없습니다.</div>;

  return (
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
                  <td>{user.memId}</td>
                </tr>
                <tr>
                  <th className="column-name">이름</th>
                  <td>{user.name}</td>
                </tr>
                <tr>
                  <th className="column-name">이메일</th>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <th className="column-name">전화번호</th>
                  <td>{user.phone}</td>
                </tr>
                <tr>
                  <th className="column-name">주소</th>
                  <td>{user.addr}</td>
                </tr>
                <tr>
                  <th className="column-name">생년월일</th>
                  <td>{user.birth}</td>
                </tr>
                <tr>
                  <th className="column-name">성별</th>
                  <td>{user.gender === "MALE" ? "남성" : "여성"}</td>
                </tr>
                <tr>
                  <th className="column-name">권한</th>
                  <td>

                    {user.role}

                  </td>
                </tr>
                <tr>
                  <th className="column-name">상태</th>
                  <td>{user.status ?? "ACTIVE"}</td>
                </tr>
                <tr>
                  <th className="column-name">가입일</th>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
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
                  <td>{user.memId}</td>
                </tr>
                <tr>
                  <th className="column-name">이름</th>
                  <td>{user.name}</td>
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
                      placeholder="비밀번호 변경 시 입력"
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
                      placeholder="변경하지 않으려면 비워두세요"
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
                      value={formData.confirmPwd}
                      onChange={handleInputChange}
                      placeholder="새 비밀번호 확인"
                      className="profile-input"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="column-name">생년월일</th>
                  <td>{user.birth}</td>
                </tr>
                <tr>
                  <th className="column-name">성별</th>
                  <td>{user.gender === "MALE" ? "남성" : "여성"}</td>
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
                    email: user.email || "",
                    phone: user.phone || "",
                    addr: user.addr || "",
                    currentPwd: "",
                    newPwd: "",
                    confirmPwd: "",
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
  );
};

export default ProfileComponent;