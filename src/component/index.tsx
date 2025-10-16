export interface userInfo {
    memId: string,
    pwd: string,
    name: string,
    email: string,
    phone: string,
    gender: string,
    addr: string,
    birth: string,
}

export interface errors {
    [key:string]: string
}

export interface signInData {
    memId: string;
    pwd: string;
}//