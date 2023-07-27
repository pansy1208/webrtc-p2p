export interface IEventParams {
    method: string
    cb: (data: any) => void
}

export enum EventName {
    ON_JOIN_ROOM = "onJoinRoom",
    ON_LEAVE_ROOM = "onLeaveRoom",
    ON_VIDEO_STATUS = "onVideoStatus",
    ON_AUDIO_STATUS = "onAudioStatus"
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
