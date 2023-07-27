import {memo, useEffect, useRef, useState} from "react";
import type {FC} from "react"
import {RoomPCWrapper} from "@/views/room-pc/style";
import WebRTCClient from "@/lib/webrtc-client";
import eventBus from "@/lib/eventBus";
import {EventName} from "@/service/type";


const RoomPC: FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const rtcClient = useRef<WebRTCClient | null>(null)
    const [userList, setUserList] = useState<{}[]>([])
    const [videoStatus, setVideoStatus] = useState<boolean>(true)
    const [audioStatus, setAudioStatus] = useState<boolean>(false)
    const [speakerStatus, setSpeakerStatus] = useState<boolean>(false)

    useEffect(() => {
        rtcClient.current = new WebRTCClient(videoRef.current!, {
            audio: true,
            video: {
                width: {
                    max: 640,
                },
                height: {
                    max: 480
                },
                frameRate: 30
            }
        })
        rtcClient.current.joinRoom({
            username: "qiqi",
            videoStatus: true,
            roomId: "123"
        })

        eventBus.on(EventName.ON_JOIN_ROOM, (data) => {
            console.log(EventName.ON_JOIN_ROOM, data)
            userList.push(data.user)
            setUserList([...userList])
            rtcClient.current?.initRTC(data.userId)
        })

        eventBus.on(EventName.ON_NEW_CLIENT, (data) => {
            console.log(EventName.ON_NEW_CLIENT, data)
        })

        eventBus.on(EventName.ON_VIDEO_STATUS, (data) => {
            console.log(EventName.ON_VIDEO_STATUS, data)
        })

        eventBus.on(EventName.ON_AUDIO_STATUS, (data) => {
            console.log(EventName.ON_AUDIO_STATUS, data)
        })

        eventBus.on(EventName.ON_LEAVE, (data) => {
            console.log(EventName.ON_LEAVE, data)
        })

        return () => {
            rtcClient.current?.close()
            eventBus.clear()
        }
    }, [])

    const toggleVideo = () => {
        let status = !videoStatus
        setVideoStatus(status)
        rtcClient.current?.changeCameraStatus(status)
    }

    const toggleAudio = () => {
        setAudioStatus(!audioStatus)
        rtcClient.current?.changeMicrophoneStatus(audioStatus)
    }

    const toggleSpeaker = () => {
        setSpeakerStatus(!speakerStatus)
    }

    const playShareScreen = () => {
        rtcClient.current?.shareScreen()
    }

    return <RoomPCWrapper>
        <video ref={videoRef} autoPlay></video>
    </RoomPCWrapper>
}

export default memo(RoomPC)