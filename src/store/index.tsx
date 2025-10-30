
// Enum 타입 정의
export type Gender = 'MALE' | 'FEMALE';
export type Role = 'USER' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE' | 'BANNED';

// 회원 정보
export interface userInfo {
    memId: string;
    name: string;
    email: string;
    phone: string;
    addr: string;
    birth: string;        
    gender: Gender;        
    role: Role;           
    status: Status;        
    createdAt: string;      
}

export interface authState {
    isLoggedIn: boolean;
    user: userInfo | null;
}