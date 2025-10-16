import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import memberRouter from "./memberRouter";
const Loading=lazy(()=>import("../common/loading"));
const Main=lazy(()=>import("../pages/mainPage"));

const root =createBrowserRouter([
    {
        path:"/",
        element:<Suspense fallback={<Loading/>}><Main /></Suspense>
    },
    {
        path:"member",
        children:memberRouter()
    }
])
export default root;