import {memo, useEffect, useRef, useState} from "react";
import type {FC} from "react"
import {useNavigate} from "react-router-dom";
import {RoomPhoneWrapper} from "@/views/room-phone/style";
import classNames from "classnames";
import type {IJoinResult, IUserInfo, INewClientParams, IStatusParams} from "@/service/type";
import type {IRTCConnectionParams} from "@/lib/type";
import eventBus from "@/lib/eventBus";
import {EventName} from "@/service/type";
import WebRTCClient from "@/lib/webrtc-client";
import storage from "@/utils/Storage";
import mute from "@/assets/img/mic_mute.png"
import exit from "@/assets/img/exit.png"
import mic_off from "@/assets/img/mic_off.png"
import mic_on from "@/assets/img/mic_on.png"
import speaker_off from "@/assets/img/speaker_off.png"
import speaker_on from "@/assets/img/speaker_on.png"
import video_on from "@/assets/img/video_on.png"
import video_off from "@/assets/img/video_off.png"
import defaultAvatar from "@/assets/img/defaultAvatar.svg"
import reverseCamera from "@/assets/img/reverse.png"
import reverseCameraWhite from "@/assets/img/reverse_white.png"
import utils from "@/utils/Utils";

const RoomPhone: FC = () => {
    const navigate = useNavigate()

    const clientWidth: number = document.body.clientWidth
    const clientHeight: number = document.body.clientHeight - 70

    const rtcClient = useRef<WebRTCClient | null>(null)
    const [client, setClient] = useState<IUserInfo>({
        id: "",
        name: "",
        videoStatus: true,
        audioStatus: true,
        isHasAuth: true,
        isShareScreen: false
    })
    const areaBox = useRef<HTMLDivElement>(null)
    const clientRef = useRef<IUserInfo>(client)
    const [userList, setUserList] = useState<IUserInfo[]>([])
    const userListRef = useRef<IUserInfo[]>(userList)
    const [videoStatus, setVideoStatus] = useState(true)
    const [audioStatus, setAudioStatus] = useState(false)
    const [speakerStatus, setSpeakerStatus] = useState(true)
    const [zoomIndex, setZoomIndex] = useState(-1)
    const [isShowErrorTip, setIsShowErrorTip] = useState(false)
    const [exitTips, setExitTips] = useState("")
    const [message, setMessage] = useState("")
    const [meetingType, setMeetingType] = useState(1)
    const [roomType, setRoomType] = useState(1)
    const [isShowToolbar, setIsShowToolbar] = useState(true)
    const [isZoomVideo, setIsZoomVideo] = useState(false)
    const [isUser, setIsUser] = useState(true)
    const [currentZoomVideoId, setCurrentZoomVideoId] = useState("")
    const [leaveUserId, setLeaveUserId] = useState("")
    const [isLarge, setIsLarge] = useState(false)

    useEffect(() => {
        const roomInfo = storage.getItem("roomInfo")
        const isVideo = roomInfo.roomType === 1
        setRoomType(roomInfo.roomType)
        setVideoStatus(isVideo)
        setMeetingType(roomInfo.meetingType ? 1 : 0)
        const turnInfo = storage.getItem("turnInfo", true)
        let turnServer: IRTCConnectionParams
        if (turnInfo) {
            turnServer = {
                iceTransportPolicy: turnInfo.iceTransportPolicy,
                iceServer: [{
                    urls: turnInfo.turnServer,
                    username: turnInfo.turnAccount,
                    credential: turnInfo.turnPassword
                }]
            }
        } else {
            turnServer = {}
        }
        const videoDom = document.getElementById("video_0") as HTMLVideoElement
        rtcClient.current = new WebRTCClient(videoDom, turnServer, {
            audio: true,
            video: isVideo ? {
                width: 640,
                height: 480,
                frameRate: 30
            } : false
        })
        rtcClient.current?.joinRoom({
            username: roomInfo.username,
            videoStatus: isVideo && roomInfo.openCamera,
            roomId: roomInfo.roomId
        })

        eventBus.on(EventName.ON_JOIN_ROOM, (data: IJoinResult) => {
            if (!data.user.videoStatus && isVideo) {
                toggleVideo()
            }
            rtcClient.current!.userId = data.user.id
            setClient(data.user)
            clientRef.current = data.user
            const list = data.memberList.filter(item => {
                return item.id !== data.user.id
            })
            userListRef.current = list
            setUserList(list)
        })

        eventBus.on(EventName.ON_NEW_CLIENT, (data: INewClientParams) => {
            userListRef.current.push(data.user)
            setUserList([...userListRef.current])
            rtcClient.current?.initRTC(data.user.id)
        })

        eventBus.on(EventName.ON_VIDEO_STATUS, (data: IStatusParams) => {
            for (let i = 0; i < userListRef.current.length; i++) {
                if (userListRef.current[i].id === data.userId) {
                    userListRef.current[i].videoStatus = data.status
                    break
                }
            }
            setUserList([...userListRef.current])
        })

        eventBus.on(EventName.ON_AUDIO_STATUS, (data: IStatusParams) => {
            console.log(EventName.ON_AUDIO_STATUS, data)
            for (let i = 0; i < userListRef.current.length; i++) {
                if (userListRef.current[i].id === data.userId) {
                    userListRef.current[i].audioStatus = data.status
                    break
                }
            }
            setUserList([...userListRef.current])
        })

        eventBus.on(EventName.ON_LEAVE, (data: { id: string }) => {
            setLeaveUserId(data.id)
            userListRef.current.forEach((item, index) => {
                if (item.id === data.id) {
                    userListRef.current.splice(index, 1)
                }
            })
            setUserList([...userListRef.current])
        })

        return () => {
            eventBus.clear()
            rtcClient.current?.close()
        }

    }, [])

    useEffect(() => {
        let toolbarIndex = -1
        const clickHandle = () => {
            if (meetingType !== 0) return
            setIsShowToolbar(!isShowToolbar)
        }
        if (isShowToolbar) {
            toolbarIndex = window.setTimeout(() => {
                setIsShowToolbar(false)
            }, 10000)
        } else {
            clearInterval(toolbarIndex)
        }
        const largeDom = document.querySelector(".large-video") as HTMLDivElement
        largeDom?.addEventListener("click", clickHandle)


        return () => {
            clearInterval(toolbarIndex)
            largeDom?.removeEventListener("click", clickHandle)
        }
    }, [isZoomVideo, isShowToolbar]);

    useEffect(() => {
        if (zoomIndex === -1 || leaveUserId === currentZoomVideoId || userList.length === 0) {
            setZoomIndex(-1)
            setCurrentZoomVideoId("")
            setLeaveUserId("")
            let dom = areaBox.current
            dom && dom.removeAttribute("style")
            initLayout()
        } else {
            enlargeVideo()
        }
    }, [userList]);

    const toggleVideo = () => {
        if (!client.isHasAuth) return
        rtcClient.current?.changeCameraStatus(!videoStatus)
        setVideoStatus(!videoStatus)
    }

    const toggleAudio = () => {
        if (!client.isHasAuth) return
        setAudioStatus(!audioStatus)
        rtcClient.current?.changeMicrophoneStatus(audioStatus)
    }

    const toggleSpeaker = () => {
        setSpeakerStatus(!speakerStatus)
    }

    const switchCamera = () => {
        setIsUser(false)
        rtcClient.current?.switchCamera(isUser ? "environment" : "user")
    }
    const initLayout = () => {
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>
        let length = userList.length
        length = length + 1
        let width: number
        if (meetingType === 0) {
            zoomDomArr.forEach(item => {
                item.removeAttribute("style")
            })
            setIsZoomVideo(length !== 1)
        } else {
            if (length === 1) {
                width = clientWidth
            } else if (length >= 2 && length <= 4) {
                width = clientWidth / 2
            } else if (length > 4) {
                width = clientWidth / 3
            }
            zoomDomArr.forEach(item => {
                item.style.width = width + 'px'
                item.style.height = width + 'px'
            })
        }
    }

    const exchangeStyle = (index: number) => {
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>
        utils.exchangeStyle(zoomDomArr, zoomIndex, index)
    }

    const enlargeVideo = () => {
        setIsLarge(true)
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>

        let length = userList.length
        const smallVideoWidth = clientWidth / 3
        let row = Math.ceil(length / 3)

        let smallIndex = 0
        let leftIndex = 0
        let bigVideoWidth = 0
        let surplusVideoWidth = clientHeight - smallVideoWidth * row
        if (surplusVideoWidth < smallVideoWidth) {
            return
        } else if (surplusVideoWidth < clientWidth && surplusVideoWidth > smallVideoWidth) {
            bigVideoWidth = surplusVideoWidth
        } else {
            bigVideoWidth = clientWidth
        }

        let videoBoxHeight = bigVideoWidth + row * smallVideoWidth
        let spaceHeight = (clientHeight - videoBoxHeight) / 2


        zoomDomArr.forEach((item, index) => {
            if (index === zoomIndex) {
                item.style.width = bigVideoWidth + 'px'
                item.style.height = bigVideoWidth + 'px'
                item.style.top = spaceHeight + 'px'
            } else {
                item.style.width = smallVideoWidth + 'px'
                item.style.height = smallVideoWidth + 'px'
                item.style.left = smallVideoWidth * leftIndex + 'px'
                if (smallIndex >= 3 && smallIndex <= 5) {
                    item.style.top = bigVideoWidth + smallVideoWidth + spaceHeight + 'px'
                } else if (smallIndex > 5) {
                    item.style.top = bigVideoWidth + smallVideoWidth * 2 + spaceHeight + 'px'
                } else {
                    item.style.top = bigVideoWidth + spaceHeight + 'px'
                }

                smallIndex++
                leftIndex++
                if (leftIndex > 2) {
                    leftIndex = 0
                }
            }
        })
    }

    const zoomVideo = (index: number, clientId: string) => {
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>
        if (meetingType === 0) {
            if ((zoomIndex === -1 && index === 1) || userList.length === 0) return;
            if (index !== zoomIndex) {
                setIsZoomVideo(!isZoomVideo)
                setZoomIndex(index)
            }
        } else {
            if (userList.length === 0) {
                return;
            }
            if (index === zoomIndex) {
                setIsLarge(false)
                setZoomIndex(-1)
                setCurrentZoomVideoId("")
                zoomDomArr.forEach(item => {
                    item.removeAttribute("style")
                })
                return;
            }
            setZoomIndex(index)
            setCurrentZoomVideoId(clientId)
            if (zoomIndex > -1) {
                exchangeStyle(index)
            }
        }
    }

    useEffect(() => {
        if (zoomIndex === -1) {
            initLayout()
        } else if (!isLarge && meetingType === 1) {
            enlargeVideo()
        }
    }, [zoomIndex]);

    const leave = () => {
        navigate(-1)
    }

    return <RoomPhoneWrapper>
        <div className={classNames(zoomIndex === -1 ? "video-area" : "zoom-area", meetingType === 0 ? "p2p" : "")}
             ref={areaBox}>
            <div
                className={classNames("video-box self-video", zoomIndex === 0 ? "zoom" : "", roomType === 1 || meetingType !== 0 || userList.length === 0 ? "show" : "hide", meetingType === 0 && (isZoomVideo ? 'shrink-video' : 'large-video'))}
                onClick={() => zoomVideo(0, "selfVideo")}>
                <video id={"video_0"} className={classNames("video", videoStatus ? "show" : "hide")} muted
                       autoPlay></video>
                <div
                    className={classNames("info", meetingType !== 0 ? 'moreCallInfo' : '', !videoStatus ? "show" : "hide")}>
                    <img className="avatar" src={defaultAvatar} alt=""/>
                    <div
                        className={classNames(roomType === 0 && meetingType === 0 ? "show" : "hide")}>{client.name}</div>
                </div>
            </div>
            {
                userList.map((user, index) => {
                    return <div
                        className={classNames("video-box", meetingType === 0 && (isZoomVideo ? 'large-video' : 'shrink-video'))}
                        onClick={() => zoomVideo(index + 1, user.id)}
                        key={user.id}>
                        <video className={classNames("video", user.videoStatus ? "show" : "hide")}
                               id={"video_" + user.id}
                               autoPlay
                               muted></video>
                        <audio className={"hide"} id={"audio_" + user.id} autoPlay muted={speakerStatus}></audio>
                        <img
                            className={classNames(meetingType === 0 ? 'default' : 'avatar', !user.videoStatus ? "show" : "hide")}
                            src={defaultAvatar}
                            alt=""/>

                        <div className={classNames("mute-box", user.audioStatus || meetingType !== 1 ? "hide" : "")}>
                            <img src={mute} alt=""/>
                        </div>
                    </div>

                })
            }
        </div>

        {
            roomType === 1 && meetingType === 0 ?
                <div className={classNames("toolbar", isShowToolbar ? "show" : "hide")}>
                    <div className="top">
                        <div onClick={toggleVideo}>
                            <div style={{background: videoStatus ? "#fff" : ""}}>
                                {
                                    videoStatus ? <img src={video_on} alt=""/> :
                                        <img src={video_off} alt=""/>
                                }
                            </div>
                            <span>摄像头</span>
                        </div>
                        <div onClick={toggleSpeaker}>
                            <div style={{background: speakerStatus ? "#fff" : ""}}>
                                {
                                    speakerStatus ? <img src={speaker_on} alt=""/> :
                                        <img src={speaker_off} alt=""/>
                                }
                            </div>
                            <span>扬声器</span>
                        </div>
                        <div onClick={toggleAudio}>
                            <div style={{background: !audioStatus ? "#fff" : ""}}>
                                {
                                    !audioStatus ? <img src={mic_on} alt=""/> :
                                        <img src={mic_off} alt=""/>
                                }
                            </div>
                            <span>麦克风</span>
                        </div>
                    </div>
                    <div className="bottom">
                        <div></div>
                        <div onClick={leave} className={"hangup"}>
                            <img className="exit" src={exit} alt=""/>
                        </div>
                        <div>
                            <img onClick={switchCamera} className="change" src={reverseCameraWhite} alt=""/>
                        </div>
                    </div>
                </div> : null
        }

        {
            meetingType === 1 ? <div className={classNames("toolbar2", roomType === 0 ? "audioStyle" : "")}>
                {
                    roomType === 1 ? <>
                        <div onClick={switchCamera} style={{background: "#fff"}}>
                            <img src={reverseCamera} alt=""/>
                        </div>
                        <div onClick={toggleVideo} style={{background: videoStatus ? "#fff" : ""}}>
                            {
                                videoStatus ? <img src={video_on} alt=""/> :
                                    <img src={video_off} alt=""/>
                            }
                        </div>
                    </> : null
                }
                <div onClick={toggleSpeaker} className={"speaker"} style={{background: speakerStatus ? "#fff" : ""}}>
                    {
                        speakerStatus ? <img src={speaker_on} alt=""/> :
                            <img src={speaker_off} alt=""/>
                    }
                </div>
                <div onClick={toggleAudio} style={{background: !audioStatus ? "#fff" : ""}}>
                    {
                        audioStatus ? <img src={mic_off} alt=""/> :
                            <img src={mic_on} alt=""/>
                    }
                </div>
                <div className="exit" onClick={leave}>
                    <img src={exit} alt=""/>
                </div>
            </div> : null
        }


        {
            roomType === 0 && meetingType === 0 ?
                <div className={classNames("toolbar", isShowToolbar ? "show" : "hide")}
                     style={{height: "150px"}}>
                    <div className="top">
                        <div onClick={toggleSpeaker}>
                            <div style={{background: speakerStatus ? "#fff" : ""}}>
                                {
                                    speakerStatus ? <img src={speaker_on} alt=""/> :
                                        <img src={speaker_off} alt=""/>
                                }
                            </div>
                            <span>扬声器</span>
                        </div>
                        <div onClick={leave} className={"hangup"}>
                            <div className="exit">
                                <img src={exit} alt=""/>
                            </div>
                            <span>退出</span>
                        </div>
                        <div onClick={toggleAudio}>
                            <div style={{background: !audioStatus ? "#fff" : ""}}>
                                {
                                    audioStatus ? <img src={mic_off} alt=""/> :
                                        <img src={mic_on} alt=""/>
                                }
                            </div>
                            <span>麦克风</span>
                        </div>
                    </div>
                </div> : null
        }


        <div className={classNames("tips", isShowErrorTip ? "show" : "hide")}>{message}</div>
        <div className={classNames("exit-tips", exitTips ? "show" : "hide")}>对方已挂断</div>
    </RoomPhoneWrapper>
}

export default memo(RoomPhone)