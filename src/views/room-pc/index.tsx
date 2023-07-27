import {memo, useEffect, useRef, useState} from "react";
import type {FC} from "react"
import {RoomPCWrapper} from "@/views/room-pc/style";
import WebRTCClient from "@/lib/webrtc-client";
import eventBus from "@/lib/eventBus";
import {EventName, INewClientParams} from "@/service/type";
import storage from "@/utils/Storage";


interface IUserInfo {
    audioStatus: boolean
    id: string
    isHasAuth: boolean
    name: string
    videoStatus: boolean
}

const RoomPC: FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const rtcClient = useRef<WebRTCClient | null>(null)
    const [userList, setUserList] = useState<IUserInfo[]>([])
    const [videoStatus, setVideoStatus] = useState<boolean>(true)
    const [audioStatus, setAudioStatus] = useState<boolean>(false)
    const [speakerStatus, setSpeakerStatus] = useState<boolean>(false)

    useEffect(() => {
        const roomInfo = storage.getItem("roomInfo")
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
            username: roomInfo.username,
            videoStatus: true,
            roomId: roomInfo.roomId
        })

        eventBus.on(EventName.ON_JOIN_ROOM, (data) => {
            rtcClient.current!.userId = data.user.id
            setUserList(data.memberList)
        })

        eventBus.on(EventName.ON_NEW_CLIENT, (data: INewClientParams) => {
            userList.push(data.user)
            setUserList([...userList])
            rtcClient.current?.initRTC(data.user.id)
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
        <video ref={videoRef} id={"video_0"} autoPlay muted></video>
        {
            userList.map(user => {
                return <div key={user.id}>
                    <video id={"video_" + user.id} autoPlay></video>
                </div>
            })
        }
    </RoomPCWrapper>
}

export default memo(RoomPC)