import {socket_url} from "@/config";
import type {IEventParams} from "@/service/type";
import eventBus from "@/lib/eventBus";

class Socket {
    private socket: WebSocket | null = null
    private timeout: number = -1
    private intervalIndex = -1
    private eventList: IEventParams[] = []

    public init() {
        if ("WebSocket" in window) {
            this.socket = new WebSocket(socket_url)
        } else {
            console.error("you browser don't support websocket")
            return
        }

        this.socket.addEventListener("open", () => {
            this.intervalIndex = window.setInterval(() => {
                this.timeout++
                if (this.timeout > 3 && this.timeout <= 10) {
                    eventBus.emit("onNetworkError", 1000)
                }else if(this.timeout > 10){
                    eventBus.emit("onNetworkError", 1001)
                }
            }, 1000)
        })

        this.socket.addEventListener("message", (message) => {
            if (message.data === "ping") {
                this.timeout = -1
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
        clearInterval(this.intervalIndex)
        this.socket!.close()
    }

}

const socket = new Socket()
export default socket