import {memo} from "react";
import type {ReactNode,FC} from "react"
import {HomeWrapper} from "@/views/home/style";

interface IProp {
    children?: ReactNode
}

const Home: FC<IProp> = () => {
    return <HomeWrapper>Home</HomeWrapper>
}

export default memo(Home)