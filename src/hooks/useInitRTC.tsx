import {useEffect} from "react";
import storage from "@/utils/Storage";
import {IRTCConnectionParams} from "@/lib/type";
import WebRTCClient from "@/lib/webrtc-client";
import eventBus from "@/lib/eventBus";
import {EventName, IJoinResult, INewClientParams, IStatusParams} from "@/service/type";

export const useInitRTC = () => {
    // useEffect(() => {
    //     const roomInfo = storage.getItem("roomInfo")
    //     const isVideo = roomInfo.roomType === 1
    //     setRoomType(roomInfo.roomType)
    //     setVideoStatus(isVideo)
    //     setMeetingType(roomInfo.meetingType ? 1 : 0)
    //     const turnInfo = storage.getItem("turnInfo", true)
    //     let turnServer: IRTCConnectionParams
    //     if (turnInfo) {
    //         turnServer = {
    //             iceTransportPolicy: turnInfo.iceTransportPolicy,
    //             iceServer: [{
    //                 urls: turnInfo.turnServer,
    //                 username: turnInfo.turnAccount,
    //                 credential: turnInfo.turnPassword
    //             }]
    //         }
    //     } else {
    //         turnServer = {}
    //     }
    //     const videoDom = document.getElementById("video_0") as HTMLVideoElement
    //     rtcClient.current = new WebRTCClient(videoDom, turnServer, {
    //         audio: true,
    //         video: isVideo ? {
    //             width: 640,
    //             height: 480,
    //             frameRate: 30
    //         } : false
    //     })
    //     rtcClient.current?.joinRoom({
    //         username: roomInfo.username,
    //         videoStatus: isVideo && roomInfo.openCamera,
    //         roomId: roomInfo.roomId
    //     })
    //
    //     eventBus.on(EventName.ON_JOIN_ROOM, (data: IJoinResult) => {
    //         console.log(data)
    //         if (!data.user.videoStatus) {
    //             toggleVideo()
    //         }
    //         rtcClient.current!.userId = data.user.id
    //         setClient(data.user)
    //         clientRef.current = data.user
    //         const list = data.memberList.filter(item => {
    //             return item.id !== data.user.id
    //         })
    //         userListRef.current = list
    //         setUserList(list)
    //     })
    //
    //     eventBus.on(EventName.ON_NEW_CLIENT, (data: INewClientParams) => {
    //         userListRef.current.push(data.user)
    //         setUserList([...userListRef.current])
    //         rtcClient.current?.initRTC(data.user.id)
    //     })
    //
    //     eventBus.on(EventName.ON_VIDEO_STATUS, (data: IStatusParams) => {
    //         for (let i = 0; i < userListRef.current.length; i++) {
    //             if (userListRef.current[i].id === data.userId) {
    //                 userListRef.current[i].videoStatus = data.status
    //                 break
    //             }
    //         }
    //         setUserList([...userListRef.current])
    //     })
    //
    //     eventBus.on(EventName.ON_AUDIO_STATUS, (data: IStatusParams) => {
    //         console.log(EventName.ON_AUDIO_STATUS, data)
    //         for (let i = 0; i < userListRef.current.length; i++) {
    //             if (userListRef.current[i].id === data.userId) {
    //                 userListRef.current[i].audioStatus = data.status
    //                 break
    //             }
    //         }
    //         setUserList([...userListRef.current])
    //     })
    //
    //     eventBus.on(EventName.ON_LEAVE, (data: { id: string }) => {
    //         setLeaveUserId(data.id)
    //         userListRef.current.forEach((item, index) => {
    //             if (item.id === data.id) {
    //                 userListRef.current.splice(index, 1)
    //             }
    //         })
    //         setUserList([...userListRef.current])
    //     })
    //
    //     return () => {
    //         eventBus.clear()
    //         rtcClient.current?.close()
    //     }
    //
    // }, [])
}