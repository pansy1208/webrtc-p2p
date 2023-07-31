import {memo, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {FC} from "react"
import classNames from "classnames";
import {RoomPCWrapper} from "@/views/room-pc/style";
import WebRTCClient from "@/lib/webrtc-client";
import type {IRTCConnectionParams} from "@/lib/type";
import eventBus from "@/lib/eventBus";
import {EventName, INewClientParams, IStatusParams, IUserInfo} from "@/service/type";
import storage from "@/utils/Storage";
import mute from "@/assets/img/mic_mute.png"
import unmute from "@/assets/img/mic_unmute.png"
import exit from "@/assets/img/exit.png"
import mic_off from "@/assets/img/mic_off.png"
import mic_on from "@/assets/img/mic_on.png"
import speaker_off from "@/assets/img/speaker_off.png"
import speaker_on from "@/assets/img/speaker_on.png"
import video_on from "@/assets/img/video_on.png"
import video_off from "@/assets/img/video_off.png"
import warn from "@/assets/img/warn.svg"
import defaultAvatar from "@/assets/img/defaultAvatar.svg"
import screen_share from "@/assets/img/screen_share.png"

interface IJoinResult {
    memberList: IUserInfo[]
    startTime: number
    roomId: string
    user: IUserInfo
}

const RoomPC: FC = () => {
    const scaleX = 3 / 4
    const scaleY = 4 / 3
    let clientWidth: number = document.body.clientWidth
    let clientHeight: number = document.body.clientHeight - 120
    let videoWidth: number, videoHeight: number
    if (clientWidth * scaleX > clientHeight) {
        videoWidth = clientHeight * scaleY
        videoHeight = clientHeight
    } else {
        videoWidth = clientWidth
        videoHeight = clientWidth * scaleX
    }

    const navigate = useNavigate()

    const rtcClient = useRef<WebRTCClient | null>(null)
    const [client, setClient] = useState<IUserInfo>({
        id: "",
        name: "",
        videoStatus: true,
        audioStatus: true,
        isHasAuth: true,
        isShareScreen: false
    })
    const clientRef = useRef<IUserInfo>(client)

    const areaBox = useRef<HTMLDivElement>(null)
    const [userList, setUserList] = useState<IUserInfo[]>([])
    const userListRef = useRef<IUserInfo[]>(userList)
    const [videoStatus, setVideoStatus] = useState<boolean>(true)
    const [audioStatus, setAudioStatus] = useState<boolean>(false)
    const [speakerStatus, setSpeakerStatus] = useState<boolean>(false)
    const [isShowErrorTip, setIsShowErrorTip] = useState<boolean>(false)
    const [message, setMessage] = useState<string>("")
    const [isShowPlayTips, setIsShowPlayTips] = useState<boolean>(false)
    const [zoomIndex, setZoomIndex] = useState<number>(-1)
    const [currentZoomVideoId, setCurrentZoomVideoId] = useState("")
    const [isLarge, setIsLarge] = useState<boolean>(false)
    const [leaveUserId, setLeaveUserId] = useState<string>("")
    let width = videoWidth
    let height = videoHeight

    useEffect(() => {
        const roomInfo = storage.getItem("roomInfo")
        const turnInfo = storage.getItem("turnInfo", true)
        const videoDom = document.getElementById("video_0") as HTMLVideoElement
        let timeoutIndex: number
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

        rtcClient.current = new WebRTCClient(videoDom, turnServer)
        rtcClient.current.joinRoom({
            username: roomInfo.username,
            videoStatus: true,
            roomId: roomInfo.roomId
        })

        eventBus.on(EventName.ON_JOIN_ROOM, (data: IJoinResult) => {
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
            console.log(EventName.ON_LEAVE, data)
            setLeaveUserId(data.id)
            userListRef.current.forEach((item, index) => {
                if (item.id === data.id) {
                    userListRef.current.splice(index, 1)
                }
            })
            setUserList([...userListRef.current])
        })

        eventBus.on(EventName.ON_SHARE_SCREEN, (data) => {
            if (data.userId === clientRef.current.id) {
                clientRef.current.isShareScreen = data.status
                setClient({...clientRef.current})
            } else {
                for (let i = 0; i < userListRef.current.length; i++) {
                    if (userListRef.current[i].id === data.userId) {
                        userListRef.current[i].isShareScreen = data.status
                        break
                    }
                }
                setUserList([...userListRef.current])
            }
        })

        eventBus.on("onNetworkError", (data: 1000 | 1001) => {
            clearTimeout(timeoutIndex)
            setIsShowErrorTip(true)
            setMessage("网络连接异常")
            if (data === 1001) {
                leave()
            } else {
                timeoutIndex = window.setTimeout(() => {
                    setIsShowErrorTip(false)
                    setMessage("")
                }, 3000)
            }
        })

        window.addEventListener("resize", resize)

        return () => {
            window.removeEventListener("resize", resize)
            rtcClient.current?.close()
            eventBus.clear()
        }
    }, [])

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
    }, [userList])

    const resize = () => {
        clientWidth = document.body.clientWidth
        clientHeight = document.body.clientHeight - 120

        zoomIndex > 0 ? enlargeVideo() : initLayout()
    }

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

    const toggleScreenShare = () => {
        if (!client.isShareScreen) {
            rtcClient.current?.playShareScreen()
        } else {
            rtcClient.current?.stopShareScreen()
        }
    }

    const playAudio = () => {

    }


    const initLayout = () => {
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>
        let length = zoomDomArr.length
        let count = Math.ceil(length / 2)
        count = count > 3 ? 3 : count
        let row: number
        if (length === 2) {
            count = 2
            row = 1
        } else if (length > 2 && length <= 6) {
            row = 2
        } else if (length > 6) {
            row = 3
        } else {
            row = 1
        }

        if (clientWidth / count * scaleX * row > clientHeight) {
            videoWidth = clientHeight * scaleY
        } else {
            videoWidth = clientWidth
        }

        width = videoWidth / count
        height = width * scaleX

        let surplusWidth = Math.floor(clientWidth - count * width) / 2
        let surplusHeight = Math.floor(clientHeight - row * height) / 2


        let currentIndex = 0
        let lastCount = 0
        zoomDomArr.forEach((item, index) => {
            item.removeAttribute("style")
            item.style.width = width + "px"
            item.style.height = height + "px"
            item.style.left = surplusWidth + currentIndex * width + 'px'

            let currentRow = (index / row)
            if (currentRow <= 1) {
                item.style.top = surplusHeight + 'px'
            } else if (currentRow >= 1 && currentRow < 3) {
                item.style.top = surplusHeight + height + 'px'
            } else {
                item.style.top = surplusHeight + 2 * height + 'px'
            }

            currentIndex++
            if (currentIndex >= count) {
                currentIndex = 0
            }

            let lastSurplusWidth = Math.floor(count * width - (length - (row - 1) * count) * width) / 2 + surplusWidth

            if (row === 1) {
                item.style.top = surplusHeight + 'px'
            } else if (row === 2) {
                if (count === 2) {
                    if (currentRow < 1) {
                        item.style.top = surplusHeight + 'px'
                    } else if (currentRow >= 1 && currentRow < 3) {
                        item.style.top = surplusHeight + height + 'px'
                        item.style.left = lastCount * width + lastSurplusWidth + 'px'
                        lastCount++
                    }
                } else {
                    if (currentRow <= 1) {
                        item.style.top = surplusHeight + 'px'
                    } else if (currentRow > 1 && currentRow < 3) {
                        item.style.top = surplusHeight + height + 'px'
                        item.style.left = lastCount * width + lastSurplusWidth + 'px'
                        lastCount++
                    }
                }
            } else if (row === 3) {
                if (currentRow < 1) {
                    item.style.top = surplusHeight + 'px'
                } else if (currentRow >= 1 && currentRow < 2) {
                    item.style.top = surplusHeight + height + 'px'
                } else {
                    item.style.top = surplusHeight + 2 * height + 'px'
                    item.style.left = lastCount * width + lastSurplusWidth + 'px'
                    lastCount++
                }
            }
        })
    }

    const exchangeStyle = (index: number) => {
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>

        let currentBigVideoStyle: any = {}
        let selectVideoStyle: any = {}

        let currentZoomStyleList: any = zoomDomArr[zoomIndex].style
        let selectVideoStyleList: any = zoomDomArr[index].style

        for (let key of currentZoomStyleList) {
            currentBigVideoStyle[key] = currentZoomStyleList[key]
        }

        for (let key of selectVideoStyleList) {
            selectVideoStyle[key] = selectVideoStyleList[key]
        }

        zoomDomArr[zoomIndex].removeAttribute("style")
        zoomDomArr[zoomIndex].classList.remove("bigVideo")
        zoomDomArr[index].removeAttribute("style")
        zoomDomArr[index].classList.add("bigVideo")

        Object.keys(currentBigVideoStyle).forEach(item => {
            selectVideoStyleList[item] = currentBigVideoStyle[item]
        })
        Object.keys(selectVideoStyle).forEach(item => {
            currentZoomStyleList[item] = selectVideoStyle[item]
        })
    }

    const enlargeVideo = () => {
        setIsLarge(true)
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>

        let largeWidth = clientHeight * scaleY
        let largeHeight = clientHeight
        let smallHeight = clientHeight / 4
        let smallWidth = smallHeight * scaleY
        let surplusWidth: number
        let surplusHeight: number
        let smallTop: number
        let currentIndex = 0


        if (largeWidth + smallWidth > clientWidth) {
            smallWidth = clientWidth / 5
            smallHeight = smallWidth * scaleX
            largeWidth = smallWidth * 4
            largeHeight = largeWidth * scaleX
        }

        surplusWidth = Math.floor(clientWidth - largeWidth - smallWidth) / 2
        surplusHeight = Math.floor(clientHeight - largeHeight) / 2

        let zoomArea = document.querySelector(".zoom-area") as HTMLDivElement
        zoomArea.style.height = largeHeight + 'px'
        zoomArea.style.width = largeWidth + smallWidth + 'px'
        zoomArea.style.top = surplusHeight + 'px'
        zoomArea.style.left = surplusWidth + 'px'

        zoomDomArr.forEach((item, index) => {
            if (index === zoomIndex) {
                item.style.width = largeWidth + 'px'
                item.style.height = largeHeight + 'px'
                item.style.left = surplusWidth + 'px'
                item.style.top = surplusHeight + 'px'
                item.style.position = 'fixed'
                item.classList.add("bigVideo")
            } else {
                item.classList.remove("bigVideo")
                if (userList.length > 4) {
                    smallTop = smallHeight * currentIndex
                } else {
                    smallTop = (largeHeight - userList.length * smallHeight) / 2 + currentIndex * smallHeight
                }

                item.style.height = smallHeight + 'px'
                item.style.width = smallWidth + 'px'
                item.style.top = smallTop + 'px'
                item.style.left = largeWidth + 'px'
                currentIndex++
            }
        })
    }

    const zoomVideo = (index: number, clientId: string) => {
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLDivElement>
        let length = zoomDomArr.length
        if (length === 1) return
        if (index === zoomIndex) {
            let dom = document.querySelector(".zoom-area") as HTMLDivElement
            dom.removeAttribute("style")
            setZoomIndex(-1)
            setIsLarge(false)
            setCurrentZoomVideoId("")
            return;
        }

        setZoomIndex(index)
        if (zoomIndex > -1 && isLarge) {
            exchangeStyle(index)
        }
        setCurrentZoomVideoId(clientId)
    }

    useEffect(() => {
        if (zoomIndex === -1) {
            initLayout()
        } else if (!isLarge) {
            enlargeVideo()
        }
    }, [zoomIndex])

    const leave = () => {
        navigate(-1)
    }

    return <RoomPCWrapper>
        <div className={"container"}>
            <div className={classNames(zoomIndex === -1 ? 'video-area' : 'zoom-area')} ref={areaBox}>
                <div className="video-box self-video" onClick={() => zoomVideo(0, 'selfVideo')}>
                    <video id={"video_0"}
                           className={classNames((!videoStatus || !client.isHasAuth) && !client.isShareScreen ? "hide" : "")}
                           muted
                           autoPlay></video>
                    <img
                        className={classNames("bg", (videoStatus && client.isHasAuth) || client.isShareScreen ? "hide" : "")}
                        src={defaultAvatar}
                        alt=""/>
                    <div className="info">
                        <span>{client.name}</span>
                    </div>
                </div>
                {
                    userList.map((user, index) => {
                        return <div className="video-box" onClick={() => zoomVideo(index + 1, user.id)} key={user.id}>
                            <video id={"video_" + user.id}
                                   className={classNames(!user.videoStatus && !user.isShareScreen ? "hide" : "")} muted
                                   autoPlay></video>
                            <img className={classNames("bg", user.videoStatus || user.isShareScreen ? "hide" : "")}
                                 src={defaultAvatar} alt=""/>
                            <audio className="hide" id={"audio_" + user.id} muted={speakerStatus} autoPlay></audio>
                            <div className="info">
                                <span>
                                    {
                                        !user.audioStatus ? <img src={mute} alt=""/> : <img src={unmute} alt=""/>
                                    }
                                    {user.name}
                                </span>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
        <div className={"footer"}>
            <div onClick={toggleAudio}>
                <div style={{background: !audioStatus ? "#fff" : "", opacity: client.isHasAuth ? "" : "0.5"}}>
                    {
                        audioStatus ? <img src={mic_off} alt=""/> : <img src={mic_on} alt=""/>
                    }

                </div>
                <span>{audioStatus ? "麦克风已关" : "麦克风已开"}</span>
            </div>
            <div onClick={toggleSpeaker}>
                <div style={{background: !speakerStatus ? '#fff' : ''}}>
                    {
                        speakerStatus ? <img src={speaker_off} alt=""/> :
                            <img src={speaker_on} alt=""/>
                    }
                </div>
                <span>{speakerStatus ? "扬声器已关" : "扬声器已开"}</span>
            </div>
            <div onClick={toggleVideo}>
                <div style={{background: videoStatus ? "#fff" : "", opacity: client.isHasAuth ? "" : "0.5"}}>
                    {
                        videoStatus ? <img src={video_on} alt=""/> :
                            <img src={video_off} alt=""/>
                    }
                </div>
                <span>{videoStatus ? "摄像头已开" : "摄像头已关"}</span>
            </div>
            <div onClick={toggleScreenShare}>
                <div style={{background: "#fff"}}>
                    <img src={screen_share} alt={""}/>
                </div>
                <span>{client.isShareScreen ? "关闭分享" : "屏幕分享"}</span>
            </div>
            <div className="exit" onClick={leave}>
                <div>
                    <img src={exit} alt=""/>
                </div>
                <span>挂断</span>
            </div>
        </div>
        {
            isShowErrorTip ? <div className="tips">{message}</div> : null
        }
        {
            !client.isHasAuth && !isShowErrorTip ?
                <div className="tips">摄像头和麦克风不存在或没有权限</div> : null
        }

        {
            isShowPlayTips ? <div className="play-tips">
                <div className="title">提示</div>
                <div className="content">
                    <img src={warn} alt=""/>
                    <span>
                    由于您的浏览器设置，声音无法自动播放，请手动点击播放
                </span>
                </div>
                <div className="tip-footer">
                    <button onClick={playAudio}>我知道了</button>
                </div>
            </div> : null
        }
    </RoomPCWrapper>
}

export default memo(RoomPC)