import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../layout/Layout";
import MemberRouter from "./MemberRouter";
import ChatRouter from "./ChatRouter";
import AdminRouter from "./AdminRouter";

const Loading=lazy(()=>import("../component/common/Loading"));
const Main = lazy(() => import("../pages/MainPage"));

const Root = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Suspense fallback={<Loading/>}><Main /></Suspense>
            },
            {
                path: "chat",
                children: ChatRouter()
            },
            {
                path: "admin",
                children: AdminRouter()
            },
            {
                path: "member",
                children: MemberRouter()
            }
        ]
    }
]);

export default Root;