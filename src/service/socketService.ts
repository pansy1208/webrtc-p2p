import socket from "@/service/socket";
import type {IJoinParams, IStatusParams} from "@/service/type";

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

    public changeVideoStatus(params: IStatusParams) {
        socket.sendMessage(params)
    }

    public changeAudioStatus(params: IStatusParams) {
        socket.sendMessage(params)
    }
}

const socketService = new SocketService()

export default socketService