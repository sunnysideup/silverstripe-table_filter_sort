import { raw2attr, attr2raw } from '../prototypes/string.js'
import { isOnScreen } from '../prototypes/element.js'
import JSURL from '../jsurl.js'
import doT from '../dot.js'

// Attach utility functions to the String prototype
String.prototype.raw2attr = raw2attr
String.prototype.attr2raw = attr2raw
Element.prototype.isOnScreen = isOnScreen

export const myob = {
    debug: false,
    profile: false,
    useJSON: false,
    rowRawData: null,
    rawDataFieldKey: null,
    templateRow: '',
    templateRowCompiled: null,
    placeholderValue: 'N/A',
    baseURL: '',
    serverConnectionURL: '/tfs/',
    urlToLoad: '',
    serverDataToApply: { cfi: true, csr: true, mfv: true },
    filtersParentPageID: '',
    favouritesParentPageID: '',
    canPushState: false,
    holderNumber: 0,
    sizeOfFixedHeader: 0,
    maximumNumberOfFilterOptions: 12,
    maximumNumberOfNumericFilterOptions: 5,
    scrollToTopAtPageOpening: true,
    startWithOpenFilter: false,
    millisecondsBetweenActionsShort: 20,
    millisecondsBetweenActionsLong: 300,
    validDataTypes: ['date', 'number', 'boolean', 'string'],
    maximumRowsForHideIdentical: 5000,
    includeInFilter: [],
    excludeFromFilter: [],
    myTableHolder: myTableHolder,
    myFilterFormHolder: null,
    myFilterFormInner: null,
    myTable: null,
    myTableHead: null,
    myTableBody: null,
    myRows: null,
    myFloatingTable: null,
    dataDictionary: {},
    hasFixedTableHeader: true,
    fixedTableHeaderIsOn: null,
    hasKeywordSearch: true,
    keywordToFilterFieldArray: [],
    hasFavourites: null,
    hasFormElements: false,
    hasFavouritesSaving: false,
    hasFilterSaving: false,
    myRowsTotalCount: 0,
    myRowsSorted: [],
    myRowsMatching: [],
    myRowsVisible: [],
    filterAndSortVariables: ['cfi', 'cfc', 'cfx', 'csr', 'pge'],
    favouritesVariables: ['mfv'],
    cfi: {},
    cfc: [],
    cfx: {},
    csr: {},
    sfr: 0,
    pge: 0,
    visibleRowCount: 10,
    mfv: [],
    windowTimeoutStore: {},
    initFX1: null,
    initFX2: null,
    startRowFX1: null,
    startRowFX2: null,
    endRowFX1: null,
    endRowFX2: null,
    moreDetailsFX: null,
    greaterThanLabel: '&gt; ',
    lowerThanLabel: '&lt; ',
    matchRowCountSelector: '.match-row-number',
    minRowSelector: '.min-row-number',
    maxRowSelector: '.max-row-number',
    totalRowCountSelector: '.total-row-number',
    visibleRowCountSelector: '.total-showing-row-number select',
    paginationSelector: '.pagination',
    filteredCountHolder: '.tfs-match-count-holder',
    unfilteredCountHolder: '.tfs-no-match-count-holder',
    loadingClass: 'loading',
    fixedHeaderClass: 'fixed-header',
    filterInUseClass: 'tfs-filter-in-use',
    filterNotInUseClass: 'tfs-filter-not-in-use',
    filterIsOpenClass: 'filter-is-open',
    hasFilterClass: 'tfs-has-filter',
    doesNotHaveFilterClass: 'tfs-does-not-have-filter',
    hasFavouritesClass: 'tfs-has-favourites',
    hasFavouritesInFilterClass: 'tfs-has-favourites-in-filter',
    moreRowEntriesSelector: '.tfs-more-entries',
    commonContentHolderClass: 'tfs-common-content-holder',
    noMatchMessageClass: 'no-matches-message',
    filterFormHolderSelector: '.tfs-filter-form-holder',
    filterFormInnerSelector: '.tfs-filter-form-inner',
    tableSelector: 'table.tfs-table',
    rowSelector: 'tbody > tr.tfstr',
    filterItemAttribute: 'data-filter',
    inputValueDataAttribute: 'data-tfsvalue',
    showMoreDetailsSelector: '.more',
    moreDetailsSelector: '.hidden',
    favouriteLinkSelector: 'a.adf',
    showClass: 'show',
    hideClass: 'hide',
    matchClass: 'match',
    notMatchClass: 'no-match',
    openedClass: 'opened',
    directLinkClass: 'dl',
    selectedFilterItem: 'dl-on',
    favouriteClass: 'fav',
    currentSearchFilterClass: 'tfs-current-search-holder',
    openAndCloseFilterFormClass: 'tfs-open-filter-form',
    saveAndLoadClass: 'tfs-save-and-load',
    clearFilterClass: 'tfs-clear',
    showFavouritesSelector: '.filter-for-favourites a',
    sectionFilterClassAppendix: 'Filter',
    filterOptionsHolderClass: 'tfs-filter-form-options',
    filterGroupClass: 'tfs-filter-column',
    groupLabelClass: 'tfs-group-label',
    quickKeywordFilterSelector: 'input[name="QuickKeyword"]',
    inverseSelectionFilterClass: 'inverse-selection',
    sortLinkSelector: 'a.sortable',
    sortAscClass: 'sort-asc',
    sortDescClass: 'sort-desc',

    /**
     * Startup
     */
    init: function (holderNumber) {
        myob.holderNumber = holderNumber
        myob.myTableHolder = myTableHolder
        myob.myTableHolder.addClass(myob.loadingClass)

        // Setup initial rows and content
        myob.setHTMLAndTemplateRow()
        myob.setRowsWithDetails(true)
        myob.whatIsIncluded()

        if (myob.myRowsTotalCount > 0) {
            if (typeof myob.initFX1 === 'function') myob.initFX1()
            myob.myTableHolder.find(myob.matchRowCountSelector).html('...')

            // Reload DOM and process data
            setTimeout(() => {
                myob.turnHTMLIntoJSON()
                myob.dataSampling()
                myob.filterItemCollector()
                myob.dataDictionaryCollector()
                myob.hideIdenticalCols()
                myob.findDefaultSort()
                myob.buildFloatingHeaderTable()

                // Setup listeners
                ;[
                    'fixTableHeaderListener',
                    'setupFilterFormListeners',
                    'setupSortListeners',
                    'paginationListeners',
                    'setupMoreDetailsListener',
                    'openServerModalWindowListener',
                    'favouriteLinkListener',
                    'directFilterLinkListener',
                    'formElementsListener',
                    'addURLChangeListener'
                ].forEach(method => myob[method]())

                // Load data
                ;[
                    'retrieveLocalCookie',
                    'retrieveDataFromFragment',
                    'retrieveDataFromGetVar',
                    'retrieveDataFromServer'
                ].forEach(method => myob[method]())

                myob.myTableHolder.removeClass(myob.loadingClass)
                document.querySelector('body').scroll()

                if (typeof myob.initFX2 === 'function') myob.initFX2()
                myob.canPushState = true

                if (myob.startWithOpenFilter) {
                    setTimeout(
                        () =>
                            myob.myFilterFormHolder
                                .find('.' + myob.openAndCloseFilterFormClass)
                                .first()
                                .click(),
                        300
                    )
                }

                setTimeout(() => (myob.scrollToTopAtPageOpening = true), 1000)
            }, myob.millisecondsBetweenActionsShort)
        } else {
            myob.myTableHolder.removeClass(myob.loadingClass)
        }
    },

    setHTMLAndTemplateRow: function () {
        myob.profileStarter('setHTMLAndTemplateRow')

        myob.useJSON = myob.rowRawData !== null

        myob.myFilterFormHolder = myob.myTableHolder
            .find(myob.filterFormHolderSelector)
            .first()
        myob.myFilterFormInner = myob.myFilterFormHolder
            .find(myob.filterFormInnerSelector)
            .first()
        myob.myTable = myob.myTableHolder.find(myob.tableSelector).first()
        myob.myTableHead = myob.myTable.find('> thead')
        myob.myTableBody = myob.myTable.find('> tbody')

        if (
            myob.useJSON &&
            myob.templateRow.length === 0 &&
            myob.myTable.find(myob.rowSelector).length === 1
        ) {
            myob.buildTemplateRow()
        }

        myob.myTable.css('table-layout', 'fixed')

        // Base URL
        myob.baseURL = `document.querySelector{location.protocol}//document.querySelector{location.host}document.querySelector{location.pathname}document.querySelector{location.search}`

        myob.profileEnder('setHTMLAndTemplateRow')
    },

    buildFloatingHeaderTable: function () {
        myob.profileStarter('buildFloatingHeaderTable')
        myob.myFloatingTable = myob.myTable
            .clone()
            .addClass('floating-table')
            .appendTo(myob.myTableHolder)
        myob.profileEnder('buildFloatingHeaderTable')
    },

    setRows: function () {
        myob.profileStarter('setRows')
        myob.myRows =
            myob.useJSON && myob.myRows === null
                ? document.querySelector(myob.templateRow)
                : myob.myTable.find(myob.rowSelector)
        myob.profileEnder('setRows')
    },

    setRowsWithDetails: function (hideAll = false, findMyRowsSorted = false) {
        myob.profileStarter('setRowsWithDetails')
        myob.setRows()

        if (myob.myRowsSorted.length === 0) findMyRowsSorted = true
        if (findMyRowsSorted) myob.myRowsSorted = []

        if (myob.useJSON) {
            if (hideAll) myob.myTableBody.empty()
            if (findMyRowsSorted) {
                myob.myRowsSorted = Object.keys(myob.rowRawData)
            }
        } else {
            if (findMyRowsSorted || hideAll) {
                myob.myRows.each((_, el) => {
                    el = document.querySelector(el)
                    if (findMyRowsSorted) myob.myRowsSorted.push(el.attr('id'))
                    if (hideAll)
                        el.addClass(myob.hideClass).removeClass(myob.showClass)
                })
            }
        }

        myob.myRowsTotalCount ||= myob.myRowsSorted.length
        myob.profileEnder('setRowsWithDetails')
    },
    whatIsIncluded: function () {
        // Check for favourites saving
        myob.hasFavouritesSaving =
            typeof myob.favouritesParentPageID === 'string' &&
            myob.favouritesParentPageID.length > 0
        if (!myob.hasFavouritesSaving) {
            document
                .querySelector('.' + myob.saveAndLoadClass + '.favourites')
                .remove()
        }

        // Check for filter saving
        myob.hasFilterSaving =
            typeof myob.filtersParentPageID === 'string' &&
            myob.filtersParentPageID.length > 0
        if (!myob.hasFilterSaving) {
            document
                .querySelector('.' + myob.saveAndLoadClass + '.filters')
                .remove()
        }

        // Determine if there are favourites
        if (myob.hasFavourites === null) {
            myob.hasFavourites =
                myob.myRows.find(myob.favouriteLinkSelector).length > 0
        }

        // Build data dictionary categories
        if (myob.hasKeywordSearch) myob.dataDictionaryBuildCategory('Keyword')
        if (myob.hasFavourites) myob.dataDictionaryBuildCategory('Favourites')
    },
    turnHTMLIntoJSON: function () {
        myob.profileStarter('turnHTMLIntoJSON')
        if (!myob.useJSON) {
            myob.setRows()
            myob.rowRawData = {}

            myob.myRows.each(function (i, row) {
                row = document.querySelector(row)
                let rowID = row.attr('id') || 'tfs-row-' + i
                row.attr('id', rowID)
                myob.rowRawData[rowID] = { ID: rowID }

                row.find('[' + myob.filterItemAttribute + ']').each(function (
                    _,
                    el
                ) {
                    el = document.querySelector(el)
                    let value = myob.findValueOfObject(el)
                    let category = el.attr(myob.filterItemAttribute)
                    myob.dataDictionaryBuildCategory(category)

                    if (value.length > 0) {
                        let rowData = myob.rowRawData[rowID]
                        if (typeof rowData[category] === 'undefined') {
                            rowData[category] = value
                        } else if (!Array.isArray(rowData[category])) {
                            rowData[category] = [rowData[category], value]
                        } else {
                            rowData[category].push(value)
                        }
                    }
                })
            })
        }

        myob.profileEnder('turnHTMLIntoJSON')
    },

    dataSampling: function () {
        myob.profileStarter('dataSampling')
        let isFirstRow = true

        for (let rowID in myob.rowRawData) {
            if (!myob.rowRawData.hasOwnProperty(rowID)) continue

            let rowData = myob.rowRawData[rowID]
            for (let category in rowData) {
                if (!rowData.hasOwnProperty(category)) continue

                // Update category to real key if available
                if (myob.rawDataFieldKey && myob.rawDataFieldKey[category]) {
                    let realCategory = myob.rawDataFieldKey[category]
                    rowData[realCategory] = rowData[category]
                    delete rowData[category]
                    category = realCategory
                }

                if (isFirstRow) {
                    myob.dataDictionaryBuildCategory(category)
                }

                let rawValue = rowData[category]
                let dataDict = myob.dataDictionary[category]

                if (dataDict['IsEditable'] === null) {
                    let firstRow = myob.useJSON
                        ? document.querySelector(myob.templateRow)
                        : myob.myTableBody.find('tr').first()

                    let elementSelector =
                        'input, select, textarea[' +
                        myob.filterItemAttribute +
                        '="' +
                        category +
                        '"]'
                    dataDict['IsEditable'] =
                        firstRow.find(elementSelector).length > 0
                }

                if (dataDict['DataType'] === '') {
                    if (category === 'keyword') {
                        Object.assign(dataDict, {
                            DataType: 'string',
                            CanFilter: true,
                            CanSort: false,
                            IsEditable: false
                        })
                    } else if (category === 'favourites') {
                        Object.assign(dataDict, {
                            DataType: 'boolean',
                            CanFilter: true
                        })
                    }

                    while (Array.isArray(rawValue)) {
                        rawValue = rawValue[0]
                        dataDict['CanSort'] = false
                    }

                    let type = myob.findDataTypeOfValue(rawValue)
                    if (type === 'object') {
                        Object.assign(dataDict, {
                            CanFilter: false,
                            CanSort: false,
                            IsEditable: false
                        })
                    } else if (type === 'array') {
                        console.error(
                            'ERROR: object cannot be an array ' + type
                        )
                        console.error(rawValue)
                    } else {
                        dataDict['DataType'] = type
                    }
                }
            }
            isFirstRow = false
        }

        myob.profileEnder('dataSampling')
    },

    //===================================================================
    // SCRIPT SECTION: *** COLLECTORS
    //=================================================================

    // Collect filter items from row data and update the keyword field
    filterItemCollector: function () {
        myob.profileStarter('filterItemCollector')

        Object.entries(myob.rowRawData).forEach(([rowID, rowData]) => {
            let keywordString = ''

            Object.entries(rowData).forEach(([category, values]) => {
                myob.dataDictionaryBuildCategory(category)
                values = Array.isArray(values) ? values : [values]

                values.forEach(value => {
                    myob.addValueToRow(category, rowID, value)
                    keywordString +=
                        ' ' + myob.joinRecursively(value, ' ').trim() + ' '
                })
            })

            myob.addValueToRow(
                'Keyword',
                rowID,
                keywordString.trim().replace(/ +/g, ' ')
            )
        })

        myob.profileEnder('filterItemCollector')
    },

    // Ensure the data dictionary is properly built and validates sort/filter options
    dataDictionaryCollector: function () {
        myob.profileStarter('dataDictionaryCollector')

        Object.keys(myob.dataDictionary).forEach(category => {
            myob.dataDictionaryBuildCategory(category)

            let sortLink = myob.myTable
                .find(
                    `document.querySelector{myob.sortLinkSelector}[data-sort-field="document.querySelector{category}"]`
                )
                .first()
            myob.dataDictionary[category]['CanSort'] ??= sortLink.length > 0

            myob.dataDictionarySorter(category)

            if (myob.dataDictionary[category]['CanFilter'] == null) {
                if (['Keyword', 'ID'].includes(category)) {
                    myob.dataDictionary[category]['CanFilter'] = false
                } else if (
                    myob.includeInFilter.length > 0 &&
                    !myob.includeInFilter.includes(category)
                ) {
                    myob.dataDictionary[category]['CanFilter'] = false
                } else if (myob.excludeFromFilter.includes(category)) {
                    myob.dataDictionary[category]['CanFilter'] = false
                } else if (
                    sortLink &&
                    sortLink.attr('data-sort-only') === 'true'
                ) {
                    myob.dataDictionary[category]['CanFilter'] = false
                } else {
                    myob.dataDictionary[category]['CanFilter'] =
                        myob.dataDictionary[category]['Options'].length > 1 ||
                        myob.dataDictionary[category]['IsEditable']
                }
            }
        })

        if (myob.includeInFilter.length === 0) {
            myob.includeInFilter = Object.keys(myob.dataDictionary).filter(
                category => myob.dataDictionary[category]['CanFilter']
            )
        }

        myob.profileEnder('dataDictionaryCollector')
    },

    // Build category in data dictionary if not already built
    dataDictionaryBuildCategory: function (category) {
        const defaultValues = {
            Label: myob.replaceAll(category, '-', ' '),
            CanFilter: null,
            CanSort: null,
            DataType: '',
            Options: [],
            Values: {},
            IsEditable: null,
            Built: true
        }

        myob.dataDictionary[category] ??= {}
        Object.keys(defaultValues).forEach(key => {
            myob.dataDictionary[category][key] ??= defaultValues[key]
        })
    },

    // Update the data dictionary for matching rows
    updateMatchingRowsInDataDictionary: function (category, newValue) {
        myob.myRowsMatching.forEach(rowID => {
            myob.replaceRowValue(category, rowID, newValue)
        })
    },

    // Set category label
    setCategoryLabel: function (category, label) {
        myob.dataDictionary[category]['Label'] = label
        return myob
    },

    // Get category label
    getCategoryLabel: function (category) {
        if (!myob.dataDictionary[category]) return category
        myob.dataDictionaryBuildCategory(category)
        return myob.dataDictionary[category]['Label']
    },

    // Replace all values in a row
    replaceRowValue: function (category, rowID, newValue) {
        myob.dataDictionaryBuildCategory(category)
        myob.dataDictionary[category]['Values'][rowID] = Array.isArray(newValue)
            ? []
            : [newValue]
        myob.addValueToRow(category, rowID, newValue)
    },

    // Add value to a row and update data dictionary
    addValueToRow: function (category, rowID, value) {
        myob.dataDictionaryBuildCategory(category)
        myob.dataDictionary[category]['Values'][rowID] ??= []
        myob.dataDictionary[category]['Values'][rowID].push(value)
        myob.addOptionToCategory(category, value)
        myob.standardiseEmptyRows(category, rowID)
    },

    // Standardize empty rows
    standardiseEmptyRows: function (category, rowID) {
        if (myob.isEmptyValue(myob.dataDictionary[category]['Values'][rowID])) {
            myob.dataDictionary[category]['Values'][rowID] = myob.validateValue(
                category,
                myob.dataDictionary[category]['Values'][rowID]
            )
        }
    },

    // Add option to category if not already present
    addOptionToCategory: function (category, value) {
        value = myob.validateValue(category, value)
        if (myob.isEmptyValue(value) || typeof value === 'object') return

        if (Array.isArray(value)) {
            value.forEach(val => myob.addOptionToCategory(category, val))
        } else if (!myob.dataDictionary[category]['Options'].includes(value)) {
            myob.dataDictionary[category]['Options'].push(value)
        }
    },
    // Find data type of value
    findDataTypeOfValue: function (value) {
        if (myob.isEmptyValue(value)) return ''
        if (Array.isArray(value)) return 'array'
        if (typeof value === 'object') return 'object'
        return typeof value === 'boolean'
            ? 'boolean'
            : isNaN(value)
            ? 'string'
            : 'number'
    },

    // Check if value is empty
    isEmptyValue: function (value) {
        return (
            [undefined, '', false, 0, '0', null].includes(value) ||
            (Array.isArray(value) && !value.length) ||
            (typeof value === 'object' && JSON.stringify(value) === '{}')
        )
    },

    // Validate the value based on data dictionary
    validateValue: function (
        category,
        value,
        forcedDataType = myob.dataDictionary[category]?.DataType
    ) {
        if (myob.isEmptyValue(value)) {
            return (
                {
                    date: '',
                    number: 0,
                    boolean: false,
                    object: null,
                    string: ''
                }[forcedDataType] || ''
            )
        }
        if (Array.isArray(value))
            return value.map(v =>
                myob.validateValue(category, v, forcedDataType)
            )
        if (typeof value === 'object') return value

        switch (forcedDataType) {
            case 'date':
                return myob.isDate(value) ? value : ''
            case 'number':
                return isNaN(value)
                    ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0
                    : value
            case 'boolean':
                return value === true || value === false ? value : false
            case 'string':
            case '':
                return String(value).trim()
            default:
                console.log(
                    `ERROR: unknown data type: document.querySelector{forcedDataType} for document.querySelector{value}`
                )
                return value
        }
    },

    // Hide cells that are identical across all rows
    hideIdenticalCols: function () {
        myob.profileStarter('hideIdenticalCols')
        if (myob.myRowsTotalCount > myob.maximumRowsForHideIdentical) {
            myob.myTableHolder
                .find('.' + myob.commonContentHolderClass)
                .remove()
            return
        }

        let commonContentExists = false
        let commonContent = ''

        Object.entries(myob.dataDictionary).forEach(([category, data]) => {
            if (data.Options.length === 1 && !data.IsEditable) {
                commonContentExists = true
                let value = myob.useJSON
                    ? data.Options[0]
                    : myob.myRows
                          .find(
                              `[document.querySelector{myob.filterItemAttribute}="document.querySelector{category}"]`
                          )
                          .html()
                if (
                    value &&
                    !myob.myTableBody
                        .find(
                            `[document.querySelector{myob.filterItemAttribute}="document.querySelector{category}"]`
                        )
                        .hasClass('ignore-content')
                ) {
                    commonContent += `<li class="tfs-filter-column"><strong>document.querySelector{myob.getCategoryLabel(
                        category
                    )}:</strong> <span>document.querySelector{value}</span></li>`
                }
            }
        })

        if (commonContentExists && commonContent.length > 10) {
            const title =
                myob.myTableHolder
                    .find('.' + myob.commonContentHolderClass)
                    .attr('data-title') || ''
            myob.myTableHolder
                .find('.' + myob.commonContentHolderClass)
                .html(
                    `<div class="document.querySelector{myob.commonContentHolderClass}-inner"><h3>document.querySelector{title}</h3><ul>document.querySelector{commonContent}</ul></div>`
                )
        } else {
            myob.myTableHolder
                .find('.' + myob.commonContentHolderClass)
                .remove()
        }

        myob.profileEnder('hideIdenticalCols')
    },

    // Sort list options for a category
    dataDictionarySorter: function (category) {
        const options = myob.dataDictionary[category]?.Options
        if (Array.isArray(options)) {
            const type = myob.dataDictionary[category]?.DataType
            options.sort((a, b) =>
                type === 'number'
                    ? parseFloat(a) - parseFloat(b)
                    : String(a).localeCompare(String(b))
            )
        }
    },

    // Find default sort
    findDefaultSort: function () {
        const currentSortObject =
            myob.myTableHead
                .find(
                    `.document.querySelector{myob.sortDescClass}, .document.querySelector{myob.sortAscClass}`
                )
                .first() ||
            myob.myTableHead
                .find(
                    `document.querySelector{myob.sortLinkSelector}[data-sort-default=true]`
                )
                .first() ||
            myob.myTableHead.find(myob.sortLinkSelector).first()

        if (currentSortObject?.length > 0) {
            myob.csr.sdi = currentSortObject.attr('data-sort-direction')
            myob.csr.sct = currentSortObject.attr('data-sort-field')
        }
    },

    //===================================================================
    // SCRIPT SECTION: *** LISTENERS
    //===================================================================

    // Fix table header listener
    fixTableHeaderListener: function () {
        myob.profileStarter('fixTableHeaderListener')
        if (myob.hasFixedTableHeader) {
            document
                .querySelector(window)
                .delayedOn(
                    'load resize',
                    () => (myob.fixedTableHeaderIsOn = null),
                    myob.millisecondsBetweenActionsShort
                )
            document
                .querySelector(window)
                .delayedOn(
                    'load scroll resize',
                    () => myob.fixTableHeader(),
                    myob.millisecondsBetweenActionsShort
                )
        }
        myob.profileEnder('fixTableHeaderListener')
    },

    // Set up filter form listeners
    setupFilterFormListeners: function () {
        myob.profileStarter('setupFilterFormListeners')

        // Set default and toggle form visibility
        myob.myFilterFormInner.hide()
        myob.myFilterFormHolder.on(
            'click',
            '.' + myob.openAndCloseFilterFormClass,
            function (e) {
                e.preventDefault()
                myob.myFilterFormInner.slideToggle(() => {
                    myob.myTableHolder.toggleClass(myob.filterIsOpenClass)
                    if (myob.myTableHolder.hasClass(myob.filterIsOpenClass))
                        myob.scrollToTopOfHolder()
                })
            }
        )

        // Clear filter
        myob.myFilterFormHolder.on(
            'click',
            '.' + myob.clearFilterClass + ' a',
            e => {
                e.preventDefault()
                myob.resetAll()
            }
        )

        // Handle input changes for filtering
        myob.myFilterFormInner.on('change', 'input', () => {
            myob.windowTimeoutStoreSetter(
                'runCurrentFilter',
                myob.runCurrentFilter,
                myob.millisecondsBetweenActionsShort
            )
        })

        // Update keyword filter from input changes
        const updateKeyword = function () {
            const val = document.querySelector(this).val()
            myob.myFilterFormInner.find('input[name="Keyword"]').val(val)
            myob.runCurrentFilter()
        }
        myob.myFilterFormHolder.on(
            'input paste change',
            myob.quickKeywordFilterSelector,
            updateKeyword
        )
        myob.myFilterFormInner.on(
            'input paste change',
            'input[name="Keyword"]',
            updateKeyword
        )

        // Invert checkbox selections
        myob.myFilterFormInner.on(
            'click',
            '.' + myob.inverseSelectionFilterClass,
            function () {
                document
                    .querySelector(this)
                    .toggleClass('flipped')
                    .parent()
                    .find('input[type="checkbox"]')
                    .each((_, el) => {
                        el = document.querySelector(el)
                        el.prop('checked', !el.prop('checked')).change()
                    })
            }
        )

        myob.profileEnder('setupFilterFormListeners')
    },

    // Set up sorting listeners
    setupSortListeners: function () {
        myob.myTableHolder.on('click', myob.sortLinkSelector, function (e) {
            e.preventDefault()
            const myEl = document.querySelector(this)
            myob.csr.sdi = myEl.attr('data-sort-direction')
            myob.csr.sct = myEl.attr('data-sort-field')
            myob.runCurrentSort()
        })
    },

    // Pagination listeners
    paginationListeners: function () {
        myob.myTableHolder.on(
            'click',
            myob.paginationSelector + ' a',
            function (e) {
                e.preventDefault()
                myob.gotoPage(document.querySelector(this).attr('data-page'))
            }
        )

        myob.myTableHolder.on(
            'input paste change',
            myob.visibleRowCountSelector,
            () => {
                myob.windowTimeoutStoreSetter(
                    'visibleRowCount',
                    () => {
                        const val = myob.visibleRowCountValidator(
                            myob.myTableHolder
                                .find(myob.visibleRowCountSelector)
                                .val()
                        )
                        if (val && myob.visibleRowCount !== val) {
                            myob.visibleRowCount = val
                            window.localStorage.setItem(
                                'TFS_visibleRowCount',
                                val
                            )
                            myob.gotoPage(0, true)
                        }
                    },
                    myob.millisecondsBetweenActionsLong
                )
            }
        )
    },

    // Set up toggle details listener
    setupMoreDetailsListener: function () {
        myob.myTableHolder.on(
            'click',
            myob.showMoreDetailsSelector,
            function (e) {
                e.preventDefault()
                const myEl = document.querySelector(this)
                const row = myEl.closest('tr').toggleClass(myob.openedClass)
                row.find(myob.moreDetailsSelector)
                    .slideToggle()
                    .toggleClass(myob.openedClass)
                if (typeof myob.moreDetailsFX === 'function')
                    myob.moreDetailsFX(myob)
            }
        )
    },

    // Add URL change listener for back button functionality
    addURLChangeListener: function () {
        window.addEventListener('popstate', () => {
            myob.canPushState = false
            myob.retrieveDataFromFragment()
            myob.retrieveDataFromGetVar()
            myob.retrieveDataFromServer()
            myob.canPushState = true
        })
    },

    // Set up direct filter link listener
    directFilterLinkListener: function () {
        myob.myTableBody.on(
            'click',
            `[document.querySelector{myob.filterItemAttribute}].document.querySelector{myob.directLinkClass}`,
            function (e) {
                e.preventDefault()
                const myEl = document.querySelector(this)
                myob.addDirectlyToFilter(
                    myEl.attr(myob.filterItemAttribute),
                    myob.findValueOfObject(myEl).toLowerCase()
                )
                myob.runCurrentFilter()
            }
        )
    },

    // Form elements listener
    formElementsListener: function () {
        myob.profileStarter('formElementsListener')
        if (myob.hasFormElements) {
            myob.myTableBody.on(
                'change',
                `input[document.querySelector{myob.filterItemAttribute}], select[document.querySelector{myob.filterItemAttribute}], textarea[document.querySelector{myob.filterItemAttribute}]`,
                function () {
                    const el = document.querySelector(this)
                    const category = el.attr(myob.filterItemAttribute)
                    if (
                        category &&
                        typeof myob.dataDictionary[category] === 'object'
                    ) {
                        const oldValue = el.attr(myob.inputValueDataAttribute)
                        const newValue = myob.findCurrentValueOfInputObject(el)
                        myob.replaceOptionInCategory(
                            category,
                            oldValue,
                            newValue
                        )
                        myob.replaceRowValue(
                            category,
                            el.closest('tr').attr('id'),
                            newValue
                        )
                    }
                    el.removeAttr(myob.inputValueDataAttribute)
                    myob.findValueOfObject(el)
                }
            )
        }
        myob.profileEnder('formElementsListener')
    },

    // Favourite link listener
    favouriteLinkListener: function () {
        if (myob.hasFavourites) {
            myob.myTableBody.on(
                'click',
                myob.favouriteLinkSelector,
                function (e) {
                    e.preventDefault()
                    const rowHolder = document
                        .querySelector(this)
                        .closest('td, th')
                        .closest('tr')
                        .toggleClass(myob.favouriteClass)
                    const id = rowHolder.attr('id')
                    if (id) {
                        myob.toggleIdInFavourites(id)
                        myob.checkAndSaveFavourites()
                    }
                    myob.myTableHolder.toggleClass(
                        myob.hasFavouritesClass,
                        myob.mfv.length > 0
                    )
                }
            )

            myob.myTableHolder.on(
                'click',
                myob.showFavouritesSelector,
                function (e) {
                    e.preventDefault()
                    const filterToTrigger = myob.myFilterFormInner
                        .find('input[name="Favourites"]')
                        .first()
                    filterToTrigger
                        .prop('checked', !filterToTrigger.prop('checked'))
                        .trigger('change')
                }
            )
        }
    },

    //===================================================================
    // SCRIPT SECTION: *** CREATE FILTER FORM
    //===================================================================
    // Create filter form
    createFilterForm: function () {
        myob.profileStarter('createFilterForm')

        if (myob.myFilterFormInner.length > 0) {
            myob.myFilterFormInner.empty()
            let content = `<form class="document.querySelector{myob.filterOptionsHolderClass}">`
            let tabIndex = 2
            const awesompleteFields = []

            myob.includeInFilter.forEach((category, categoryIndex) => {
                if (myob.dataDictionary[category]?.CanFilter) {
                    const options = myob.dataDictionary[category]['Options']
                    const type = myob.dataDictionary[category]['DataType']
                    let filterType = type === 'string' ? 'tag' : type

                    if (
                        (type !== 'number' &&
                            options.length <=
                                myob.maximumNumberOfFilterOptions) ||
                        (type === 'number' &&
                            options.length <=
                                myob.maximumNumberOfNumericFilterOptions)
                    ) {
                        content += myob.makeSectionHeaderForForm(
                            'checkbox',
                            category
                        )
                        options.forEach(value => {
                            content += myob.makeFieldForForm(
                                'checkbox',
                                category,
                                tabIndex,
                                value
                            )
                        })
                    } else {
                        content += myob.makeSectionHeaderForForm(
                            filterType,
                            category
                        )
                        content += myob.makeFieldForForm(
                            filterType,
                            category,
                            tabIndex,
                            0
                        )
                        if (type === 'string') awesompleteFields.push(category)
                    }
                    content += myob.makeSectionFooterForForm()
                    tabIndex++
                }
            })

            if (myob.hasFavourites) {
                content +=
                    myob.makeSectionHeaderForForm('favourites', 'Favourites') +
                    myob.makeFieldForForm(
                        'favourites',
                        'Favourites',
                        tabIndex,
                        0
                    ) +
                    myob.makeSectionFooterForForm()
                tabIndex++
            }

            if (myob.hasKeywordSearch) {
                content +=
                    myob.makeSectionHeaderForForm('keyword', 'Keyword') +
                    myob.makeFieldForForm('keyword', 'Keyword', tabIndex, 0) +
                    myob.makeSectionFooterForForm()
            }

            content += '</form>'
            myob.myFilterFormInner.html(content)

            if (myob.hasKeywordSearch) {
                const keywordVal = myob.myFilterFormInner
                    .find('input[name="Keyword"]')
                    .val()
                myob.myFilterFormHolder
                    .find(myob.quickKeywordFilterSelector)
                    .val(keywordVal)
            }

            awesompleteFields.forEach(category => {
                const input = document.getElementById(
                    myob.myFilterFormInner
                        .find(
                            `input[name="document.querySelector{category}"].awesomplete`
                        )
                        .first()
                        .attr('id')
                )
                new Awesomplete(input, {
                    list: myob.dataDictionary[category]['Options'],
                    autoFirst: true,
                    filter: (text, input) =>
                        Awesomplete.FILTER_CONTAINS(text, input) &&
                        !Awesomplete.blackList.includes(text.value),
                    replace: function (text) {
                        myob.makeCheckboxSection(this.input, text.value)
                        this.input.value = ''
                        Awesomplete.blackList.push(text.value)
                        myob.runCurrentFilter()
                    }
                })
                input.addEventListener('awesomplete-close', function (e) {
                    if (e.reason === 'nomatches')
                        document
                            .querySelector(e.srcElement)
                            .val(val => val.slice(0, -1))
                })
                Awesomplete.blackList = []
            })
        }

        myob.profileEnder('createFilterForm')
    },

    // Make section header for form
    makeSectionHeaderForForm: function (type, category) {
        const myClass = type + myob.sectionFilterClassAppendix
        return `
        <div class="${
            myob.filterGroupClass
        } ${myClass}" field-type="${type}" data-to-filter="${category.raw2attr()}">
            ${
                type === 'checkbox'
                    ? `<span class="${myob.inverseSelectionFilterClass}"><i class="material-icons">flip</i></span>`
                    : ''
            }
            <label class="${myob.groupLabelClass}">${myob.getCategoryLabel(
            category
        )}</label>
            <ul>`
    },

    // Make field for form
    makeFieldForForm: function (type, category, tabIndex, valueIndex) {
        if (valueIndex === null) return ''
        const cleanCategory = category.replace(/\W/g, '')
        const cleanValue = valueIndex.toString().raw2safe().toLowerCase()
        const valueID =
            `TFS_document.querySelector{cleanCategory}_document.querySelector{cleanValue}`.replace(
                /[^a-zA-Z0-9]+/g,
                '_'
            )

        if (
            myob.myFilterFormInner.find(`input#document.querySelector{valueID}`)
                .length > 0
        )
            return ''
        let currentValueForForm = ''
        switch (type) {
            case 'favourites':
                return `
                <li class="document.querySelector{type}Field">
                    <input class="favourites" type="checkbox" name="document.querySelector{category.raw2attr()}" id="document.querySelector{valueID}" tabindex="document.querySelector{tabIndex}" document.querySelector{
                    myob.cfi[category] ? 'checked="checked"' : ''
                } />
                    <label for="document.querySelector{valueID}">❤ ❤ ❤</label>
                </li>`
            case 'keyword':
            case 'tag':
                const placeholder =
                    type === 'keyword' ? 'separate phrases by comma' : ''
                const extraClass =
                    type === 'keyword' ? 'keyword' : 'awesomplete'
                currentValueForForm =
                    type === 'tag' && myob.cfi[category]
                        ? myob.cfi[category].map(c => c.vtm).join(', ')
                        : ''
                return `
                <li class="document.querySelector{type}Field">
                    <input class="text document.querySelector{extraClass}" type="text" name="document.querySelector{category.raw2attr()}" id="document.querySelector{valueID}" tabindex="document.querySelector{tabIndex}" value="document.querySelector{currentValueForForm}" placeholder="document.querySelector{placeholder.raw2attr()}" />
                </li>`
            case 'checkbox':
                const checked = myob.cfi[category]?.some(
                    c => cleanValue === c.vtm
                )
                    ? 'checked="checked"'
                    : ''
                return `
                <li class="document.querySelector{type}Field">
                    <input class="checkbox" type="checkbox" name="document.querySelector{valueID}" id="document.querySelector{valueID}" value="document.querySelector{cleanValue}" document.querySelector{checked} tabindex="document.querySelector{tabIndex}" />
                    <label for="document.querySelector{valueID}">document.querySelector{valueIndex
                    .toString()
                    .raw2safe()}</label>
                </li>`
            case 'number':
            case 'date':
                currentValueForForm = myob.cfi[category]?.[0] || {
                    gt: '',
                    lt: ''
                }
                return `
                <li class="document.querySelector{type}Field">
                    <span class="gt">
                        <label for="document.querySelector{valueID}_gt">document.querySelector{
                    myob.greaterThanLabel
                }</label>
                        <input data-dir="gt" data-label="document.querySelector{myob.greaterThanLabel.raw2attr()}" class="number" step="any" type="number" name="document.querySelector{cleanCategory}[]" id="document.querySelector{valueID}" tabindex="document.querySelector{tabIndex}" value="document.querySelector{
                    currentValueForForm.gt
                }" />
                    </span>
                    <span class="lt">
                        <label for="document.querySelector{valueID}_lt">document.querySelector{
                    myob.lowerThanLabel
                }</label>
                        <input data-dir="lt" data-label="document.querySelector{myob.lowerThanLabel.raw2attr()}" class="number" step="any" type="number" name="document.querySelector{cleanCategory}[]" id="document.querySelector{valueID}_lt" tabindex="document.querySelector{tabIndex}" value="document.querySelector{
                    currentValueForForm.lt
                }" />
                    </span>
                </li>`.replace(
                    /number/g,
                    type === 'date' ? 'datetime-local' : 'number'
                )
        }
    },

    // Make section footer for form
    makeSectionFooterForForm: function () {
        return '</ul></div>'
    },

    // Make checkbox section
    makeCheckboxSection: function (input, valueIndex) {
        input = document.querySelector(input)
        const category = input.attr('name')
        const tabIndex = input.attr('tabindex')
        let html = myob.makeFieldForForm(
            'checkbox',
            category,
            tabIndex,
            valueIndex
        )
        if (html) {
            html = html.replace('<input ', '<input checked="checked" ')
            input.closest('ul').append(html)
        }
    },

    //===================================================================
    // SCRIPT SECTION: *** MANIPULATIONS
    //===================================================================
    resetAll: function () {
        myob.cfi = {}
        myob.myRowsMatching = []
        myob.createFilterForm()
        myob.windowTimeoutStoreSetter(
            'runCurrentFilter',
            myob.runCurrentFilter,
            myob.millisecondsBetweenActionsShort
        )
    },

    runCurrentSort: function () {
        myob.profileStarter('runCurrentSort')
        myob.windowTimeoutStoreSetter('endRowManipulation')
        myob.sfr = 0

        // Update sort UI
        myob.myTableHead
            .find(myob.sortLinkSelector)
            .removeClass(
                `document.querySelector{myob.sortAscClass} document.querySelector{myob.sortDescClass}`
            )
        const sortElement = myob.myTableHead
            .find(
                `document.querySelector{myob.sortLinkSelector}[data-sort-field="document.querySelector{myob.csr.sct}"]`
            )
            .first()

        if (sortElement.length) {
            myob.startRowManipulation()

            const category = myob.csr.sct
            myob.dataDictionaryBuildCategory(category)
            const type = myob.dataDictionary[category]['DataType']
            const rows = myob.dataDictionary[category]['Values']
            const sortedArray = Object.keys(rows).map(rowID => [
                myob.validateValue(category, rows[rowID][0]),
                rowID
            ])

            myob.myTableBody.empty()

            // Sort rows and update table
            sortedArray.sort(myob.getSortComparator(type))
            if (myob.csr.sdi === 'desc') {
                sortedArray.reverse()
                sortElement
                    .attr('data-sort-direction', 'asc')
                    .addClass(myob.sortDescClass)
            } else {
                sortElement
                    .attr('data-sort-direction', 'desc')
                    .addClass(myob.sortAscClass)
            }

            myob.myRowsSorted = sortedArray.map(([_, rowID]) => rowID)
            if (!myob.useJSON) {
                const rowsMap = {}
                myob.myTableBody.find('> tr').each((_, el) => {
                    const row = document.querySelector(el)
                    rowsMap[row.attr('id')] = row
                })
                myob.myRowsSorted.forEach(rowID =>
                    myob.myTableBody.append(rowsMap[rowID])
                )
            }

            myob.windowTimeoutStoreSetter(
                'endRowManipulation',
                myob.endRowManipulation,
                myob.millisecondsBetweenActionsShort
            )
        }

        myob.profileEnder('runCurrentSort')
    },

    runCurrentFilter: function () {
        myob.profileStarter('runCurrentFilter')
        myob.windowTimeoutStoreSetter('endRowManipulation')
        myob.sfr = 0
        myob.workOutCurrentFilter()
        myob.startRowManipulation()

        if (!myob.hasFilter()) {
            myob.myRowsMatching = [...myob.myRowsSorted]
            myob.myRows
                .addClass(myob.matchClass)
                .removeClass(myob.notMatchClass)
        } else {
            myob.myRowsMatching = []
            myob.myRowsSorted.forEach(rowID => {
                let rowMatches = true

                for (const categoryToMatch of Object.keys(myob.cfi)) {
                    let matches = false
                    for (const searchObj of myob.cfi[categoryToMatch]) {
                        const values =
                            myob.dataDictionary[categoryToMatch]['Values'][
                                rowID
                            ]
                        if (Array.isArray(values)) {
                            for (let value of values) {
                                value = myob.validateValue(
                                    categoryToMatch,
                                    value
                                )
                                if (categoryToMatch === 'Keyword') {
                                    const keywords = searchObj.vtm.split(' ')
                                    matches = keywords.every(keyword =>
                                        value
                                            .toLowerCase()
                                            .includes(
                                                keyword.raw2safe().toLowerCase()
                                            )
                                    )
                                } else {
                                    matches =
                                        (categoryToMatch === 'Favourites' &&
                                            myob.mfv.includes(rowID)) ||
                                        value === searchObj.vtm
                                }
                                if (matches) break
                            }
                        }
                        if (matches) break
                    }
                    if (!matches) {
                        rowMatches = false
                        break
                    }
                }

                if (rowMatches) {
                    myob.myRowsMatching.push(rowID)
                    myob.myTableBody
                        .find(`#document.querySelector{rowID}`)
                        .addClass(myob.matchClass)
                        .removeClass(myob.notMatchClass)
                } else {
                    myob.myTableBody
                        .find(`#document.querySelector{rowID}`)
                        .addClass(myob.notMatchClass)
                        .removeClass(myob.matchClass)
                }
            })
        }

        myob.windowTimeoutStoreSetter(
            'endRowManipulation',
            myob.endRowManipulation,
            myob.millisecondsBetweenActionsShort
        )
        myob.profileEnder('runCurrentFilter')
    },

    gotoPage: function (page, force) {
        myob.profileStarter('gotoPage')
        const newSFR = page * myob.visibleRowCount

        if (newSFR !== myob.sfr || force) {
            myob.windowTimeoutStoreSetter('endRowManipulation')
            myob.sfr = newSFR
            myob.startRowManipulation()
            myob.windowTimeoutStoreSetter(
                'endRowManipulation',
                myob.endRowManipulation,
                myob.millisecondsBetweenActionsShort
            )
        }

        myob.profileEnder('gotoPage')
    },

    reloadCurrentPage: function () {
        myob.profileStarter('reloadCurrentPage')
        myob.windowTimeoutStoreSetter('endRowManipulation')
        myob.startRowManipulation()
        myob.windowTimeoutStoreSetter(
            'endRowManipulation',
            myob.endRowManipulation,
            myob.millisecondsBetweenActionsShort
        )
        myob.profileEnder('reloadCurrentPage')
    },

    //===================================================================
    // SCRIPT SECTION: *** SCROLLING
    //===================================================================

    /**
     * Scroll to the top of the table holder when needed
     */
    scrollToTopOfHolder: function () {
        if (myob.canPushState && myob.scrollToTopAtPageOpening) {
            let position =
                myob.myTableHolder.position().top -
                (myob.sizeOfFixedHeader || 0)
            document
                .querySelector('html, body')
                .animate(
                    { scrollTop: position },
                    myob.millisecondsBetweenActionsLong
                )
            myob.scrollToTopAtPageOpening = true
        } else {
            window.scrollTo(window.scrollX, window.scrollY)
        }
    },

    /**
     * Adjust fixed table header visibility based on scroll
     */
    fixTableHeader: function () {
        myob.profileStarter('fixTableHeader')

        if (!myob.hasFixedTableHeader) return

        const tableWidth = myob.myTableHead.width()
        if (tableWidth > 100) myob.myFilterFormHolder.width(tableWidth)

        const showFixedHeader =
            myob.myTableHolder.isOnScreen() &&
            document.querySelector(window).scrollTop() >
                myob.myTableBody.offset().top

        if (showFixedHeader && !myob.fixedTableHeaderIsOn) {
            myob.myTableHolder
                .removeClass(myob.filterIsOpenClass)
                .addClass(myob.fixedHeaderClass)
            myob.myFilterFormInner.slideUp(0)
            myob.myFloatingTable
                .width(tableWidth)
                .css('top', myob.myFilterFormHolder.outerHeight(true) - 2)
            myob.myTable.css(
                'margin-top',
                myob.myFilterFormHolder.outerHeight(true) - 2
            )
            myob.fixedTableHeaderIsOn = true
        } else if (!showFixedHeader && myob.fixedTableHeaderIsOn) {
            myob.myTableHolder.removeClass(myob.fixedHeaderClass)
            myob.myTable.css('margin-top', 0)
            myob.fixedTableHeaderIsOn = false
        }

        myob.profileEnder('fixTableHeader')
    },
    //===================================================================
    // SCRIPT SECTION: *** ROW MANIPULATION: START + END
    //===================================================================

    startRowManipulation: function () {
        myob.profileStarter('startRowManipulation')
        myob.startRowFX1?.(myob)

        myob.myTable.addClass(myob.hideClass)
        myob.setRowsWithDetails(true)
        myob.startRowFX2?.(myob)

        myob.profileEnder('startRowManipulation')
    },

    endRowManipulation: function () {
        myob.profileStarter('endRowManipulation')
        myob.endRowFX1?.(myob)

        myob.setRowsWithDetails()
        let minRow = myob.sfr,
            matchCount = 0,
            actualVisibleRowCount = 0,
            tempRowsMatching = myob.myRowsMatching.slice(0)

        myob.myRowsVisible = []
        if (myob.useJSON) {
            myob.myRowsSorted.forEach(rowID => {
                let match = tempRowsMatching.includes(rowID)
                if (match) {
                    matchCount++
                    if (
                        matchCount > minRow &&
                        actualVisibleRowCount < myob.visibleRowCount
                    ) {
                        actualVisibleRowCount++
                        myob.myRowsVisible.push(rowID)
                    }
                }
            })
            myob.buildRows()
        } else {
            myob.myRows.each((_, el) => {
                el = document.querySelector(el)
                let rowID = el.attr('id')
                if (!myob.hasFilter() || el.hasClass(myob.matchClass)) {
                    matchCount++
                    if (
                        matchCount > minRow &&
                        actualVisibleRowCount < myob.visibleRowCount
                    ) {
                        actualVisibleRowCount++
                        el.removeClass(myob.hideClass).addClass(myob.showClass)
                        myob.myRowsVisible.push(rowID)
                    }
                }
            })
        }

        myob.highlightFilteredRows()
        myob.myTable.removeClass(myob.hideClass)

        if (!myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
            myob.windowTimeoutStoreSetter(
                'scrollToTopOfHolder',
                () => myob.scrollToTopOfHolder(),
                myob.millisecondsBetweenActionsLong
            )
        }

        myob.createPagination(minRow, matchCount, actualVisibleRowCount)
        myob.setRowsWithDetails()
        myob.pushState()
        myob.endRowFX2?.(myob)

        myob.profileEnder('endRowManipulation')
        myob.debugger()
    },

    buildTemplateRow: function () {
        myob.templateRow = myob.myTableBody.clone().html()
        myob.templateRowCompiled = doT.template(myob.templateRow)
        myob.myTableBody.empty()
    },

    buildRows: function () {
        myob.profileStarter('buildRows')
        let html = ''

        myob.myRowsVisible.forEach(rowID => {
            let rowData = { RowID: rowID }
            Object.keys(myob.dataDictionary).forEach(category => {
                let value = myob.dataDictionary[category]['Values'][rowID]
                if (value !== undefined) rowData[category] = value
            })
            html += myob.templateRowCompiled(rowData)
        })

        if (html) {
            myob.myTableBody.html(html)
            myob.myTableBody
                .find(
                    `input[document.querySelector{myob.inputValueDataAttribute}], select[document.querySelector{myob.inputValueDataAttribute}], textarea[document.querySelector{myob.inputValueDataAttribute}]`
                )
                .each((_, el) => {
                    let value = document
                        .querySelector(el)
                        .attr(myob.inputValueDataAttribute)
                        .raw2safe()
                    document.querySelector(el).val(value)
                })
            myob['mfv'].forEach(rowID =>
                myob.myTableBody
                    .find(`#document.querySelector{rowID}`)
                    .addClass(myob.favouriteClass)
            )
        }

        myob.profileEnder('buildRows')
    },

    highlightFilteredRows: function () {
        myob.profileStarter('highlightFilteredRows')
        myob.myTableBody
            .find(`.document.querySelector{myob.selectedFilterItem}`)
            .removeClass(myob.selectedFilterItem)

        Object.keys(myob.cfi).forEach(categoryToMatch => {
            let options = myob.cfi[categoryToMatch].map(filter => filter.vtm)
            myob.myTableBody
                .find(
                    `[document.querySelector{myob.filterItemAttribute}="document.querySelector{categoryToMatch}"]`
                )
                .each((_, el) => {
                    let elValue = document
                        .querySelector(el)
                        .text()
                        .raw2safe()
                        .toLowerCase()
                    if (options.includes(elValue))
                        document
                            .querySelector(el)
                            .addClass(myob.selectedFilterItem)
                })
        })

        myob.profileEnder('highlightFilteredRows')
    },

    createPagination: function (minRow, matchCount, actualVisibleRowCount) {
        document
            .querySelector(`.document.querySelector{myob.noMatchMessageClass}`)
            .toggle(matchCount === 0)
        let maxRow = minRow + actualVisibleRowCount,
            pageCount = Math.ceil(matchCount / myob.visibleRowCount),
            currentPage = Math.floor(myob.sfr / myob.visibleRowCount),
            pageHTML = ''

        if (pageCount > 1) {
            for (let i = 0; i < pageCount; i++) {
                if (currentPage === i) {
                    pageHTML += `<span>[document.querySelector{i + 1}]</span> `
                } else if (
                    (i >= currentPage - 2 && i <= currentPage + 2) ||
                    i === 0 ||
                    i === pageCount - 1
                ) {
                    pageHTML += `<a href="#" class="document.querySelector{
                        i === 0 ? 'first' : i === pageCount - 1 ? 'last' : ''
                    } document.querySelector{
                        i === currentPage - 1
                            ? 'prev'
                            : i === currentPage + 1
                            ? 'next'
                            : ''
                    }" data-page="document.querySelector{i}">document.querySelector{i + 1}</a> `
                } else if (pageHTML.slice(-3) !== '...') {
                    pageHTML += '... '
                }
            }
            myob.myTableHolder.find(myob.moreRowEntriesSelector).show()
        }

        minRow++
        myob.myTableHolder
            .find(myob.filteredCountHolder)
            .toggle(myob.myRowsTotalCount !== matchCount)
        myob.myTableHolder
            .find(myob.unfilteredCountHolder)
            .toggle(myob.myRowsTotalCount === matchCount)
        myob.myTableHolder.find(myob.minRowSelector).text(minRow)
        myob.myTableHolder.find(myob.maxRowSelector).text(maxRow)
        myob.myTableHolder.find(myob.matchRowCountSelector).text(matchCount)
        myob.myTableHolder
            .find(myob.totalRowCountSelector)
            .text(myob.myRowsTotalCount)
        myob.myTableHolder
            .find(myob.visibleRowCountSelector)
            .val(myob.visibleRowCount)
        myob.myTableHolder.find(myob.paginationSelector).html(pageHTML)
    },

    //===================================================================
    // SCRIPT SECTION: *** CALCULATIONS
    //===================================================================
    hasFilter: function () {
        return myob.objectSize(myob.cfi) > 0
    },

    workOutCurrentFilter: function () {
        myob.profileStarter('workOutCurrentFilter')
        let html = '',
            vtms = []
        myob.cfi = {}

        myob.myFilterFormHolder
            .find('.' + myob.filterGroupClass)
            .each((_, el) => {
                const categoryHolder = document.querySelector(el)
                const category = categoryHolder.attr('data-to-filter')
                const fieldType = categoryHolder
                    .attr('field-type')
                    .toLowerCase()
                myob.cfi[category] = []

                categoryHolder.find('input').each((_, input) => {
                    input = document.querySelector(input)
                    const val = input.val(),
                        validatedVal = myob.validateValue(category, val)
                    let vtm = val.raw2safe().toLowerCase()

                    if (fieldType === 'keyword' && vtm.length > 1) {
                        vtm.split(',').forEach(item => {
                            item = item.trim()
                            if (item.length > 1) {
                                if (
                                    myob.keywordToFilterFieldArray?.length > 0
                                ) {
                                    myob.keywordToFilterFieldArray.forEach(
                                        keywordCategory => {
                                            if (
                                                item.length > 2 &&
                                                myob.dataDictionary[
                                                    keywordCategory
                                                ].Options.includes(item)
                                            ) {
                                                myob.cfi[keywordCategory] =
                                                    myob.cfi[keywordCategory] ||
                                                    []
                                                myob.cfi[keywordCategory].push({
                                                    vtm: item,
                                                    ivl: item
                                                })
                                                item = ''
                                            }
                                        }
                                    )
                                }
                                if (item.length > 1) {
                                    myob.cfi[category].push({
                                        vtm: item,
                                        ivl: item
                                    })
                                }
                            }
                        })
                    } else if (
                        ['checkbox', 'favourites'].includes(fieldType) &&
                        input.is(':checked')
                    ) {
                        myob.cfi[category].push({ vtm, ivl: val })
                        if (fieldType === 'favourites') {
                            myob.myTableHolder.addClass(
                                myob.hasFavouritesInFilterClass
                            )
                        }
                    } else if (
                        ['date', 'number', 'boolean'].includes(fieldType) &&
                        validatedVal
                    ) {
                        const dir = input.attr('data-dir')
                        myob.cfi[category][0] = myob.cfi[category][0] || {}
                        myob.cfi[category][0][dir] = validatedVal
                        vtms.push(input.attr('data-label') + validatedVal)
                    }
                })

                if (vtms.length > 0) {
                    html += `<li class="category"><strong>document.querySelector{myob.getCategoryLabel(
                        category
                    )}:</strong> <span>document.querySelector{vtms.join(
                        '</span><span>'
                    )}</span></li>`
                }
            })

        const targetDomElement = myob.myTableHolder.find(
            '.' + myob.currentSearchFilterClass
        )
        if (myob.hasFilter()) {
            html = `<ul>document.querySelector{html}</ul>`
            const title = targetDomElement.attr('data-title')
            if (title) html = `<h3>document.querySelector{title}</h3>` + html
            myob.myTableHolder
                .addClass(myob.hasFilterClass)
                .removeClass(myob.doesNotHaveFilterClass)
        } else {
            html = targetDomElement.attr('data-no-filter-text')
            myob.myTableHolder
                .removeClass(myob.hasFilterClass)
                .addClass(myob.doesNotHaveFilterClass)
        }

        targetDomElement.html(html)
        myob.profileEnder('workOutCurrentFilter')
    },

    //===================================================================
    // SCRIPT SECTION: *** URL CHANGES, SERVER, URL, AND COOKIE INTERACTIONS
    //===================================================================
    pushState: function () {
        if (myob.canPushState)
            history.replaceState(null, null, myob.currentURL())
    },

    currentURL: function () {
        let urlObject = {}
        myob.filterAndSortVariables.forEach(varName => {
            let value = myob[varName]
            if (
                (typeof value === 'number' && value !== 0) ||
                (typeof value === 'string' && value.length > 0) ||
                typeof value === 'boolean' ||
                (typeof value === 'object' && myob.objectSize(value) > 0)
            ) {
                urlObject[varName] = value
            }
        })
        let urlpart =
            typeof JSURL !== 'undefined'
                ? JSURL.stringify(urlObject)
                : 'tfs=' + encodeURI(JSON.stringify(urlObject))
        return `document.querySelector{myob.baseURL}#document.querySelector{urlpart}`
    },

    retrieveLocalCookie: function () {
        myob.mfv = JSON.parse(window.localStorage.getItem('TFS_mfv')) || []
        if (myob.mfv.length) myob.serverDataToApply['mfv'] = true

        let visibleRowCount = myob.visibleRowCountValidator(
            window.localStorage.getItem('TFS_visibleRowCount')
        )
        if (visibleRowCount !== false) myob.visibleRowCount = visibleRowCount
    },

    retrieveDataFromFragment: function () {
        if (typeof JSURL !== 'undefined' && location.hash.length > 0) {
            let data = JSURL.tryParse(location.hash.substr(1), {})
            Object.keys(data).forEach(property => {
                if (property === 'pge')
                    data[property] = parseInt(data[property])
                myob[property] = data[property]
                myob.serverDataToApply[property] = true
            })
        }
    },

    retrieveDataFromGetVar: function () {
        if (location.search.length > 0) {
            let qd = {}
            location.search
                .substr(1)
                .split('&')
                .forEach(item => {
                    let [k, v] = item.split('=')
                    ;(qd[k] = qd[k] || []).push(decodeURIComponent(v))
                })
            if (qd.load?.[0]) myob.urlToLoad = qd.load
        }
    },

    retrieveDataFromServer: function () {
        myob.profileStarter('retrieveDataFromServer')
        let forceFavs = false

        if (myob.urlToLoad) {
            let url = `document.querySelector{myob.serverConnectionURL}load/document.querySelector{myob.urlToLoad}/`
            myob.urlToLoad = ''
            document.querySelector
                .getJSON(url, response => {
                    let data = JSON.parse(response.Data)
                    Object.keys(data).forEach(property => {
                        myob[property] = data[property]
                        myob.serverDataToApply[property] = true
                        if (property === 'mfv') forceFavs = true
                    })
                    myob.processRetrievedData(forceFavs)
                })
                .fail(() => alert('Error - trying it again ...'))
        } else {
            myob.processRetrievedData(forceFavs)
        }
        myob.profileEnder('retrieveDataFromServer')
    },

    processRetrievedData: function (forceFavs) {
        myob.profileStarter('processRetrievedData')

        if (myob.serverDataToApply['mfv']) {
            myob.checkAndSaveFavourites()
            if (!myob.useJSON)
                myob.myTableBody
                    .find('tr.' + myob.favouriteClass)
                    .removeClass(myob.favouriteClass)
            myob.myTableHolder.toggleClass(
                myob.hasFavouritesClass,
                myob.mfv.length > 0
            )
            if (
                forceFavs &&
                myob.myTableHolder.hasClass(myob.hasFavouritesInFilterClass)
            ) {
                myob.myTableHolder
                    .find(myob.showFavouritesSelector)
                    .click()
                    .click()
            }
            delete myob.serverDataToApply['mfv']
        }

        myob.createFilterForm()
        ;['cfi', 'csr', 'pge'].forEach(prop => {
            if (myob.serverDataToApply[prop]) {
                if (prop === 'cfi') myob.runCurrentFilter()
                if (prop === 'csr') {
                    let { sct: category, sdi: direction } = myob.csr
                    myob.myTableHead
                        .find(myob.sortLinkSelector)
                        .removeClass(
                            `document.querySelector{myob.sortAscClass} document.querySelector{myob.sortDescClass}`
                        )
                        .filter(
                            `[data-sort-field='document.querySelector{category}']`
                        )
                        .attr('data-sort-direction', direction)
                        .click()
                }
                if (prop === 'pge') myob.gotoPage(myob.pge)
                delete myob.serverDataToApply[prop]
            }
        })

        myob.profileEnder('processRetrievedData')
    },

    //===================================================================
    // SCRIPT SECTION: *** HELPER FUNCTIONS
    //===================================================================
    getSortComparator: type =>
        type === 'number' ? myob.numberComparator : myob.stringComparator,

    findValueOfObject: myObject => {
        if (!myObject) return ''
        let nodeName = myObject.prop('nodeName') || 'SPAN'
        let mytype = nodeName.toUpperCase()
        let val =
            mytype === 'INPUT' || mytype === 'SELECT' || mytype === 'TEXTAREA'
                ? myObject.attr(myob.inputValueDataAttribute)
                : myObject.text().trim()
        if (!val) {
            val = myob.findCurrentValueOfInputObject(myObject, mytype)
            myObject.attr(myob.inputValueDataAttribute, val)
        }
        return val.raw2safe()
    },

    findCurrentValueOfInputObject: (
        element,
        elementType = element.prop('nodeName').toUpperCase()
    ) => {
        switch (elementType) {
            case 'INPUT':
                return element.attr('type') === 'checkbox'
                    ? element[0].checked
                        ? 'YES'
                        : 'NO'
                    : element.val()
            case 'SELECT':
                return element.find('option:selected').text()
            case 'TEXTAREA':
                return element.val()
            default:
                return ''
        }
    },

    replaceAll: (string, search, replacement) =>
        string.split(search).join(replacement),

    objectSize: object => (object ? Object.keys(object).length : 0),

    objectSort: object => {
        return Object.keys(object)
            .map(key => [key, object[key]])
            .sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
            .reduce(
                (acc, [key, val]) =>
                    typeof val === 'string' ? { ...acc, [key]: val } : acc,
                {}
            )
    },

    visibleRowCountValidator: val =>
        Number.isInteger((val = parseInt(val))) && val > 0 && val < 10000
            ? val
            : false,

    makeID: () =>
        Array(9)
            .fill()
            .map(() =>
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.charAt(
                    Math.floor(Math.random() * 52)
                )
            )
            .join(''),

    stringComparator: (a, b) =>
        a[0].toLowerCase().localeCompare(b[0].toLowerCase()),

    numberComparator: (a, b) =>
        isNaN(a[0]) ? 1 : isNaN(b[0]) ? -1 : a[0] - b[0],

    joinRecursively: (varOfAnyType, glue) => {
        if (
            typeof varOfAnyType === 'string' ||
            typeof varOfAnyType === 'number'
        )
            return varOfAnyType
        if (Array.isArray(varOfAnyType))
            return varOfAnyType
                .map(item => myob.joinRecursively(item, glue))
                .join(glue)
        if (typeof varOfAnyType === 'object')
            return Object.values(varOfAnyType)
                .map(item => myob.joinRecursively(item, glue))
                .join(glue)
        return ''
    },

    isDate: value => {
        if (typeof value !== 'string') return false
        let bits = value.split('/')
        let d = new Date(bits[2], bits[1] - 1, bits[0])
        return d && d.getMonth() + 1 == bits[1]
    },

    windowTimeoutStoreSetter: (
        name,
        fx,
        delay = myob.millisecondsBetweenActionsShort
    ) => {
        if (myob.windowTimeoutStore[name])
            window.clearTimeout(myob.windowTimeoutStore[name])
        if (fx) myob.windowTimeoutStore[name] = window.setTimeout(fx, delay)
    },

    profileStarter: name => {
        if (myob.debug) {
            console.log('_______________________')
            console.count(name)
            console.time(name)
            if (myob.profile) console.profile(name)
        }
    },

    profileEnder: name => {
        if (myob.debug) {
            if (myob.profile) console.profileEnd(name)
            console.timeEnd(name)
            console.log('-----------------------')
        }
    },

    debugger: () => {
        if (!myob.debug) return
        console.log(
            '_______________________',
            'SORTED',
            myob.myRowsSorted,
            'HAS FILTER',
            myob.hasFilter() ? 'TRUE' : 'FALSE',
            'MATCHING',
            myob.myRowsMatching,
            'VISIBLE',
            myob.myRowsVisible
        )

        const categorizedProps = Object.entries(myob).reduce(
            (acc, [key, value]) => {
                const type = typeof value
                if (type === 'boolean') acc.booleans[key] = value
                else if (type === 'string') acc.strings[key] = value
                else if (type === 'number') acc.numbers[key] = value
                else if (type === 'object') {
                    if (Array.isArray(value)) acc.arrays[key] = value
                    else if (value instanceof document.querySelector)
                        acc.jqueries[key] = value
                    else acc.objects[key] = value
                } else acc.others[key] = value
                return acc
            },
            {
                booleans: {},
                strings: {},
                numbers: {},
                arrays: {},
                jqueries: {},
                objects: {},
                others: {}
            }
        )

        Object.entries(categorizedProps).forEach(([category, props]) => {
            console.log(
                `_______________________ document.querySelector{category.toUpperCase()}`,
                props
            )
        })
    }
}
