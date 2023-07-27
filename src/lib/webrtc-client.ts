import type {IJoinInfo} from "@/lib/type";
import socketService from "@/service/socketService";

class WebRTCClient {
    private videoDom: HTMLVideoElement
    private myStream: MediaStream | null = null
    public isHasAuth: boolean = true
    public constraints: MediaStreamConstraints = {
        audio: true,
        video: false
    }
    public constraints1: MediaStreamConstraints = {
        audio: true,
        video: {
            width: {
                max: 640
            },
            height: {
                max: 480
            },
            frameRate: 30
        }
    }
    public constraints2: MediaStreamConstraints = {
        audio: true,
        video: false
    }

    constructor(videoDom: HTMLVideoElement) {
        this.videoDom = videoDom
        // socketService.initSocket()
    }

    private async getUserMedia() {
        if (!this.myStream) {
            try {
                this.myStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                this.videoDom.srcObject = this.myStream
            } catch (error) {
                this.isHasAuth = false
                console.error('getUserMedia error', error)
            }
        }
    }

    public async joinRoom(info: IJoinInfo) {
        await this.getUserMedia()
        // socketService.joinRoom({
        //     username: info.username,
        //     roomId: info.roomId,
        //     videoStatus: info.videoStatus,
        //     isHasAuth: this.isHasAuth
        // })
    }

    public switchCamera() {

    }

    public changeCamera() {

    }

    public changeCameraStatus(status: boolean) {
        if (this.myStream) {
            this.myStream.getVideoTracks()[0].enabled = status
        }
    }

    public changeMicrophoneStatus(status: boolean) {
        if (this.myStream) {
            this.myStream.getAudioTracks()[0].enabled = status
        }
    }

    public shareScreen() {

    }

    public close() {
        this.myStream?.getTracks().forEach(item => {
            item.stop()
        })
        socketService.closeSocket()
    }

    private createRTCPeer() {
        const peer = new RTCPeerConnection()
        if (this.myStream) {
            for (const track of this.myStream.getTracks()) {
                peer.addTrack(track, this.myStream)
            }
        }
        peer.addEventListener("track", (event) => {

        })

        peer.addEventListener("icecandidate", (event) => {
            console.log(event.candidate)
        })

        peer.addEventListener("iceconnectionstatechange", () => {
            switch (peer.iceConnectionState) {
                case "connected":
                    break
                case "disconnected":
                    break
            }
        })
    }

    private createAnswer() {

    }

    private createOffer() {

    }


}

export default WebRTCClient