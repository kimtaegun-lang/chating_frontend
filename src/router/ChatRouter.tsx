import {lazy,Suspense} from "react";
const ChatRoomPage =lazy(()=>import("../pages/ChatRoomPage"));
const Loading=lazy(()=>import("../common/Loading"));
const ChatRouter = () => {
   return [
        {
            path:"room",
            element:<Suspense fallback={<Loading />}><ChatRoomPage/></Suspense>
        }
    ]
}
export default ChatRouter;