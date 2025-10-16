import {lazy,Suspense} from "react";
const SignInPage =lazy(()=>import("../pages/signInPage"));
const SignUpPage=lazy(()=>import("../pages/signUpPage"));
const Loading=lazy(()=>import("../common/loading"));
const memberRouter = () => {
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
export default memberRouter