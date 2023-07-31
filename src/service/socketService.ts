import socket from "@/service/socket";
import type {IJoinParams, IStatusParams, ISdpParams} from "@/service/type";
import {IICEParams} from "@/service/type";

class SocketService {
    public initSocket() {
        socket.init()
    }

    public closeSocket() {
        socket.close()
    }

    public joinRoom(params: IJoinParams) {
        socket.sendMessage(params)
    }

    public changeVideoOrAudioStatus(params: IStatusParams) {
        socket.sendMessage(params)
    }

    public sendOffer(params: ISdpParams) {
        socket.sendMessage(params)
    }

    public sendAnswer(params: ISdpParams) {
        socket.sendMessage(params)
    }

    public sendICE(params: IICEParams) {
        socket.sendMessage(params)
    }

    public playShareScreen(params: IStatusParams) {
        socket.sendMessage(params)
    }
}

const socketService = new SocketService()

export default socketService