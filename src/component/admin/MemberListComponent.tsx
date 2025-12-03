import React, { useEffect, useState } from 'react';
import { getMembers, updateMemberStatus, deleteMember } from "../../api/AdminApi";
import { useNavigate } from 'react-router-dom';
import '../../css/MemberList.css';
import Loading from '../../common/Loading';
import SearchComponent from '../common/SearchComponent';
import PageComponent from '../common/PageComponent';
import { searchOptions } from '..';

const MemberListComponent = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "null");
    const [searchOptions, setSearchOptions] = useState<searchOptions>({
        search: "",
        searchType: "",
        sort: "createdAt",
        sortType: "desc"
    });

    // 클라이언트 사이드 정렬 상태
    const [clientSort, setClientSort] = useState<{ field: string, order: 'asc' | 'desc' } | null>(null);

    // 초기 로딩 (세션 값으로 즉시 판정)
    useEffect(() => {

        if (userInfo.role !== 'ADMIN') {
            alert('관리자만 접근 가능합니다.');
            navigate(-1);
            return;
        }
        fetchMembers(0);
    }, []);

    const onSearchClick = () => {
        setCurrentPage(0);
        setClientSort(null); // 서버 검색 시 클라이언트 정렬 초기화
        fetchMembers(0);
    };

    // 테이블 헤더 클릭 - 클라이언트 정렬
    const handleClientSort = (field: string) => {
        setClientSort(prev => {
            if (prev?.field === field) {
                return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
            }
            return { field, order: 'desc' };
        });
    };

    // 클라이언트 정렬 적용
    const getSortedMembers = () => {
        if (!clientSort) return members;

        return [...members].sort((a, b) => {
            let aVal = a[clientSort.field];
            let bVal = b[clientSort.field];

            // 날짜 비교
            if (clientSort.field === 'createdAt') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (clientSort.order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    };

    // 회원 목록 조회
    const fetchMembers = async (page: number = 0): Promise<void> => {
        setLoading(true);
        try {
            const response = await getMembers(page, 10, searchOptions);
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

    // 채팅 내역 확인
    const handleChatHistory = (memberId: string): void => {
        navigate(`/admin/member/${memberId}/chat`);
    };

    // 채팅 내역 확인
    const handleQnAHistory = (memberId: string): void => {
        navigate(`/admin/member/${memberId}/chat`);
    };

    // 페이지 변경
    const handlePageChange = (page: number): void => {
        if (page >= 0 && page < totalPages) {
            setClientSort(null); // 페이지 변경 시 클라이언트 정렬 초기화
            fetchMembers(page);
        }
    };



    if (loading) {
        <Loading/>
    }

    const sortedMembers = getSortedMembers();

    return (
        <div className="main-container">
            <div className="main-content">
                <h2 className="main-title">👥 회원 관리</h2>
                <SearchComponent
                    searchOption={searchOptions}
                    setSearchOptions={setSearchOptions}
                    onSearchClick={onSearchClick}
                />
                <div className="user-section">
                    <p className="welcome-text">
                        전체 <span className="username">{totalElements}</span>명의 회원이 있습니다
                    </p>
                </div>

                <div className="member-table-wrapper">
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleClientSort('memId')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    아이디 {clientSort?.field === 'memId' && (clientSort.order === 'desc' ? '▼' : '▲')}
                                </th>
                                <th
                                    onClick={() => handleClientSort('name')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    이름 {clientSort?.field === 'name' && (clientSort.order === 'desc' ? '▼' : '▲')}
                                </th>
                                <th
                                    onClick={() => handleClientSort('email')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    이메일 {clientSort?.field === 'email' && (clientSort.order === 'desc' ? '▼' : '▲')}
                                </th>
                                <th>성별</th>
                                <th>권한</th>
                                <th>상태</th>
                                <th
                                    onClick={() => handleClientSort('createdAt')}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    가입일 {clientSort?.field === 'createdAt' && (clientSort.order === 'desc' ? '▼' : '▲')}
                                </th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map((member: any) => (
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
                                    <td>
                                        <span className={`status-badge ${member.status === 'ACTIVE' ? 'status-active' : 'status-banned'}`}>
                                            {member.status === 'ACTIVE' ? '활성' : '정지'}
                                        </span>
                                    </td>
                                    <td>{new Date(member.createdAt).toLocaleString()}</td>
                                    <td>
                                        <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleDetail(member.memId)}
                                            >
                                                상세보기
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleChatHistory(member.memId)}
                                            >
                                                채팅내역
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

                <PageComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default MemberListComponent;