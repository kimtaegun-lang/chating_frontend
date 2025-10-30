import { useEffect, useState } from "react";
import { getMemberDetail } from "../../api/AdminApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from '../../store/store';
import '../../css/MemberList.css';

const MemberDetailComponent = ({ memberId }: { memberId: string }) => {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
   const { user } = useSelector((state: RootState) => state.auth);
  const navigate=useNavigate();
  useEffect(() => {

    if(user?.role!=='ADMIN')
        {
            alert('관리자만 접근 가능합니다.');
            navigate(-1);
            return;
        }

    if (!memberId) return;

    setLoading(true);
    getMemberDetail(memberId)
      .then((res) => {
        setMember(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("회원 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [memberId]);

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
      <h2 className="main-title">👤 회원 상세 정보</h2>
      <table className="member-table">
        <tbody>
          <tr>
            <th style={{ color: "black" }}>아이디</th>
            <td>{member.memId}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>이름</th>
            <td>{member.name}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>이메일</th>
            <td>{member.email}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>전화번호</th>
            <td>{member.phone}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>주소</th>
            <td>{member.addr}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>생년월일</th>
            <td>{member.birth}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>성별</th>
            <td>{member.gender === "MALE" ? "남성" : "여성"}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>권한</th>
            <td>{member.role}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>상태</th>
            <td>{member.status ?? "ACTIVE"}</td>
          </tr>
          <tr>
            <th style={{ color: "black" }}>가입일</th>
            <td>{new Date(member.createdAt).toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);
};

export default MemberDetailComponent;
