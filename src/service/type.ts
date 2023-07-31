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
    ON_ANSWER = "onAnswer",
    ON_ICE_CANDIDATE = "onICECandidate",
    ON_SHARE_SCREEN = "onShareScreen"
}

export interface IJoinParams {
    username: string
    isHasAuth: boolean
    videoStatus: boolean
    audioStatus: boolean
    roomId: string
    method: "joinRoom"
}

export interface IJoinResult {
    memberList: IUserInfo[]
    startTime: number
    roomId: string
    user: IUserInfo
}

export interface IStatusParams {
    roomId: string
    userId: string
    status: boolean
    method: "videoStatus" | "audioStatus" | "shareScreen"
}

export interface ISdpParams {
    roomId: string
    userId: string
    targetId: string
    sdp: RTCSessionDescriptionInit
    method: "offer" | "answer"
}

export interface IUserInfo {
    audioStatus: boolean
    id: string
    isHasAuth: boolean
    name: string
    videoStatus: boolean
    isShareScreen: boolean
}

export interface INewClientParams {
    user: IUserInfo
    method: "newClient"
}

export interface IICEParams {
    roomId: string
    targetId: string
    userId: string
    ice: RTCIceCandidate
    method: "icecandidate"
}