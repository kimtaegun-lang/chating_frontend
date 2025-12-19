import { lazy } from "react";

const SignInPage = lazy(() => import("../pages/member/SignInPage"));
const SignUpPage = lazy(() => import("../pages/member/SignUpPage"));
const ProfilePage = lazy(() => import("../pages/member/ProfilePage"));

const MemberRouter = () => {
  return [
    {
      path: "signIn",
      element: <SignInPage />
    },
    {
      path: "signUp",
      element: <SignUpPage />
    },
    {
      path: "profile",
      element: <ProfilePage />
    }
  ];
};

export default MemberRouter;
