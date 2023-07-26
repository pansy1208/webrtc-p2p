class Utils {
    isPhone(): boolean {
        const maxPoints = navigator.maxTouchPoints
        const isSupportTouch = 'ontouchstart' in window
        return !!(isSupportTouch && maxPoints && maxPoints > 2);
    }
}

const utils = new Utils()
export default utils