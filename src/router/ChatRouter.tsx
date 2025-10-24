import {lazy,Suspense} from "react";
const ChatRoomPage =lazy(()=>import("../pages/chat/ChatRoomPage"));
const ChatListPage =lazy(()=>import("../pages/chat/ChatListPage"));
const ChatMatchingPage =lazy(()=>import("../pages/chat/ChatMatchingPage"));
const Loading=lazy(()=>import("../common/Loading"));
const ChatRouter = () => {
   return [
        {
            path:"room/:roomId/:receiver",
            element:<Suspense fallback={<Loading />}><ChatRoomPage/></Suspense>
        },
        {
            path:"list",
            element:<Suspense fallback={<Loading />}><ChatListPage/></Suspense>
        },
        {
            path:"matching",
            element:<Suspense fallback={<Loading />}><ChatMatchingPage/></Suspense>
        }
    ]
}
export default ChatRouter;