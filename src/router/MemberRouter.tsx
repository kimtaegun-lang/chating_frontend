import {lazy,Suspense} from "react";
const SignInPage =lazy(()=>import("../pages/member/SignInPage"));
const SignUpPage=lazy(()=>import("../pages/member/SignUpPage"));
const ProfilePage=lazy(()=>import("../pages/member/ProfilePage"));
const Loading=lazy(()=>import("../component/common/Loading"));
const MemberRouter = () => {
   return [
        {
            path:"signIn",
            element:<Suspense fallback={<Loading />}><SignInPage/></Suspense>
        },
        {
            path:"signUp",
            element:<Suspense fallback={<Loading />}><SignUpPage/></Suspense>
        },
        {
            path:"profile",
            element:<Suspense fallback={<Loading/>}><ProfilePage/></Suspense>
        }
    ]
}
export default MemberRouter;