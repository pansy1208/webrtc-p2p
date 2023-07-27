import socket from "@/service/socket";
import eventBus from "@/lib/eventBus";
import {EventName, INewClientParams} from "@/service/type";

socket.registerEvent({
    method: "joinRoom",
    cb: (data) => {
        eventBus.emit(EventName.ON_JOIN_ROOM, data)
    }
})

socket.registerEvent({
    method: "newClient",
    cb: (data: INewClientParams) => {
        eventBus.emit(EventName.ON_NEW_CLIENT, data)
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
    method: "leave",
    cb: (data) => {
        eventBus.emit(EventName.ON_LEAVE, data)
    }
})

socket.registerEvent({
    method: "offer",
    cb: (data) => {
        eventBus.emit(EventName.ON_OFFER, data)
    }
})

socket.registerEvent({
    method: "answer",
    cb: (data) => {
        eventBus.emit(EventName.ON_ANSWER, data)
    }
})

socket.registerEvent({
    method: "icecandidate",
    cb: (data) => {
        eventBus.emit(EventName.ON_ICE_CANDIDATE, data)
    }
})