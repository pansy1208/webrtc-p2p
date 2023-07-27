import {memo, useEffect, useRef} from "react";
import type {FC} from "react"
import {RoomPCWrapper} from "@/views/room-pc/style";
import WebRTCClient from "@/lib/webrtc-client";
import eventBus from "@/lib/eventBus";
import {EventName} from "@/service/type";


const RoomPC: FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const client = useRef<WebRTCClient | null>(null)
    useEffect(() => {
        client.current = new WebRTCClient(videoRef.current!)
        console.log(client.current)
        client.current.joinRoom({
            username: "qiqi",
            videoStatus: true,
            roomId: "123"
        })

        eventBus.on(EventName.ON_JOIN_ROOM, (data) => {
            console.log(EventName.ON_JOIN_ROOM, data)
        })

        eventBus.on(EventName.ON_VIDEO_STATUS, (data) => {
            console.log(EventName.ON_VIDEO_STATUS, data)
        })

        eventBus.on(EventName.ON_AUDIO_STATUS, (data) => {
            console.log(EventName.ON_AUDIO_STATUS, data)
        })

        eventBus.on(EventName.ON_LEAVE_ROOM, (data) => {
            console.log(EventName.ON_LEAVE_ROOM, data)
        })

        return () => {
            client.current?.close()
            eventBus.clear()
        }
    }, [])

    return <RoomPCWrapper>
        <video ref={videoRef} autoPlay></video>
    </RoomPCWrapper>
}

export default memo(RoomPC)