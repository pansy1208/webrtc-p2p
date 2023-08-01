import type {IJoinInfo, IRTCConnectionParams} from "@/lib/type";
import socketService from "@/service/socketService";
import eventBus from "@/lib/eventBus";
import {EventName, IICEParams, ISdpParams} from "@/service/type";
import "@/service/socketEvent"

class WebRTCClient {
    private myStream: MediaStream | undefined = undefined
    private peerMap: Map<string, RTCPeerConnection> = new Map()
    private roomId: string = ""
    private isHasAuth: boolean = true
    private localVideoDom: HTMLVideoElement
    private isOpenScreenShare: boolean = false
    private isEnabled: boolean = true
    private readonly constraints: MediaStreamConstraints = {
        audio: true,
        video: {
            width: 640,
            height: 480,
            frameRate: 30
        }
    }
    private readonly turnServer: IRTCConnectionParams = {
        iceTransportPolicy: "all",
        iceServer: []
    }
    public userId: string = ""


    constructor(videoDom: HTMLVideoElement, turnServer: IRTCConnectionParams, constraints?: MediaStreamConstraints) {
        this.localVideoDom = videoDom
        this.turnServer = turnServer

        socketService.initSocket()

        if (constraints) this.constraints = constraints

        eventBus.on(EventName.ON_OFFER, async (data: ISdpParams) => {
            await this.createAnswer(data)
        })
        eventBus.on(EventName.ON_ANSWER, async (data: ISdpParams) => {
            const peer = this.peerMap.get(data.targetId)!
            await peer.setRemoteDescription(data.sdp)
        })
        eventBus.on(EventName.ON_ICE_CANDIDATE, async (data: IICEParams) => {
            const peer = this.peerMap.get(data.targetId)!
            await peer.addIceCandidate(data.ice)
        })
    }

    private async getUserMedia(): Promise<MediaStream | undefined> {
        try {
            return await navigator.mediaDevices.getUserMedia(this.constraints)
        } catch (error) {
            console.error('getUserMedia error', error)
            this.isHasAuth = false
        }
    }

