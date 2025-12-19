import { lazy } from "react";

const ChatRoomPage = lazy(() => import("../pages/chat/ChatRoomPage"));
const ChatListPage = lazy(() => import("../pages/chat/ChatListPage"));
const ChatMatchingPage = lazy(() => import("../pages/chat/ChatMatchingPage"));

const ChatRouter = () => {
  return [
    {
      path: "room/:roomId/:receiver",
      element: <ChatRoomPage />
    },
    {
      path: "list",
      element: <ChatListPage />
    },
    {
      path: "matching",
      element: <ChatMatchingPage />
    }
  ];
};

export default ChatRouter;
