// Utility function to check if an element is in the viewport
export function isOnScreen () {
    const viewportTop = window.scrollY
    const viewportBottom = viewportTop + window.innerHeight
    const bounds = this.getBoundingClientRect()
    return bounds.top <= viewportBottom && bounds.bottom >= viewportTop
}
