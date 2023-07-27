import {socket_url} from "@/config";
import type {IEventParams} from "@/service/type";

class Socket {
    private socket: WebSocket | null = null
    private timeout: number = -1
    private eventList: IEventParams[] = []

    public init() {
        if ("WebSocket" in window) {
            this.socket = new WebSocket(socket_url)
        } else {
            console.error("you browser don't support websocket")
            return
        }

        this.socket.addEventListener("open", () => {

        })

        this.socket.addEventListener("message", (message) => {
            if (message.data === "ping") {
                this.socket!.send("pong")
            } else if (message.data === "nping") {
                this.socket!.send("npong")
            } else {
                const messageObj = JSON.parse(message.data)
                for (let i = 0; i < this.eventList.length; i++) {
                    if (this.eventList[i].method === messageObj.method) {
                        this.eventList[i].cb(messageObj)
                        break
                    }
                }
            }
        })

        this.socket.addEventListener("close", () => {

        })
    }

    public sendMessage(params: any) {
        this.socket!.send(JSON.stringify(params))
    }

    public registerEvent(event: IEventParams) {
        this.eventList.push(event)
    }

    public close() {
        this.socket!.close()
    }

}

const socket = new Socket()
export default socket