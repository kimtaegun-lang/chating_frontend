import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MemberRouter from "./MemberRouter";
import ChatRouter from "./ChatRouter";
import AdminRouter from "./AdminRouter";
const Loading=lazy(()=>import("../common/Loading"));
const Main=lazy(()=>import("../pages/MainPage"));

const Root =createBrowserRouter([
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
    },
    {
        path:"admin",
        children:AdminRouter()
    }
])
export default Root;