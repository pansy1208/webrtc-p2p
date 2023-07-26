export interface IRouteObject {
    path: string
    component: any
    meta?: object
    children?: IRouteObject[]
}