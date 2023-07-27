import type {funcType, IEvent} from "@/lib/type";

class EventBus {
    private eventList: IEvent[] = []

    public emit(key: string, data?: any) {
        this.eventList.forEach(item => {
            if (item.key === key) {
                item.value(data)
            }
        })
    }

    public on(key: string, cb: funcType) {
        this.eventList.push({
            key: key,
            value: cb
        })
    }

    public off(key: string): EventBus {
        for (let i = this.eventList.length - 1; i >= 0; i--) {
            if (this.eventList[i].key === key) {
                this.eventList.splice(i, 1)
            }
        }
        return this
    }

    public clear() {
        this.eventList = []
    }
}

const eventBus = new EventBus()
export default eventBus