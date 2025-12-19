import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MemberRouter from "./MemberRouter";
import ChatRouter from "./ChatRouter";
import AdminRouter from "./AdminRouter";

const Loading = lazy(() => import("../component/common/Loading"));
const Layout = lazy(() => import("../layout/Layout"));
const Main = lazy(() => import("../pages/MainPage"));

const Root = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Main />
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
