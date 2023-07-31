export type funcType = (data: any) => void

export interface IEvent {
    key: string,
    value: funcType
}

export interface IJoinInfo {
    roomId: string
    username: string
    videoStatus: boolean
}

export interface IRTCConnectionParams {
    iceTransportPolicy?:  RTCIceTransportPolicy
    iceServer?: RTCIceServer[]
}
