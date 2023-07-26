import {memo} from "react";
import type {ReactNode,FC} from "react"
import {RoomPCWrapper} from "@/views/room-pc/style";

interface IProp {
    children?: ReactNode
}

const RoomPC: FC<IProp> = () => {
    return <RoomPCWrapper>RoomPC</RoomPCWrapper>
}

export default memo(RoomPC)