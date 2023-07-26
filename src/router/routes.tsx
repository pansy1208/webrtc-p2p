import {lazy} from "react";
import {Navigate} from "react-router-dom";
import type {IRouteObject} from "@/router/type";

const Home = lazy(() => import("@/views/home"))
const RoomPC = lazy(() => import("@/views/room-pc"))
const RoomPhone = lazy(() => import("@/views/room-phone"))

const router: IRouteObject[] = [
    {
        path: "/",
        component: () => <Navigate to="/home"/>
    },
    {
        path: "/home",
        component: Home
    }, {
        path: "/room-pc",
        component: RoomPC
    }, {
        path: "/room-phone",
        component: RoomPhone
    }
]

export default router