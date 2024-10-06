import { myob } from './tfs-parts/myob.js'

document.addEventListener('DOMContentLoaded', () => {
    if (Array.isArray(TableFilterSortVars)) {
        TableFilterSortVars.forEach(vars => {
            const element = document.querySelector(vars.mySelector)
            if (element) {
                vars.myObject = tableFilterSort(element, vars)
            }
        })
    }
})

// Function to handle table filtering and sorting
function tableFilterSort (element, options) {
    let holderNumber = 0
    const localMyob = { ...myob, ...options }

    // Initialize each element
    localMyob.init(holderNumber++)

    // Expose public API
    return {
        getVar: variableName =>
            localMyob.hasOwnProperty(variableName)
                ? localMyob[variableName]
                : undefined,
        setVar: (variableName, value) => {
            localMyob[variableName] = value
            return this
        },
        reloadCurrentPage: () => {
            localMyob.reloadCurrentPage()
            return this
        },
        gotoPage: pageNumber => {
            localMyob.gotoPage(pageNumber)
            return this
        },
        reloadCurrentSelection: () => {
            localMyob.gotoPage(0, true)
            return this
        },
        updateDataDictionaryForCategoryRow: (category, rowID, newValue) => {
            localMyob.replaceRowValue(category, rowID, newValue)
            return this
        },
        updateMatchingRowsInDataDictionary: (category, newValue) => {
            localMyob.updateMatchingRowsInDataDictionary(category, newValue)
            return this
        },
        resetAll: () => {
            localMyob.resetAll()
            return this
        }
    }
}
