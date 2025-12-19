import { lazy } from "react";

const MemberListPage = lazy(() => import("../pages/admin/MemberListPage"));
const MemberDetailPage = lazy(() => import("../pages/admin/MemberDetailPage"));
const AdminChatListPage = lazy(() => import("../pages/admin/AdminChatListPage"));
const AdminChatRoomPage = lazy(() => import("../pages/admin/AdminChatRoomPage"));

const AdminRouter = () => {
  return [
    {
      path: "memberList",
      element: <MemberListPage />
    },
    {
      path: "member/:memberId",
      element: <MemberDetailPage />
    },
    {
      path: "member/:memberId/chat",
      element: <AdminChatListPage />
    },
    {
      path: "member/:memberId/chat/:roomId/:receiver",
      element: <AdminChatRoomPage />
    }
  ];
};

export default AdminRouter;
