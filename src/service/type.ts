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
}

export interface IStatusParams {
    userId: string
    status: boolean
}

export interface ISdpParams {
    targetId: string
    sdp: RTCSessionDescriptionInit
}
