import socket from "@/service/socket";
import eventBus from "@/lib/eventBus";
import {EventName} from "@/service/type";

socket.registerEvent({
    method: "joinRoom",
    cb: (data) => {
        eventBus.emit(EventName.ON_JOIN_ROOM, data)
    }
})

socket.registerEvent({
    method: "videoStatus",
    cb: (data) => {
        eventBus.emit(EventName.ON_VIDEO_STATUS, data)
    }
})

socket.registerEvent({
    method: "audioStatus",
    cb: (data) => {
        eventBus.emit(EventName.ON_AUDIO_STATUS, data)
    }
})

socket.registerEvent({
    method: "leaveRoom",
    cb: (data) => {
        eventBus.emit(EventName.ON_LEAVE_ROOM, data)
    }
})