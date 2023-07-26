import {memo} from "react";
import type {FC} from "react"
import {RoomPhoneWrapper} from "@/views/room-phone/style";

const RoomPhone: FC = () => {
    return <RoomPhoneWrapper>RoomPhone</RoomPhoneWrapper>
}

export default memo(RoomPhone)