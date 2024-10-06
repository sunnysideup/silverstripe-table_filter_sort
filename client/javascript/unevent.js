export function delayedOn (element, event, callback, delay = 0) {
    let timer

    function handler (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            callback.apply(this, args)
        }, delay)
    }

    element.addEventListener(event, handler)

    // Returning a function to allow removing the event listener if needed
    return function removeListener () {
        element.removeEventListener(event, handler)
    }
}
