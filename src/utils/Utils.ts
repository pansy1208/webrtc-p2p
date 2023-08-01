class Utils {
    isPhone(): boolean {
        const maxPoints = navigator.maxTouchPoints
        const isSupportTouch = 'ontouchstart' in window
        return !!(isSupportTouch && maxPoints && maxPoints > 2);
    }

    exchangeStyle(dom: NodeListOf<HTMLElement>, oldIndex: number, newIndex: number) {
        let currentBigVideoStyle: any = {}
        let selectVideoStyle: any = {}

        let currentZoomStyleList: any = dom[oldIndex].style
        let selectVideoStyleList: any = dom[newIndex].style

        for (let key of currentZoomStyleList) {
            currentBigVideoStyle[key] = currentZoomStyleList[key]
        }

        for (let key of selectVideoStyleList) {
            selectVideoStyle[key] = selectVideoStyleList[key]
        }

        dom[oldIndex].removeAttribute("style")
        dom[newIndex].removeAttribute("style")

        Object.keys(currentBigVideoStyle).forEach(item => {
            selectVideoStyleList[item] = currentBigVideoStyle[item]
        })
        Object.keys(selectVideoStyle).forEach(item => {
            currentZoomStyleList[item] = selectVideoStyle[item]
        })
    }
}

const utils = new Utils()
export default utils