    private async createRTCPeer(targetId: string): Promise<RTCPeerConnection> {
        const peer = new RTCPeerConnection({
            iceServers: this.turnServer.iceServer || [],
            iceTransportPolicy: this.turnServer.iceTransportPolicy || "all"
        })
        this.peerMap.set(targetId, peer)
        if (this.myStream) {
            for (const track of this.myStream.getTracks()) {
                peer.addTrack(track, this.myStream)
            }
        }

        peer.addEventListener("track", (event) => {
            const videoDom = document.getElementById(`video_${targetId}`) as HTMLVideoElement
            const audioDom = document.getElementById(`audio_${targetId}`) as HTMLAudioElement
            const track = event.track
            if (track.kind === "video") {
                videoDom.srcObject = event.streams[0]
            } else if (track.kind === "audio") {
                audioDom.srcObject = event.streams[0]
            }
        })

        peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                socketService.sendICE({
                    targetId,
                    userId: this.userId,
                    roomId: this.roomId,
                    method: "icecandidate",
                    ice: event.candidate
                })
            }
        })

        peer.addEventListener("iceconnectionstatechange", () => {
            switch (peer.iceConnectionState) {
                case "connected":
                    break
                case "disconnected":
                    break
            }
        })

        return peer
    }

    private async createAnswer(data: ISdpParams) {
        const peer = await this.createRTCPeer(data.targetId)
        await peer.setRemoteDescription(data.sdp)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        socketService.sendAnswer({
            targetId: data.targetId,
            userId: this.userId,
            sdp: answer,
            method: "answer",
            roomId: this.roomId
        })
    }

    public async initRTC(targetId: string) {
        const peer = await this.createRTCPeer(targetId)
        const offer = await peer.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        await peer.setLocalDescription(offer)

        socketService.sendOffer({
            targetId,
            userId: this.userId,
            sdp: offer,
            method: "offer",
            roomId: this.roomId
        })
    }

    public async joinRoom(info: IJoinInfo) {
        this.myStream = await this.getUserMedia()
        if (this.myStream) {
            this.localVideoDom.srcObject = this.myStream
        }
        this.roomId = info.roomId
        socketService.joinRoom({
            username: info.username,
            roomId: info.roomId,
            videoStatus: this.isHasAuth ? info.videoStatus : false,
            audioStatus: this.isHasAuth,
            isHasAuth: this.isHasAuth,
            method: "joinRoom"
        })
    }

    // 手机切换前后摄像头
    public async switchCamera(direction: "user" | "environment") {
        if (!this.myStream) return
        this.myStream.getTracks().forEach(track => {
            track.stop()
        })
        this.myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 640,
                height: 480,
                facingMode: direction
            }
        })
        this.localVideoDom.srcObject = this.myStream
        this.peerMap.forEach(peer => {
            peer.getSenders().forEach(sender => {
                if (sender.track?.kind === "video") {
                    sender.replaceTrack(this.myStream!.getVideoTracks()[0])
                } else if (sender.track?.kind === "audio") {
                    sender.replaceTrack(this.myStream!.getAudioTracks()[0])
                }
            })
        })
    }

    public async getDeviceList(): Promise<[]> {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        return []
    }

    // pc切换摄像头
    public changeCamera() {

    }

    public changeCameraStatus(status: boolean) {
        if (this.myStream && this.isHasAuth) {
            if (!this.isOpenScreenShare) {
                this.myStream.getVideoTracks()[0].enabled = status
            }
            this.isEnabled = status
            socketService.changeVideoOrAudioStatus({
                roomId: this.roomId,
                userId: this.userId,
                status: status,
                method: "videoStatus"
            })
        }
    }

    public changeMicrophoneStatus(status: boolean) {
        if (this.myStream && this.isHasAuth) {
            this.myStream.getAudioTracks()[0].enabled = status
            socketService.changeVideoOrAudioStatus({
                roomId: this.roomId,
                userId: this.userId,
                status: status,
                method: "audioStatus"
            })
        }
    }

    private replaceLocalStream(stream: MediaStream) {
        if (!this.myStream) return
        this.myStream.getVideoTracks().forEach(track => {
            track.stop()
        })
        this.myStream.removeTrack(this.myStream.getVideoTracks()[0])
        this.myStream.addTrack(stream.getVideoTracks()[0])
    }

    private async replaceRemoteStream(status: boolean, stream?: MediaStream) {
        if (stream) {
            this.peerMap.forEach((peer) => {
                peer.getSenders().forEach(sender => {
                    if (sender.track && sender.track.kind === "video") {
                        sender.replaceTrack(stream.getVideoTracks()[0])
                    }
                })
                // peer.addTrack(stream.getVideoTracks()[0], stream)
            })
        }
        this.isOpenScreenShare = status
        socketService.playShareScreen({
            roomId: this.roomId,
            userId: this.userId,
            status: status,
            method: "shareScreen"
        })
    }

    public async playShareScreen() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia()
            screenStream.getVideoTracks()[0].addEventListener("ended", () => {
                this.stopShareScreen()
            })
            if (this.myStream) {
                this.replaceLocalStream(screenStream)
            } else {
                this.localVideoDom.srcObject = screenStream
            }
            await this.replaceRemoteStream(true, screenStream)
        } catch (error) {
            console.error("play screen fail: ", error)
        }
    }

    public async stopShareScreen() {
        try {
            if (this.myStream) {
                const localStream = await this.getUserMedia()
                localStream!.getVideoTracks()[0].enabled = this.isEnabled
                this.replaceLocalStream(localStream!)
            } else {
                const screenStream = this.localVideoDom.srcObject as MediaStream
                screenStream.getTracks().forEach(track => {
                    track.stop()
                })
            }
            await this.replaceRemoteStream(false, this.myStream)
        } catch (error) {
            console.error("stop screenShare fail: ", error)
        }
    }

    public close() {
        this.myStream?.getTracks().forEach(item => {
            item.stop()
        })
        this.peerMap.forEach(item => {
            item.close()
        })
        socketService.closeSocket()
    }
}

export default WebRTCClient