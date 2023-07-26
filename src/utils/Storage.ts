class Storage {
    setItem(key: string, value: any, isLocal: boolean = false) {
        if (isLocal) {
            localStorage.setItem(key, JSON.stringify(value))
        } else {
            sessionStorage.setItem(key, JSON.stringify(value))
        }
    }

    getItem(key: string, isLocal: boolean = false) {
        let result = isLocal ? localStorage.getItem(key) : sessionStorage.getItem(key)
        if(typeof result === "string") {
            return JSON.parse(result)
        }
    }

    removeItem(key: string, isLocal: boolean = false) {
        isLocal ? localStorage.removeItem(key) : sessionStorage.removeItem(key)
    }

    clear(isLocal: boolean = false) {
        isLocal ? localStorage.clear() : sessionStorage.clear()
    }

    clearAll() {
        sessionStorage.clear()
        localStorage.clear()
    }
}

const storage = new Storage()
export default storage