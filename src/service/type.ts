export interface IEventParams {
    method: string
    cb: (data: any) => void
}

export enum EventName {
    ON_JOIN_ROOM = "onJoinRoom",
    ON_NEW_CLIENT = "onNewClient",
    ON_LEAVE = "onLeave",
    ON_VIDEO_STATUS = "onVideoStatus",
    ON_AUDIO_STATUS = "onAudioStatus",
    ON_OFFER = "onOffer",
    ON_ANSWER = "onAnswer"
}

export interface IJoinParams {
    username: string
    isHasAuth: boolean
    videoStatus: boolean
    roomId: string
    method: "joinRoom"
}

export interface IStatusParams {
    userId: string
    status: boolean
    method: "videoStatus" | "audioStatus"
}

export interface ISdpParams {
    roomId: string
    userId: string
    targetId: string
    sdp: RTCSessionDescriptionInit
    method: "offer" | "answer"
}

export interface INewClientParams {
    user: {
        videoStatus: boolean
        audioStatus: boolean
        id: string
        isHasAuth: true
        name: string
    }
    method: "newClient"
}
