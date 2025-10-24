import {lazy,Suspense} from "react";
const SignInPage =lazy(()=>import("../pages/SignInPage"));
const SignUpPage=lazy(()=>import("../pages/SignUpPage"));
const Loading=lazy(()=>import("../common/Loading"));
const MemberRouter = () => {
   return [
        {
            path:"signIn",
            element:<Suspense fallback={<Loading />}><SignInPage/></Suspense>
        },
        {
            path:"signUp",
            element:<Suspense fallback={<Loading />}><SignUpPage/></Suspense>
        }
    ]
}
export default MemberRouter;