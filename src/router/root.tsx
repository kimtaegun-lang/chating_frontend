import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MemberRouter from "./MemberRouter";
import ChatRouter from "./ChatRouter";
const Loading=lazy(()=>import("../common/Loading"));
const Main=lazy(()=>import("../pages/MainPage"));

const root =createBrowserRouter([
    {
        path:"/",
        element:<Suspense fallback={<Loading/>}><Main /></Suspense>
    },
    {
        path:"member",
        children:MemberRouter()
    },
    {
        path:"chat",
        children:ChatRouter()
    }
])
export default root;