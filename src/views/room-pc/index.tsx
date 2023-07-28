import {memo, useEffect, useRef, useState} from "react";
import type {FC} from "react"
import classNames from "classnames";
import {RoomPCWrapper} from "@/views/room-pc/style";
import WebRTCClient from "@/lib/webrtc-client";
import eventBus from "@/lib/eventBus";
import {EventName, INewClientParams} from "@/service/type";
import storage from "@/utils/Storage";
import mute from "@/assets/img/mic-mute.png"
import unmute from "@/assets/img/mic-unmute.png"
import exit from "@/assets/img/exit.png"
import micoff from "@/assets/img/mic-off.png"
import mic1 from "@/assets/img/mic1.png"
import speackeroff from "@/assets/img/speaker_off.png"
import speakeron1 from "@/assets/img/speaker_on1.png"
import video1 from "@/assets/img/video1.png"
import videooff from "@/assets/img/video-off.png"
import warn from "@/assets/img/warn.svg"
import defaultAvatar from "@/assets/img/defaultAvatar.jpg"
import {useNavigate} from "react-router-dom";


interface IUserInfo {
    audioStatus: boolean
    id: string
    isHasAuth: boolean
    name: string
    videoStatus: boolean
}

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
        isHasAuth: true
    })

    const [userList, setUserList] = useState<IUserInfo[]>([])
    const [videoStatus, setVideoStatus] = useState<boolean>(true)
    const [audioStatus, setAudioStatus] = useState<boolean>(false)
    const [speakerStatus, setSpeakerStatus] = useState<boolean>(false)
    const [isShowErrorTip, setIsShowErrorTip] = useState<boolean>(false)
    const [message, setMessage] = useState<boolean>(false)
    const [isShowPlayTips, setIsShowPlayTips] = useState<boolean>(false)
    const [zoomIndex, setZoomIndex] = useState<number>(-1)
    const [currentZoomVideoId, setCurrentZoomVideoId] = useState("")
    let width = videoWidth
    let height = videoHeight

    useEffect(() => {
        const roomInfo = storage.getItem("roomInfo")
        rtcClient.current = new WebRTCClient()
        rtcClient.current.joinRoom({
            username: roomInfo.username,
            videoStatus: true,
            roomId: roomInfo.roomId
        })

        eventBus.on(EventName.ON_JOIN_ROOM, (data: IJoinResult) => {
            rtcClient.current!.userId = data.user.id
            setClient(data.user)
            const list = data.memberList.filter(item => {
                return item.id !== data.user.id
            })
            setUserList(list)
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

        eventBus.on(EventName.ON_LEAVE, (data: { id: string }) => {
            console.log(EventName.ON_LEAVE, data)
            userList.forEach((item, index) => {
                if (item.id === data.id) {
                    userList.splice(index, 1)
                }
            })
            setUserList([...userList])
        })

        window.addEventListener("resize", resize)

        return () => {
            window.removeEventListener("resize", resize)
            rtcClient.current?.close()
            eventBus.clear()
        }
    }, [])

    useEffect(() => {
        console.log('成员列表发生变化')
        initLayout()
    },[userList])

    const resize = () => {
        clientWidth = document.body.clientWidth
        clientHeight = document.body.clientHeight - 120

        zoomIndex > 0 ? enlargeVideo() : initLayout()
    }

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

        setZoomIndex(index)
    }

    const enlargeVideo = () => {
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

        // nextTick(() => {
        let zoomArea = document.querySelector(".zoom-area") as HTMLElement
        zoomArea.style.height = largeHeight + 'px'
        zoomArea.style.width = largeWidth + smallWidth + 'px'
        zoomArea.style.top = surplusHeight + 'px'
        zoomArea.style.left = surplusWidth + 'px'
        // })

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
        let zoomDomArr = document.querySelectorAll(".video-box") as NodeListOf<HTMLElement>
        let length = zoomDomArr.length
        if (length === 1) return
        if (index === zoomIndex) {
            let dom = document.querySelector(".zoom-area") as HTMLElement
            dom.removeAttribute("style")
            setZoomIndex(-1)
            setCurrentZoomVideoId("")
            initLayout()
            return;
        }

        if (zoomIndex > -1) {
            exchangeStyle(index)
        } else {
            setZoomIndex(index)
            enlargeVideo()
        }
        setCurrentZoomVideoId(clientId)
    }

    const leave = () => {
        navigate(-1)
    }

    return <RoomPCWrapper>
        <div className={"container"}>
            <div className={classNames(zoomIndex === -1 ? 'video-area' : 'zoom-area')}>
                <div className="video-box self-video" onClick={() => zoomVideo(0, 'selfVideo')}>
                    <video id={"video_0"} className={classNames(!videoStatus || !client.isHasAuth ? "hide" : "")} muted
                           autoPlay></video>
                    <img className={classNames("bg", videoStatus && client.isHasAuth ? "hide" : "")} src={defaultAvatar}
                         alt=""/>
                    <div className="info">
                        <span>{client.name}</span>
                    </div>
                </div>
                {
                    userList.map((user, index) => {
                        return <div className="video-box" onClick={() => zoomVideo(index + 1, user.id)} key={user.id}>
                            {
                                user.videoStatus && user.isHasAuth ?
                                    <video id={"video_" + user.id} muted autoPlay></video> :
                                    <img className="bg" src={defaultAvatar} alt=""/>
                            }
                            <audio className="hide" id={"audio_" + user.id} muted={speakerStatus} autoPlay></audio>
                            <div className="info">
                                <span>
                                    {
                                        user.audioStatus ? <img src={mute} alt=""/> : <img src={unmute} alt=""/>
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
                <div style={{background: !audioStatus ? '#fff' : ''}}>
                    {
                        audioStatus ? <img src={micoff} alt=""/> : <img src={mic1} alt=""/>
                    }

                </div>
                <span>{audioStatus ? "麦克风已关" : "麦克风已开"}</span>
            </div>
            <div onClick={toggleSpeaker}>
                <div style={{background: !speakerStatus ? '#fff' : ''}}>
                    {
                        speakerStatus ? <img src={speackeroff} alt=""/> :
                            <img src={speakeron1} alt=""/>
                    }
                </div>
                <span>{speakerStatus ? "扬声器已关" : "扬声器已开"}</span>
            </div>
            <div onClick={toggleVideo}>
                <div style={{background: videoStatus ? '#fff' : ''}}>
                    {
                        videoStatus ? <img src={video1} alt=""/> :
                            <img src={videooff} alt=""/>
                    }
                </div>
                <span>{videoStatus ? "摄像头已开" : "摄像头已关"}</span>
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
                <div className="tips">摄像头和麦克风没有权限或不存在</div> : null
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