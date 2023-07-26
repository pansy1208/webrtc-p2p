import {Suspense} from "react";
import {Routes,Route} from "react-router-dom";
import router from "@/router/routes";
import type {IRouteObject} from "@/router/type";

const Element = (props: IRouteObject) => {
    const {component: Component} = props

    return <Component />
}
export const createRouter = (router: IRouteObject[]) => {
    return <>
        {
            router.map((item,index) => {
                return <Route path={item.path} key={index} element={<Element {...item} />}>
                    {
                        Array.isArray(item.children) ? createRouter(item.children) : null
                    }
                </Route>
            })
        }
    </>
}

export const RouterView = () => {
    return <Suspense fallback={""}>
        <Routes>
            {createRouter(router)}
        </Routes>
    </Suspense>
}