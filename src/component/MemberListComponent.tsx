// src/pages/admin/MemberList.tsx
import React, { useEffect, useState } from 'react';
import { getMembers, updateMemberStatus, deleteMember } from '../api/AdminApi';
import { useNavigate } from 'react-router-dom';
import '../MemberList.css'

const MemberListComponent: React.FC = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // 회원 목록 조회
    const fetchMembers = async (page: number = 0): Promise<void> => {
        setLoading(true);
        try {
            const response = await getMembers(page, 10);
            const data = response.data.data;
            
            setMembers(data.content);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error('회원 목록 조회 실패:', error);
            alert('회원 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 회원 상태 변경
    const handleStatusChange = async (memberId: string, currentStatus: string): Promise<void> => {
        const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        const confirmMessage = newStatus === 'BANNED' 
            ? '이 회원을 정지하시겠습니까?' 
            : '이 회원의 정지를 해제하시겠습니까?';
        
        if (!window.confirm(confirmMessage)) return;

        try {
            await updateMemberStatus(memberId, newStatus);
            alert('회원 상태가 변경되었습니다.');
            fetchMembers(currentPage);
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    // 회원 삭제
    const handleDelete = async (memberId: string): Promise<void> => {
        if (!window.confirm('정말 이 회원을 삭제하시겠습니까?')) return;

        try {
            await deleteMember(memberId);
            alert('회원이 삭제되었습니다.');
            fetchMembers(currentPage);
        } catch (error) {
            console.error('회원 삭제 실패:', error);
            alert('회원 삭제에 실패했습니다.');
        }
    };

    // 회원 상세 보기
    const handleDetail = (memberId: string): void => {
        navigate(`/admin/member/${memberId}`);
    };

    // 페이지 변경
    const handlePageChange = (page: number): void => {
        if (page >= 0 && page < totalPages) {
            fetchMembers(page);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

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

    return (
        <div className="main-container">
            <div className="main-content">
                <h2 className="main-title">👥 회원 관리</h2>
                
                <div className="user-section">
                    <p className="welcome-text">
                        전체 <span className="username">{totalElements}</span>명의 회원이 있습니다
                    </p>
                </div>

                <div className="member-table-wrapper">
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th>아이디</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>성별</th>
                                <th>권한</th>
                                <th>가입일</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member: any) => (
                                <tr key={member.memId}>
                                    <td>{member.memId}</td>
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.gender === 'MALE' ? '남성' : '여성'}</td>
                                    <td>
                                        <span className={`role-badge ${member.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="button-group">
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleDetail(member.memId)}
                                            >
                                                상세보기
                                            </button>
                                            <button 
                                                className={`btn btn-sm ${member.status === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}`}
                                                onClick={() => handleStatusChange(member.memId, member.status)}
                                            >
                                                {member.status === 'ACTIVE' ? '정지' : '해제'}
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(member.memId)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button 
                        className="btn btn-outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        이전
                    </button>
                    <span className="page-info">
                        <span className="username">{currentPage + 1}</span> / {totalPages}
                    </span>
                    <button 
                        className="btn btn-outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberListComponent;