import {lazy,Suspense} from "react";
const MemberListPage =lazy(()=>import("../pages/MemberListPage"));
const StatisticsPage=lazy(()=>import("../pages/StatisticsPage"));
const MemberDetailComponent=lazy(()=>import("../pages/MemberDetailPage"));
const Loading=lazy(()=>import("../common/Loading"));
const AdminRouter = () => {
   return [
        {
            path:"memberList",
            element:<Suspense fallback={<Loading />}><MemberListPage/></Suspense>
        },
        {
            path:"statistics",
            element:<Suspense fallback={<Loading />}><StatisticsPage/></Suspense>
        },
        {
            path:"member/:memberId",
            element:<Suspense fallback={<Loading />}><MemberDetailComponent/></Suspense>
        }
    ]
}
export default AdminRouter;