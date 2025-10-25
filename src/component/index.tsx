export interface userInfo { // 회원 정보 객체
    memId: string,
    pwd: string,
    name: string,
    email: string,
    phone: string,
    gender: string,
    addr: string,
    birth: string,
}

export interface signInData { // 로그인 데이터
    memId: string;
    pwd: string;
}

export interface message {  // 채팅 메시지 객체
    sender: string;      
    receiver: string;   
    content: string;     
    createdAt: string;
  chatId?: number ;
    type?: string;
}

export interface chatRoom { // 채팅방
    roomId: number;
    receiver: string;
    createdAt: string;
}

export interface searchOptions {
    search: string,
     searchType:string,
     sort:string,
     sortType:string
}