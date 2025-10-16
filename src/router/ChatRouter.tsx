import {lazy,Suspense} from "react";
const ChatPage =lazy(()=>import("../pages/ChatPage"));
const Loading=lazy(()=>import("../common/Loading"));
const ChatRouter = () => {
   return [
        {
            path:"room",
            element:<Suspense fallback={<Loading />}><ChatPage/></Suspense>
        }
    ]
}
export default ChatRouter;