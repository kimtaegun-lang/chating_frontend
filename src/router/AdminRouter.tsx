import {lazy,Suspense} from "react";
const MemberListPage =lazy(()=>import("../pages/admin/MemberListPage"));
const MemberDetailComponent=lazy(()=>import("../pages/admin/MemberDetailPage"));
const AdminChatListPage=lazy(()=>import("../pages/admin/AdminChatListPage"));
const AdminChatRoomPage=lazy(()=>import("../pages/admin/AdminChatRoomPage"));
const Loading=lazy(()=>import("../common/Loading"));
const AdminRouter = () => {
   return [
        {
            path:"memberList",
            element:<Suspense fallback={<Loading />}><MemberListPage/></Suspense>
        },
        {
            path:"member/:memberId",
            element:<Suspense fallback={<Loading />}><MemberDetailComponent/></Suspense>
        },
           {
            path: "member/:memberId/chat",
            element: <Suspense fallback={<Loading />}><AdminChatListPage/></Suspense>
        },
        {
            path: "member/:memberId/chat/:roomId/:receiver",
            element: <Suspense fallback={<Loading />}><AdminChatRoomPage/></Suspense>
        }
    ]
}
export default AdminRouter;