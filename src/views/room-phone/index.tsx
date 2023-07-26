import {memo} from "react";
import type {ReactNode,FC} from "react"
import {RoomPhoneWrapper} from "@/views/room-phone/style";

interface IProp {
    children?: ReactNode
}

const RoomPhone: FC<IProp> = () => {
    return <RoomPhoneWrapper>RoomPhone</RoomPhoneWrapper>
}

export default memo(RoomPhone)