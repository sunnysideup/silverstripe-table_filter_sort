if(typeof window.JSURL === 'undefined') {
    var JSURL = require('./jsurl.js');
}


jQuery(document).ready(
    function(){
        if(typeof TableFilterSortVars !== 'undefined') {
            if(Array.isArray(TableFilterSortVars)) {
                for(var i = 0; i < TableFilterSortVars.length; i++) {
                    var vars = TableFilterSortVars[i];
                    TableFilterSortVars[i].myObject = jQuery(vars.mySelector).tableFilterSort(vars);
                }
            }
        }
    }
);



(function( $ ) {

    $.fn.tableFilterSort = function(options){

        var holderNumber = 0;

        var myTableHolder = this;

        var myob = {


            /**
             *
             *
             * INPUTS
             *
             *
             */

            /**
             * turn on to see what is going on in console
             * @type {boolean}
             */
            debug: false,

            /**
             * set to true if we use a templateRow
             * and rowRawData
             * @type {Boolean}
             */
            useJSON: false,

            /**
             * do we use straight HTML (value is NO)
             * or do we use a JSON object of data
             * @type {boolean}
             */
            rowRawData: null,

            /**
             *
             * @type {string}
             */
            templateRow: '',

            /**
             *
             * @type string
             */
            placeholderStartDelimiter: '{{',

            /**
             *
             * @type {string}
             */
            placeholderEndDelimiter: '}}',

            /**
             *
             * @type {String}
             */
            placeholderValue: 'N/A',

            /**
             * url before the ?
             * @type {string}
             */
            baseURL: '',

            /**
             * url before the ?
             * @type {string}
             */
            serverConnectionURL: '/tfs/',

            /**
             * the URL to load ...
             * @type {string}
             */
            urlToLoad: '',

            /**
             * list of server data to apply ...
             * by default we apply everything on load!
             * e.g.
             * cfi: true
             * @type {Object}
             */
            serverDataToApply: {
                'cfi': true,
                'csr': true,
                'mfv': true
            },

            /**
             * the code for all pages that share the same filters
             * @type {string}
             */
            filtersParentPageID: '',

            /**
             * the code for all pages that share the same favourites
             * @type {string}
             */
            favouritesParentPageID: '',

            /**
             * can we update the URL
             * this also doubles as init completed.
             * @type {boolean}
             */
            canPushState: false,

            /**
             * the index in TableFilterSortTableList that holds this guy
             * @type {int}
             */
            holderNumber: 0,

            /**
             * fixed header to keep into consideration
             * when scrolling to top.
             * @type {Number}
             */
            sizeOfFixedHeader: 0,

            /**
             * maximum number of checkboxes in the filter before it becomes a text filter
             * @type {integer}
             */
            maximumNumberOfFilterOptions: 12,

            /**
             * maximum number of checkboxes in the filter for a number before it becomes a text filter
             * @type {integer}
             */
            maximumNumberOfNumericFilterOptions: 5,

            /**
             *
             * @type {boolean}
             */
            scrollToTopAtPageOpening: true,


            /**
             *
             * @type {boolean}
             */
            millisecondsBetweenActionsShort: 10,

            /**
             *
             * @type {boolean}
             */
            millisecondsBetweenActionsLong: 100,

            /**
             * @type {array}
             */
            validDataTypes: ['number', 'string', 'date', 'boolean'],

            /**
             * when trying to establish the data-type
             * max
             * @type {int}
             */
            maxNumberOfValuesToCheck: 500,


            /**
             * if we have more than the rows specified then we do not search for identicals
             * @type {integer}
             */
            maximumRowsForHideIdentical: 500,

            /**
             * categories to be excluded from filter ...
             * @type {array}
             */
            excludeFromFilter:[],

            /**
             *
             *
             * jQuery Objects
             *
             *
             */

            /**
             * selector for outer holder
             *
             * @type {jQuery}
             */
            myTableHolder: myTableHolder,

            /**
             * selector for the filter form
             * @type {jQuery}
             */
            myFilterFormHolder: null,

            /**
             * selector for the filter form inner
             * @type {jQuery}
             */
            myFilterFormInner: null,

            /**
             * selector for the table
             * @type {jQuery}
             */
            myTable: null,

            /**
             * selector for the table header
             * @type {jQuery}
             */
            myTableHead: null,

            /**
             * selector for the tbody
             * @type {jQuery}
             */
            myTableBody: null,

            /**
             * [myRows description]
             * @type {jQuery}
             */
            myFloatingTable: null,

            /**
             * the rows as HTML
             * if we use JSON then this is the template row
             * if we do not use JSON then this is a jQuery object of all rows
             * @type {jQuery}
             */
            myRows: null,




            /**
             *
             *
             * DATA dataDictionary
             *
             *
             */

            /**
             * to keep field options simple ...
             * MyFieldA:
             *    CanFilter: true
             *    CanSort: false
             *    DataType: number | string | date
             *    Options: [A,B,C]
             *    Values: {RowID1: [A], [RowID2]: [B], 3: RowID: [C]}
             *    IsEditable: false
             * MyFieldB:
             *    CanFilter: true
             *    CanSort: false
             *    DataType: number | string | date
             *    Options: [A,B,C]
             *    Values: {RowID1: [A], [RowID2]: [B], 3: RowID: [C]}
             *    IsEditable: true
             * Options To Row save the RowIDs for each row with the index number of the value...
             * @type {object}
             */
            dataDictionary: {},


            /**
             * Does the table need to have a fixed header at all???
             * @type {boolean}
             */
            hasFixedTableHeader: true,

            /**
             * Has the fixed header been set at the moment???
             * @type {boolean}
             */
            hasFixedTableHeaderSet: false,

            /**
             *
             * @type {boolean}
             */
            hasKeywords: true,

            /**
             * can favourites be selected by user?
             * @type {boolean}
             */
            hasFavourites: false,

            /**
             * are their form elements the user can edit
             * and filter with ...
             * @type {boolean}
             */
            hasFormElements: false,

            /**
             *
             * @type {boolean}
             */
            hasFavouritesSaving: false,

            /**
             * can filters be saved?
             * @type {boolean}
             */
            hasFilterSaving: false,


            /**
             *
             *
             * Row Stats and holders
             *
             *
             */

            /**
             * number of rows
             * @type {Number}
             */
            myRowsTotalCount: 0,

            /**
            * a list of all rows in the sorted order
            * @type Array
            */
            myRowsSorted: [],

            /**
             * a list of matching rows by RowID
             * @type array
             */
            myRowsMatching: [],

            /**
             * a list of matching rows that are visible, by row ID
             * @type array
             */
            myRowsVisible: [],


            /**
             *
             *
             * Sorting and Filtering Variables
             *
             *
             */

            /**
             * variables that determine the filter and sort
             *  - cfi: details of current filter
             *  - cfc: which categories are OR instead of AND
             *  - cfx: which category VALUES are to be EXCLUDED
             *  - csr: details on currentSort
             *  - sfr: show from row
             * @type {array}
             */
            filterAndSortVariables: [
                "cfi",
                "cfc",
                "cfx",
                "csr",
                "pge"
            ],

            /**
             * variables that determine the favourites
             *  - mfv
             * @type {array}
             */
            favouritesVariables: ['mfv'],

            /**
             * list of current filters by category
             * "Colour" => [{ivl: "Red", vtm: "red"}, {ivl: "Green", vtm: "green"}],
             * "Size" => [{ivl: "XXL", vtm: "xxl"}, {ivl: "S", vtm: "small"}]
             * @var {object}
             */
            cfi: {},

            /**
             * current filter categories that are OR rather than AND
             * e.g. [Colour] means that, in the filter any matching colours are OR
             * in relation to other filters like Size and Style
             * @var {array}
             */
            cfc: [],

            /**
             * current category filter values that are to be excluded
             * "Colour" => [Red, Blue]
             * when the user
             * @var {object}
             */
            cfx: {},

            /**
             * has two variables:
             * "Direction" => 'ASC'
             * "Field" => 'MyField'
             * @type {array}
             */
            csr: {},

            /**
             * starting point for showing rows
             * Show From Row
             * @type {integer}
             */
            sfr: 0,

            /**
             * go to page
             * @type {integer}
             */
            pge: 0,

            /**
             * rows to show
             * @type {integer}
             */
            visibleRowCount: 100,


            /**
             *
             *
             * FAVOURITES
             *
             *
             */


            /**
             * list of favourites
             * @type {Array}
             */
            mfv: [],

            /**
             *
             *
             * INTERNAL VARIABLES
             *
             *
             */

            /**
             * storing setTimeout so that we can cancel them
             * @type {Object}
             */
            windowTimeoutStore: {},




            /**
             *
             *
             * CALLBACKS
             *
             *
             */
            initFX1: null,
            initFX2: null,
            startRowFX1: null,
            startRowFX2: null,
            endRowFX1: null,
            endRowFX2: null,
            moreDetailsFX: null,

            /**
             *
             *
             * PHRASES
             *
             *
             */


            /**
             *
             * @type {string}
             */
            greaterThanLabel: '&gt; ',

            /**
             *
             * @type {string}
             */
            lowerThanLabel: '&lt; ',

            /**
             *
             * @type {string}
             */
            keywordsCategoryTitle: 'Keywords',

            /**
             *
             * @type {string}
             */
            favouritesCategoryTitle: 'Favourites',

            /**
             *
             *
             * PAGINATION SELECTORS
             *
             *
             */

            /**
             * class for an element that shows the number of matches
             * @type {string}
             */
            matchRowCountSelector: ".match-row-number",

            /**
             * class for an element that shows the start row
             * @type {string}
             */
            minRowSelector: ".min-row-number",

            /**
             * class for an element that shows the end row
             * @type {string}
             */
            maxRowSelector: ".max-row-number",

            /**
             * class for an element that shows total number of rows available
             * @type {string}
             */
            totalRowCountSelector: ".total-row-number",

            /**
             * class for an element that shows the number of rows visible
             * this should be an input field
             * @type {string}
             */
            visibleRowCountSelector: ".total-showing-row-number input",

            /**
             * class for an element that holds the pagination
             * @type {string}
             */
            paginationSelector: ".pagination",

            /**
             * holder for filtered
             * @type {string}
             */
            filteredCountHolder: ".tfs-match-count-holder",

            /**
             * class for an element that holds the pagination
             * @type {string}
             */
            unfilteredCountHolder: ".tfs-no-match-count-holder",

            /**
             *
             *
             * CURRENT STATE CLASSES
             *
             *
             */

            /**
             * loading class when things are being calculated
             * @type {string}
             */
            loadingClass: 'loading',

            /**
             * loading class when things are being calculated
             * @type {string}
             */
            fixedHeaderClass: 'fixed-header',

            /**
             * class to show that filter form CAN be used
             * i.e. the table is not in the viewport (scrolled too far or too little)
             * this class is also applied if the filter is open
             * @type {string}
             */
            filterInUseClass: 'tfs-filter-in-use',

            /**
             * class to show that filter form CAN NOT be used
             * i.e. the table is not in the viewport (scrolled too far or too little)
             *
             * @type {string}
             */
            filterNotInUseClass: 'tfs-filter-not-in-use',

            /**
             * class to show that the form is open
             * @type {string}
             */
            filterIsOpenClass: 'filter-is-open',

            /**
             * class to show that filter form CAN NOT be used
             * i.e. the table is not in the viewport (scrolled too far or too little)
             *
             * @type {string}
             */
            hasFilterClass: 'tfs-has-filter',

            /**
             * class to show that filter form CAN NOT be used
             * i.e. the table is not in the viewport (scrolled too far or too little)
             *
             * @type {string}
             */
            doesNotHaveFilterClass: 'tfs-does-not-have-filter',

            /**
             *
             * @type {string}
             */
            hasFavouritesClass: 'tfs-has-favourites',

            /**
             * class to show that filter form CAN NOT be used
             * i.e. the table is not in the viewport (scrolled too far or too little)
             *
             * @type {string}
             */
            hasFavouritesInFilterClass: 'tfs-has-favourites-in-filter',


            /**
             *
             *
             * SPECIAL AREAS
             *
             *
             */

            /**
             * class for an element showing details of hidden rows
             * @type {string}
             */
            moreRowEntriesSelector: ".tfs-more-entries",

            /**
             * class for element that holds common content (that is the same in ALL rows)
             * @type {string}
             */
            commonContentHolderClass: 'tfs-common-content-holder',

            /**
             * class of element that shows the no match message
             * @type {string}
             */
            noMatchMessageClass: 'no-matches-message',

            /**
             * element that holds all the filter stuff
             * @type {string}
             */
            filterFormHolderSelector: '.tfs-filter-form-holder',

            /**
             * element that holds all the filter stuff
             * @type {string}
             */
            filterFormInnerSelector: '.tfs-filter-form-inner',


            /**
             *
             *
             * IN TABLE SELECTORS & CLASSES
             *
             *
             */

            /**
             * @type {string}
             */
            tableSelector: 'table.tfs-table',

            /**
             * @type {string}
             */
            rowSelector: 'tbody > tr.tfstr',

            /**
             * items that can be filtered / sorted for ...
             * @type {string}
             */
            filterItemAttribute: 'data-filter',

            /**
             * where we (temporarily) save the value of an input attribute
             * @type {string}
             */
            inputValueDataAttribute: 'data-tfsvalue',

            /**
             * @type {string}
             */
            showMoreDetailsSelector: '.more',

            /**
             * @type {string}
             */
            moreDetailsSelector: '.hidden',

            /**
             * selector used to identify add to favourite Links
             * @type {string}
             */
            favouriteLinkSelector: 'a.adf',


            /**
             * class for rows that should show
             * @type {string}
             */
            showClass: 'show',

            /**
             * class for rows that should NOT show
             * @type {string}
             */
            hideClass: 'hide',

            /**
             * class for matching rows
             * @type {string}
             */
            matchClass: 'match',

            /**
             * class for non-matching rows
             * @type {string}
             */
            notMatchClass: 'no-match',

            /**
             * class for items that are opened (more, filter form, etc..)
             * @type {string}
             */
            openedClass: 'opened',

            /**
             *
             * @type {string}
             */
            directLinkClass: 'dl',

            /**
             *
             * @type {string}
             */
            selectedFilterItem: 'dl-on',

            /**
             * class to show which TRs are favourites...
             * @type {string}
             */
            favouriteClass: 'fav',

            /**
             *
             *
             * FILTER ACTION CLASSES
             *
             *
             */

             /**
             * class for element(s) that holds the current filter info
             * @type {string}
             */
             currentSearchFilterClass: 'tfs-current-search-holder',

            /**
             * class that is used for links that open and close the filter form
             * @type {string}
             */
            openAndCloseFilterFormClass: 'tfs-open-filter-form',

            /**
             * class for an element that links for sever interaction
             * @type {string}
             */
            saveAndLoadClass: "tfs-save-and-load",

            /**
             * element that holds the current filter info
             * @type {string}
             */
            clearFilterClass: 'tfs-clear',

            /**
             * selector used to identify add to favourite Links
             * @type {string}
             */
            showFavouritesSelector: '.filter-for-favourites a',

            /**
             *
             *
             * FILTER FORM CLASSES
             *
             *
             */

            /**
             * appendix after class for filter group
             * e.g. Boolean_Filter
             * where Filter is the appendix
             * @type {string}
             */
            sectionFilterClassAppendix: 'Filter',

            /**
             * class of element that holds the filter options ...
             * @type {string}
             */
            filterOptionsHolderClass: 'tfs-filter-form-options',

            /**
             * class for element that holds one filter group (e.g. Weight)
             * @type {string}
             */
            filterGroupClass: 'tfs-filter-column',

            /**
             * label for filter group
             * @type {string}
             */
            groupLabelClass: 'tfs-group-label',

            /**
             * selector for a quick keyword search input
             * @type {string}
             */
            quickKeywordFilterSelector: 'input[name="QuickKeyword"]',

            /**
             * the class that is applied to the inverse selection icon in each inner filter
             * @type {string}
             */
            inverseSelectionFilterClass: 'inverse-selection',

            /**
             *
             *
             * TABLE HEADER SELECTORS AND CLASSES
             *
             *
             */

             /**
             * @type {string}
             */
             sortLinkSelector: 'a.sortable',

            /**
             * class to show that something is currently sorted in ascending order.
             * @type {string}
             */
            sortAscClass: 'sort-asc',

            /**
             * class to show that something is currently sorted in descending order.
             * @type {string}
             */
            sortDescClass: 'sort-desc',

            /**
             * startup
             *
             */
            init: function(holderNumber)
            {
                //get the holders
                myob.holderNumber = holderNumber;
                myob.myTableHolder = myTableHolder;

                myob.setHTMLandJson();

                //get the rows
                myob.setRowsWithDetails(true);
                if(myob.myRowsTotalCount > 0){
                    myob.buildFloatingHeaderTable();

                    myob.millisecondsBetweenActionsShort = myob.millisecondsBetweenActionsShort * (Math.floor(myob.myRowsTotalCount / 5000) + 1);
                    myob.millisecondsBetweenActionsLong = myob.millisecondsBetweenActionsLong * (Math.floor(myob.myRowsTotalCount / 5000) + 1);
                    if(typeof myob.initFX1 === 'function') {
                        myob.initFX1();
                    }
                    myob.myTableHolder.find(myob.matchRowCountSelector).html('...');

                    myob.myTableHolder.addClass(myob.loadingClass);
                    window.setTimeout(
                        function() {
                            // COLLECT AND FIX
                            // what needs to be done

                            myob.whatIsIncluded();
                            //collect filter items
                            myob.filterItemCollector();
                            //look for cols that are the same
                            myob.hideIdenticalCols();
                            window.setTimeout(
                                function() {
                                    //now we can hide table ...

                                    //MASSAGE DATA AND FIND SORT
                                    //finalise data dictionary
                                    myob.dataDictionaryCollector();
                                    //find defaultSort
                                    myob.findDefaultSort();

                                    //LISTENERS ...
                                    myob.fixTableHeaderListener();
                                    myob.setupFilterFormListeners();
                                    myob.setupSortListeners();
                                    myob.paginationListeners();
                                    myob.setupMoreDetailsListener();
                                    myob.openServerModalWindowListener();
                                    myob.favouriteLinkListener();
                                    myob.directFilterLinkListener();
                                    myob.formElementsListener();
                                    myob.addURLChangeListener();

                                    //LOAD DATA FROM SERVER
                                    //check for data in local cookie
                                    myob.retrieveLocalCookie();
                                    //check for data in local cookie
                                    myob.retrieveDataFromFragment();
                                    //check for data on server
                                    myob.retrieveDataFromGetVar();
                                    //we need to process this here one more time ... in case of the cookie data
                                    myob.processRetrievedData();

                                    //we are now ready!
                                    myob.myTableHolder.removeClass(myob.loadingClass);

                                    //set table width
                                    myob.setTableWidth();

                                    if(typeof myob.initFX2 === 'function') {
                                        myob.initFX2();
                                    }
                                    myob.canPushState = true;
                                },
                                myob.millisecondsBetweenActionsShort
                            );

                            //ADD SCROLL AND OTHER STUFF ...

                        },
                        myob.millisecondsBetweenActionsShort
                    );
                } else {
                    myob.myTableHolder.removeClass(myob.loadingClass);
                }
            },

            setHTMLandJson: function()
            {
                if(myob.rowRawData !== null) {
                    myob.useJSON = true;
                }
                myob.myFilterFormHolder = myob.myTableHolder.find(myob.filterFormHolderSelector).first();
                myob.myFilterFormInner = myob.myFilterFormHolder.find(myob.filterFormInnerSelector).first();
                myob.myTable = myob.myTableHolder.find(myob.tableSelector).first();
                myob.myTableHead = myob.myTable.find(" > thead");
                myob.myTableBody = myob.myTable.find(" > tbody");
                if(myob.useJSON) {
                    if(myob.templateRow.length === 0) {
                        if(myob.myTable.find(myob.rowSelector).length === 1) {
                            myob.templateRow = myob.myTableBody.clone().html();
                            myob.myTableBody.empty();
                        }
                    }
                }
                myob.myTable.css('table-layout', 'fixed');
                //base URL
                myob.baseURL = location.protocol + '//' + location.host + location.pathname + location.search;
            },

            buildFloatingHeaderTable: function()
            {
                myob.profileStarter('buildFloatingHeaderTable')
                myob.myFloatingTable = myob.myTable.clone();
                myob.myFloatingTable.appendTo(myob.myTableHolder)
                myob.myFloatingTable.addClass("floating-table")
                myob.profileEnder('buildFloatingHeaderTable');
            },

            setRows: function()
            {
                myob.profileStarter('setRows');
                if(myob.useJSON) {
                    if(myob.myRows === null) {
                        myob.myRows = jQuery(myob.templateRow);
                    }
                } else {
                    myob.myRows = myob.myTable.find(myob.rowSelector);
                }
                myob.profileStarter('setRows');
            },


            /**
             * called after row manipulation to reset rows
             */
            setRowsWithDetails: function(hideAll, findMyRowsSorted)
            {
                myob.profileStarter('setRowsWithDetails');
                myob.setRows();
                if(typeof findMyRowsSorted === 'undefined') {
                    findMyRowsSorted = false;
                }
                if(myob.myRowsSorted.length === 0) {
                    findMyRowsSorted = true;
                }
                if(findMyRowsSorted) {
                    myob.myRowsSorted.length = 0;
                    myob.myRowsSorted = [];
                }
                if(myob.useJSON) {
                    if(hideAll) {
                        myob.myTableBody.empty();
                    }
                    if(findMyRowsSorted) {
                        for(rowID in myob.rowRawData) {
                            if(myob.rowRawData.hasOwnProperty(rowID)) {
                                myob.myRowsSorted.push(rowID);
                            }
                        }
                        myob.myRowsTotalCount = myob.myRowsSorted.length;
                    }
                    //do nothing
                } else {
                    if(findMyRowsSorted || hideAll) {
                        var rowID = '';
                        var reload = false;
                        if(hideAll) {
                            reload = true;
                        }
                        myob.myRows.each(
                            function(i, el) {
                                rowID = jQuery(el).attr('id');
                                if(typeof rowID === 'string' && rowID.length > 0) {
                                    //do nothing
                                } else {
                                    rowID = 'tfs-row-'+i;
                                    jQuery(el).attr('id', rowID);
                                    reload = true;
                                }
                                if(findMyRowsSorted) {
                                    myob.myRowsSorted.push(rowID);
                                }
                                if(hideAll === true) {
                                    jQuery(el).addClass(myob.hideClass).removeClass(myob.showClass);
                                }
                            }
                        );
                        if(reload === true) {
                            myob.setRows();
                        }
                        myob.myRowsTotalCount = myob.myRowsSorted.length;
                    }
                }
                myob.profileEnder('setRowsWithDetails');
            },




            //===================================================================
            // SCRIPT SECTION: *** COLLECTORS
            //=================================================================

            whatIsIncluded: function()
            {
                //are we saving favourites?
                myob.favouritesParentPageID = myob.myTableHolder.attr("data-favourites-parent-page-id");
                if(typeof myob.favouritesParentPageID === 'string' && myob.favouritesParentPageID.length > 0) {
                    myob.hasFavouritesSaving = true;
                } else {
                    myob.hasFavouritesSaving = false;
                    jQuery('.'+myob.saveAndLoadClass).each(
                        function(i, el){
                            var el = jQuery(el);
                            if(el.hasClass('favourites')) {
                                el.remove();
                            }
                        }
                    );
                }

                //are we saving filter?
                myob.filtersParentPageID = myob.myTableHolder.attr("data-filters-parent-page-id");
                if(typeof myob.filtersParentPageID === 'string' && myob.filtersParentPageID.length > 0) {
                    myob.hasFilterSaving = true;
                } else {
                    myob.hasFilterSaving = false;
                    jQuery('.'+myob.saveAndLoadClass).each(
                        function(i, el){
                            var el = jQuery(el);
                            if(el.hasClass('filters')) {
                                el.remove();
                            }
                        }
                    );
                }
            },

            /**
             * find the filters ...
             */
            filterItemCollector: function()
            {
                myob.profileStarter('filterItemCollector');
                //for each table with specific class ...
                var value = '';
                var category = '';
                var rowID = '';
                if(myob.useJSON) {
                    for(rowID in myob.rowRawData) {
                        if(myob.rowRawData.hasOwnProperty(rowID)) {
                            var rowData = myob.rowRawData[rowID];
                            for(category in rowData) {
                                if(rowData.hasOwnProperty(category)) {
                                    myob.dataDictionaryBuildCategory(category);
                                    var values = rowData[category];
                                    if(typeof values === 'undefined') {
                                        values = [myob.placeholderValue];
                                    } else {
                                        if(values === null) {
                                            values = [myob.placeholderValue];
                                        } else {
                                            if(typeof values === 'string' || typeof values === 'number') {
                                                values = [values];
                                            }
                                            if(values.length === 0) {
                                                values = [myob.placeholderValue];
                                            }
                                        }
                                    }
                                    for(var i = 0; i < values.length; i++) {
                                        var value = values[i];
                                        myob.addOptionToCategory(category, value);
                                        myob.addValueToRow(category, rowID, value);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    myob.myRows.each(
                        function(i, row) {
                            var row = jQuery(row);
                            rowID = jQuery(row).attr('id');
                            if(i === 0) {
                                myob.hasFavourites = row.find(myob.favouriteLinkSelector).length > 0 ? true : false;
                            }
                            row.find('[' + myob.filterItemAttribute + ']').each(
                                function(j, el) {
                                    el = jQuery(el);
                                    value = myob.findValueOfObject(el);
                                    category = el.attr(myob.filterItemAttribute);
                                    if(value.length > 0) {
                                        myob.addOptionToCategory(category, value);
                                        myob.addValueToRow(category, rowID, value);
                                        if(typeof myob.dataDictionary[category]['IsEditable'] === 'undefined' ){
                                             if(el.is(':input')) {
                                                 myob.dataDictionary[category]['IsEditable'] = true;
                                                 myob.hasFormElements = true;
                                             } else {
                                                 myob.dataDictionary[category]['IsEditable'] = false;
                                             }
                                        }
                                    }
                                }
                            );
                        }
                    );
                }
                myob.profileEnder('filterItemCollector');
            },

            dataDictionaryBuildCategory: function(category)
            {
                if(typeof myob.dataDictionary[category] === "undefined") {
                    myob.dataDictionary[category] = {}
                }
                if(typeof myob.dataDictionary[category]['CanFilter'] === "undefined") {
                    myob.dataDictionary[category]['CanFilter'] = null;
                }
                if(typeof myob.dataDictionary[category]['CanSort'] === "undefined") {
                    myob.dataDictionary[category]['CanSort'] = null;
                }
                if(typeof myob.dataDictionary[category]['DataType'] === "undefined") {
                    myob.dataDictionary[category]['DataType'] = '';
                }
                if(typeof myob.dataDictionary[category]['Options'] === "undefined") {
                    myob.dataDictionary[category]['Options'] = [];
                }
                if(typeof myob.dataDictionary[category]['Values'] === "undefined") {
                    myob.dataDictionary[category]['Values'] = {};
                }
                if(typeof myob.dataDictionary[category]['IsEditable'] === "undefined") {
                    myob.dataDictionary[category]['IsEditable'] = null;
                }
            },

            /**
             * updates the dataDictionary for all rows
             * that are currently marked as matching!
             * @param  {string} category [description]
             * @param  {mixed} newValue [description]
             */
            updateMatchingRowsInDataDictionary: function(category, newValue)
            {
                for(var i = 0; i < myob.myRowsMatching.length; i++) {
                    var rowID = myob.myRowsMatching[i];
                    var oldValue = myob.dataDictionary[category]['Values'][rowID];
                    myob.replaceOptionInCategory(category, oldValue, newValue);
                    myob.replaceRowValue(category, rowID, newValue);
                }
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param mixed oldValue
             * @param mixed newValue
             */
            replaceOptionInCategory: function(category, oldValue, newValue)
            {
                myob.dataDictionaryBuildCategory(category);
                //first add, as this checks for existence of category
                myob.addOptionToCategory(category, newValue);
                myob.removeOptionFromCategory(category, oldValue);
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param mixed value
             */
            addOptionToCategory: function(category, value)
            {
                myob.dataDictionaryBuildCategory(category);
                if(typeof value !== 'undefined') {
                    if(myob.dataDictionary[category]['Options'].indexOf(value) === -1) {
                        //push value
                        myob.dataDictionary[category]['Options'].push(value);
                    }
                }
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param mixed value
             */
            removeOptionFromCategory: function(category, value)
            {
                myob.dataDictionaryBuildCategory(category);
                var index = myob.dataDictionary[category]['Options'].indexOf(value);
                if(index === -1) {
                    //push value
                    return;
                }
                myob.dataDictionary[category]['Options'].splice(index, 1);
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param string rowID
             * @param mixed value
             */
            replaceRowValue: function(category, rowID, value)
            {
                //make sure its all there
                myob.dataDictionaryBuildCategory(category);

                //reset values
                if(Array.isArray(myob.dataDictionary[category]['Values'][rowID])) {
                    myob.dataDictionary[category]['Values'][rowID].length = 0;
                }
                myob.dataDictionary[category]['Values'][rowID] = [];

                //add value back in
                if(typeof value !== 'undefined') {
                    myob.addValueToRow(category, rowID, value);
                }
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param string rowID
             * @param mixed value
             */
            addValueToRow: function(category, rowID, value)
            {
                myob.dataDictionaryBuildCategory(category);
                if(typeof value !== 'undefined') {
                    myob.dataDictionaryBuildCategory(category);
                    if(typeof myob.dataDictionary[category]['Values'][rowID] === "undefined") {
                        myob.dataDictionary[category]['Values'][rowID] = [];
                    }
                    myob.dataDictionary[category]['Values'][rowID].push(value);
                }
            },

            /**
             * remove value from a row
             * @param string category
             * @param mixed value
             */
            removeValueFromRow: function(category, rowID, value)
            {
                myob.dataDictionaryBuildCategory(category);
                var index = myob.dataDictionary[category]['Values'][rowID].indexOf(rowID);
                if(index === -1) {
                    //push value
                    return;
                }
                myob.dataDictionary[category]['Values'][rowID].splice(index, 1);
            },

            /**
             * hide the cells that are all the same
             * and add to common content holder
             */
            hideIdenticalCols: function()
            {
                myob.profileStarter('hideIdenticalCols');
                if(myob.myRowsTotalCount > myob.maximumRowsForHideIdentical) {
                    return;
                }
                var commonContentExists = false;
                var commonContent = '';
                Object.keys(myob.dataDictionary).forEach(
                    function(category, categoryIndex) {
                        if(myob.dataDictionary[category]['Options'].length === 1) {
                            if (myob.dataDictionary[category]['IsEditable'] !== true) {
                                commonContentExists = true;
                                var commonContentAdded = false;
                                if(myob.useJSON) {
                                    myob.myTableBody.empty();
                                    myob.myTableBody.append(myob.templateRow);
                                    var htmlObjects = myob.myTableBody.find('['+myob.filterItemAttribute+'="' + category + '"]');
                                } else {
                                    var htmlObjects = myob.myRows.find('['+myob.filterItemAttribute+'="' + category + '"]');
                                }
                                //remove text from span
                                htmlObjects.each(
                                    function(i, el) {
                                        el = jQuery(el);
                                        if(commonContentAdded === false) {
                                            var value = el.html();
                                            if(myob.useJSON) {
                                                var searchValue = value;
                                                var replaceValue = myob.dataDictionary[category]['Options'][0];
                                                value = value.split(searchValue).join(replaceValue)
                                            }
                                            if(value === "" || el.hasClass('ignore-content')){
                                                // do nothing
                                            } else {
                                                commonContent += "<li><strong>"+category + ":</strong> <span>" + value + "</span></li>";
                                                commonContentAdded = true;
                                            }
                                        }
                                        // is select, input, textarea
                                        if(el.is(':input')) {
                                            // do nothing
                                        } else {
                                            var spanParent = el.parent();
                                            el.remove();

                                            if(spanParent.is("li")){
                                                spanParent.hide();
                                            }
                                            //if td is empty then remove td and correspoding th
                                            else if(spanParent.is("td")){
                                                if(spanParent.children().length === 0) {
                                                    //get column number of td
                                                    //get related table header
                                                    if(i === 0) {
                                                        var colNumber = spanParent.parent("tr").children("td").index(spanParent);
                                                        myob.myTable.find('thead tr td').eq(colNumber).remove();
                                                        myob.myTable.find('thead tr th').eq(colNumber).remove();
                                                    }
                                                    spanParent.remove();
                                                    if(myob.useJSON) {
                                                        myob.templateRow = myob.myTableBody.html();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                );
                            }
                        }
                    }
                );
                if(commonContentExists){
                    var title = myob.myTableHolder.find('.'+ myob.commonContentHolderClass).attr("data-title");
                    if(typeof title !== "undefined") {
                        title = "<h3>"+title+"</h3>";
                    }
                    else {
                        title = "";
                    }
                    var commonContentStart = '<div class="'+myob.commonContentHolderClass+'-inner">' + title + "<ul>";
                    commonContent = commonContentStart + commonContent;
                    commonContent += "</ul></div>";
                    myob.myTableHolder.find('.' + myob.commonContentHolderClass).html(commonContent);
                } else {
                    myob.myTableHolder.find('.' + myob.commonContentHolderClass).remove();
                }
                myob.profileEnder('hideIdenticalCols');
            },

            /**
             * ensures that all the dataDictionary data is available
             * and validates it.  It does this mainly through looking at the
             * sort options provided
             */
            dataDictionaryCollector: function()
            {
                myob.profileStarter('dataDictionaryCollector');
                Object.keys(myob.dataDictionary).forEach(
                    function(category, categoryIndex) {

                        //make sure there are options
                        myob.dataDictionaryBuildCategory(category);
                        var sortLink = myob.myTable.find(myob.sortLinkSelector+'[data-sort-field="'+category+'"]').first();
                        //can it be filtered?
                        if(typeof myob.dataDictionary[category]['CanFilter'] === "undefined" || myob.dataDictionary[category]['CanFilter'] === null) {
                            if(myob.excludeFromFilter.length > 0 && myob.excludeFromFilter.indexOf(category) > -1) {
                                myob.dataDictionary[category]['CanFilter'] = false;
                            } else {
                                if(sortLink && sortLink.attr('data-sort-only') == 'true') {
                                    myob.dataDictionary[category]['CanFilter'] = false;
                                } else {
                                    myob.dataDictionary[category]['CanFilter'] = myob.dataDictionary[category]['Options'].length > 1 || myob.dataDictionary[category]['IsEditable'];
                                }
                            }
                        }

                        //can it be sorted?
                        if(typeof myob.dataDictionary[category]['CanSort'] === "undefined" || myob.dataDictionary[category]['CanSort'] === null) {
                            myob.dataDictionary[category]['CanSort'] = (sortLink.length > 0);
                        }

                        //what is the data type?
                        if(typeof myob.dataDictionary[category]['DataType'] === 'undefined' || myob.dataDictionary[category]['DataType'] === '') {
                            if(myob.dataDictionary[category]['CanSort']) {
                                var sortType = sortLink.attr("data-sort-type");
                                myob.dataDictionary[category]['DataType'] = sortType;
                            }
                        }
                        if(typeof myob.dataDictionary[category]['DataType'] === "undefined" || myob.dataDictionary[category]['DataType'] === '') {
                            var type = 'number';
                            var test = false
                            var i = 0;
                            var max = myob.dataDictionary[category]['Options'].length < myob.maxNumberOfValuesToCheck ? myob.dataDictionary[category]['Options'].length : myob.maxNumberOfValuesToCheck;
                            for(i = 0; i < max; i++) {
                                test = jQuery.isNumeric(myob.dataDictionary[category]['Options'][i]);
                                if(test === false) {
                                    type = 'string';
                                    break;
                                }
                            }
                            myob.dataDictionary[category]['DataType'] = type;
                        }
                        //check data type
                        if(jQuery.inArray( myob.dataDictionary[category]['DataType'], myob.validDataTypes ) === false) {
                            console.debug('ERROR: invalid DataType for'+category+': '+myob.dataDictionary[category]['DataType'])
                        }
                        myob.dataDictionarySorter(category);
                    }
                );
                myob.profileEnder('dataDictionaryCollector');
            },

            /**
             * sort lists
             * @param  string category
             * @param  string fieldName
             */
            dataDictionarySorter: function(category)
            {
                if(Array.isArray(myob.dataDictionary[category]['Options'])) {
                    //sort options
                    switch(myob.dataDictionary[category]['DataType']) {
                        case 'number':
                            myob.dataDictionary[category]['Options'].sort(
                                function(a,b){
                                    if(typeof a !== 'number') {
                                        a = parseFloat(a.replace(/[^0-9.]/g,''));
                                    }
                                    if(typeof b !== 'number' ) {
                                        b = parseFloat(b.replace(/[^0-9.]/g,''));
                                    }
                                    return a - b
                                }
                            );
                            break;
                        case 'string':
                        default:
                            myob.dataDictionary[category]['Options'].sort();
                    }
                }
            },

            findDefaultSort: function()
            {
                var currentSortLinkSelector = '.'+myob.sortDescClass+', .'+myob.sortAscClass
                var currentSortObject = myob.myTableHead.find(currentSortLinkSelector).first();
                if(currentSortObject && currentSortObject.length > 0) {
                    //an ascending or descending has been set ...
                } else {
                    currentSortObject = myob.myTableHead.find(myob.sortLinkSelector+"[data-sort-default=true]").first();
                    if(currentSortObject && currentSortObject.length > 0) {
                        //a default one has been set
                    } else {
                        //get first one
                        currentSortObject = myob.myTableHead.find(myob.sortLinkSelector).first();
                    }
                }
                if(currentSortObject && currentSortObject.length > 0) {
                    myob.csr.sdi = currentSortObject.attr('data-sort-direction');
                    myob.csr.sct = currentSortObject.attr('data-sort-field');
                }
            },




            //===================================================================
            // SCRIPT SECTION: *** LISTENERS
            //===================================================================

            fixTableHeaderListener: function()
            {
                myob.profileStarter('fixTableHeaderListener');
                if(myob.fixedHeaderClass) {
                    jQuery(window).delayedOn(
                        "load scroll resize",
                        function(e) {
                            myob.setTableWidthAndFixHeader();
                        },
                        myob.millisecondsBetweenActionsShort
                    );
                }
                myob.profileEnder('fixTableHeaderListener');
            },


            /**
             * set up filter listeners ...
             */
            setupFilterFormListeners: function()
            {
                myob.profileStarter('setupFilterFormListeners');
                //set default
                myob.myFilterFormInner.hide();
                //open and close form
                myob.myFilterFormHolder.on(
                    'click',
                    '.' + myob.openAndCloseFilterFormClass,
                    function(event) {
                        event.preventDefault();
                        myob.myFilterFormInner.slideToggle(
                            "fast",
                            function() {
                                //set the height of the filter form
                                if(myob.hasFixedTableHeader) {
                                    myob.myTableHead.css('top', myob.myFilterFormHolder.outerHeight() + 'px');
                                }
                                myob.myTableHolder.toggleClass(myob.filterIsOpenClass);
                                if(myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                                    myob.scrollToTopOfHolder();
                                    //filter is now open
                                } else {
                                    //filter is now closed
                                }
                            }
                        );
                        return false;
                    }
                );

                //clear filter
                myob.myFilterFormHolder.on(
                    'click',
                    '.' + myob.clearFilterClass + ' a',
                    function(event) {
                        event.preventDefault();
                        myob.resetAll();
                        return false;
                    }
                );

                //change input
                myob.myFilterFormInner.on(
                    'change',
                    'input',
                    function(event) {
                        myob.windowTimeoutStoreSetter(
                            'runCurrentFilter',
                            function() {
                                myob.runCurrentFilter();
                            },
                            myob.millisecondsBetweenActionsLong
                        );
                    }
                );

                //set actual keyword field and trigger change
                myob.myFilterFormHolder.on(
                    'input paste change',
                    myob.quickKeywordFilterSelector,
                    function(e) {
                        var val = jQuery(this).val();
                        myob.myFilterFormInner.find('input[name="Keywords"]')
                            .val(val)
                            .change();
                    }
                );

                //update faux keyword field
                myob.myFilterFormInner.on(
                    'input paste change',
                    'input[name="Keywords"]',
                    function(e) {
                        var val = jQuery(this).val();
                        myob.myFilterFormHolder
                            .find(myob.quickKeywordFilterSelector)
                            .val(val);
                    }
                );

                myob.myFilterFormInner.on(
                    'click',
                    '.' +  myob.inverseSelectionFilterClass,
                    function (e) {
                        jQuery(this).parent().find('input[type="checkbox"]').each(
                            function(i, el) {
                                el = jQuery(el);
                                if (el[0].checked === true) {
                                    el.prop('checked', false);
                                } else {
                                    el.prop('checked', true);
                                }
                                el.change();
                            }
                        );
                        //release DOM
                        //
                    }
                );
                myob.profileEnder('setupFilterFormListeners');
            },


            /**
             * set up sorting mechanism
             */
            setupSortListeners: function()
            {
                myob.myTableHolder.on(
                    "click",
                    myob.sortLinkSelector,
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        myob.csr.sdi = myEl.attr("data-sort-direction");
                        myob.csr.sct = myEl.attr("data-sort-field");
                        myob.runCurrentSort();
                    }
                );
            },


            paginationListeners: function()
            {
                myob.myTableHolder.on(
                    'click',
                    myob.paginationSelector + ' a',
                    function(event) {
                        event.preventDefault();
                        var pageNumber = jQuery(this).attr('data-page');
                        myob.gotoPage(pageNumber);
                        return false;
                    }
                );
                myob.myTableHolder.on(
                    'input paste change',
                    myob.visibleRowCountSelector,
                    function () {
                        myob.windowTimeoutStoreSetter(
                            'visibleRowCount',
                            function() {
                                var input = myob.myTableHolder.find(myob.visibleRowCountSelector);
                                var val = input.val();
                                val = myob.visibleRowCountValidator(val)
                                if(val !== false) {
                                    if(myob.visibleRowCount !== val) {
                                        myob.visibleRowCount = val;
                                        if(typeof Cookies !== 'undefined') {
                                            Cookies.set('visibleRowCount', myob.visibleRowCount, {path: myob.baseURL, expires: 180});
                                        }
                                        myob.gotoPage(0, true);
                                    }
                                }
                            },
                            myob.millisecondsBetweenActionsLong
                        );
                    }
                );
            },

            /**
             * set up toggle slides with the table
             */
            setupMoreDetailsListener: function()
            {
                //add toggle
                myob.myTableHolder.on(
                    'click',
                    myob.showMoreDetailsSelector,
                    function(event) {
                        event.preventDefault();
                        //my el
                        var myEl = jQuery(this);
                        myEl.toggleClass(myob.openedClass);
                        //row
                        var row = myEl.closest('tr');
                        row
                            .toggleClass(myob.openedClass)
                            .find(myob.moreDetailsSelector)
                            .each(
                                function(i, moreDetailsItem) {
                                    moreDetailsItem = jQuery(moreDetailsItem);
                                    moreDetailsItem.slideToggle();
                                    moreDetailsItem.toggleClass(myob.openedClass);
                                }
                            );
                        if(typeof myob.moreDetailsFX === 'function') {
                            myob.moreDetailsFX(myob);
                        }
                    }
                );
            },

            /**
             * if the user goes back then
             * apply the selection provided ...
             */
            addURLChangeListener: function()
            {
                window.addEventListener(
                    "popstate",
                    function(e) {
                        myob.canPushState = false;
                        myob.retrieveDataFromFragment();
                        myob.retrieveDataFromGetVar();
                        myob.processRetrievedData();
                        myob.canPushState = true;
                    }
                );
            },

            /**
             * basically runs the filter as per usual
             * after stuff has been selected.
             */
            directFilterLinkListener: function()
            {
                myob.myTableBody.on(
                    'click',
                    '[' + myob.filterItemAttribute + '].' + myob.directLinkClass,
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var category = myEl.attr(myob.filterItemAttribute);
                        var filterValue = myob.findValueOfObject(myEl).toLowerCase();
                        var filterHolder = myob.myFilterFormInner
                            .find('.'+myob.filterGroupClass+'[data-to-filter="'+category+'"]');
                        var fieldType = filterHolder.attr('field-type');
                        var filterToTriger = filterHolder
                            .find('input[value="'+ filterValue + '"].checkbox')
                            .first();
                        if(filterToTriger && filterToTriger.length > 0) {
                            if(filterToTriger.is(':checkbox')){
                                if(filterToTriger.prop('checked') === true){
                                    filterToTriger.prop('checked', false).trigger('change');
                                }
                                else {
                                    filterToTriger.prop('checked', true).trigger('change');
                                }
                            }
                        } else if(fieldType === 'tag')  {
                            myob.makeCheckboxSection(
                                filterHolder.find('input.awesomplete').first(),
                                filterValue
                            );
                        }

                        myob.runCurrentFilter();

                        return false;
                    }
                );
            },


            formElementsListener: function()
            {
                myob.profileStarter('formElementsListener');
                if(myob.hasFormElements) {
                    myob.myTableBody.on(
                        'change',
                        'input[' + myob.filterItemAttribute + '], select[' + myob.filterItemAttribute + '], textarea[' + myob.filterItemAttribute + ']',
                        function(event){
                            // update tfs-data
                            var el = jQuery(this);
                            var category = el.attr(myob.filterItemAttribute);
                            // update data dictionary
                            if(typeof category !== 'undefined') {
                                if(typeof myob.dataDictionary[category] === 'object') {
                                    var oldValue = el.attr(myob.inputValueDataAttribute);
                                    var newValue = myob.findCurrentValueOfInputObject(el);

                                    // 1. add to Rows ...
                                    var rowID = el.closest('tr').attr('id');
                                    // 2. remove and add to Options
                                    myob.replaceOptionInCategory(category, oldValue, newValue);
                                    myob.replaceRowValue(category,rowID, newValue);
                                }
                            }
                            el.removeAttr(myob.inputValueDataAttribute);
                            myob.findValueOfObject(el);
                        }
                    );
                }
                myob.profileEnder('formElementsListener');
            },

            favouriteLinkListener: function(){
                if(myob.hasFavourites) {
                    //favouite links in table
                    myob.myTableBody.on(
                        'click',
                        myob.favouriteLinkSelector,
                        function(event){
                            event.preventDefault();
                            var cellHolder = jQuery(this).closest('td, th')
                            var rowHolder = cellHolder.closest('tr');
                            rowHolder.toggleClass(myob.favouriteClass);
                            var id = rowHolder.attr('id');
                            if(id && typeof id !== 'undefined' && id !== '') {
                                if(rowHolder.hasClass(myob.favouriteClass)) {
                                    myob.mfv.push(id);
                                } else {
                                    var index = myob.mfv.indexOf(id);
                                    if (index > -1) {
                                        myob.mfv.splice(index, 1);
                                    }
                                }
                                if(typeof Cookies !== 'undefined') {
                                    Cookies.set('mfv', myob.mfv, {path: myob.baseURL, expires: 180});
                                }
                            }
                            if(myob.mfv.length > 0) {
                                myob.myTableHolder.addClass(myob.hasFavouritesClass);
                            } else {
                                myob.myTableHolder.removeClass(myob.hasFavouritesClass);
                            }
                            return false;
                        }
                    );

                    //show / hide favourites
                    myob.myTableHolder.on(
                        'click',
                        myob.showFavouritesSelector,
                        function(event){
                            event.preventDefault();
                            var filterToTriger = myob.myFilterFormInner.find('input[name="Favourites"]').first();
                            if(filterToTriger.prop('checked') === true){
                                filterToTriger.prop('checked', false).trigger('change');
                            }
                            else {
                                myob.myFilterFormHolder.find('.' + myob.clearFilterClass + ' a').click();
                                var filterToTriger = myob.myFilterFormInner.find('input[name="Favourites"]').first();
                                filterToTriger.prop('checked', true).trigger('change');
                            }
                        }
                    );
                }
            },

            /**
             * opens modal with data ...
             * data options are
             * - favourites
             * - filter
             * data is sent as the data get parameter, separated by &
             * @return {[type]} [description]
             */
            openServerModalWindowListener: function()
            {
                if(myob.hasFilterSaving || myob.hasFavouritesSaving) {
                    myob.myTableHolder.on(
                        'click',
                        '.' + myob.saveAndLoadClass + ' a',
                        function(event){
                            event.preventDefault();
                            var myEl = jQuery(this);
                            var myParent = myEl.closest('.' + myob.saveAndLoadClass);
                            //get connection type details
                            var url = myob.serverConnectionURL;
                            var isFilter = false;
                            var isSave = false;
                            var parentPageID = myob.filtersParentPageID;
                            var variables = myob.filterAndSortVariables;
                            if(myParent.hasClass('filters')) {
                                isFilter = true;
                            }
                            else if(myParent.hasClass('favourites')) {
                                parentPageID = myob.favouritesParentPageID;
                                variables = myob.favouritesVariables;
                            }
                            if(myParent.hasClass('save')) {
                                isSave = true;
                                url += 'start/'
                            } else {
                                url += 'index/'
                            }
                            var data = {};
                            if(isSave === true) {
                                for(var i = 0; i  < variables.length; i++) {
                                    data[variables[i]] = myob[variables[i]];
                                }
                            }
                            data.ParentPageID = parentPageID;
                            jQuery.post(
                                url,
                                data,
                                function(returnedURL) {
                                    var width = Math.round(jQuery(window).width() * 0.95) - 40;
                                    var height = Math.round(jQuery(window).height() * 0.95) - 40;
                                    jQuery.modal(
                                        '<iframe src="'+returnedURL+'" width="'+width+'"height="'+height+'" style="border:0" id="tfs-pop-up-i-frame" name="tfs-pop-up-i-frame">',
                                        {
                                            closeHTML:"close",
                                            containerCss:{
                                                backgroundColor:"#fff",
                                                borderColor:"#fff",
                                                padding:0,
                                                width:width,
                                                height:height

                                            },
                                            opacity: 75,
                                            overlayClose:true,
                                            onClose: function() {
                                                jQuery.modal.close();
                                                myob.retrieveDataFromGetVar();
                                                myob.processRetrievedData();
                                            }
                                        }
                                    );
                                    return false;
                                }
                            ).fail(
                                function() {
                                    alert('ERROR!');
                                }
                            );
                            return false;
                        }
                    );
                }
            },


            //===================================================================
            // SCRIPT SECTION: *** CREATE FILTER FORM
            //===================================================================

            /**
             * create filter form
             *
             */
            createFilterForm: function()
            {
                //create html content and add to top of page
                myob.profileStarter('createFilterForm');
                if(myob.myFilterFormInner.length > 0) {
                    //clear it so that we can rebuild it ...
                    myob.myFilterFormInner.html("");
                    var cfiHTML = "";
                    var tabIndex = 1;
                    var awesompleteFields = [];
                    var content  = '<form class="'+myob.filterOptionsHolderClass+'">';
                    Object.keys(myob.dataDictionary).forEach(
                        function(category, categoryIndex) {
                            if(myob.dataDictionary[category]['CanFilter']) {
                                tabIndex++;
                                var cleanValue = '';
                                var cleanedValues = [];
                                var count = 0;
                                var optionCount = myob.dataDictionary[category]['Options'].length;
                                if((myob.dataDictionary[category]['DataType'] !== 'number' && optionCount <= myob.maximumNumberOfFilterOptions)
                                   || (myob.dataDictionary[category]['DataType'] === 'number' && optionCount <= myob.maximumNumberOfNumericFilterOptions)) {
                                    content += myob.makeSectionHeaderForForm(
                                        'checkbox',
                                        category
                                    );
                                    for(count = 0; count < optionCount; count++) {
                                        var valueIndex = myob.dataDictionary[category]['Options'][count];
                                        content += myob.makeFieldForForm('checkbox', category, tabIndex, valueIndex);
                                    }
                                    content += myob.makeSectionFooterForForm();
                                }
                                else {
                                    var type = myob.dataDictionary[category]['DataType'];
                                    if(myob.dataDictionary[category]['DataType'] === 'string') {
                                        awesompleteFields.push(category);
                                        type = 'tag';
                                    }
                                    content += myob.makeSectionHeaderForForm(type, category);
                                    content += myob.makeFieldForForm(type, category, tabIndex, 0);
                                    content += myob.makeSectionFooterForForm();
                                }
                            }
                        }
                    );
                    //add favourites
                    if(myob.hasFavourites) {
                        content += myob.makeSectionHeaderForForm(
                            'favourites',
                             myob.favouritesCategoryTitle
                        );
                        content += myob.makeFieldForForm('favourites', myob.favouritesCategoryTitle, tabIndex, 0);
                        content += myob.makeSectionFooterForForm();
                        tabIndex++;
                    }
                    if(myob.hasKeywords) {
                        content += myob.makeSectionHeaderForForm(
                            'keyword',
                             myob.keywordsCategoryTitle
                        );
                        content += myob.makeFieldForForm('keyword', myob.keywordsCategoryTitle, tabIndex, 0);
                        content += myob.makeSectionFooterForForm();
                    }
                    content += '</form>';

                    //FINALISE!
                    myob.myFilterFormInner.html(content);

                    if(myob.hasKeywords) {
                        var keywordVal = myob.myFilterFormInner.find('input[name="Keywords"]').val();
                        myob.myFilterFormHolder.find(myob.quickKeywordFilterSelector).val(keywordVal);
                    }
                    var i = 0;
                    var input;
                    for(i = 0; i < awesompleteFields.length; i++) {
                        var category = awesompleteFields[i];
                        var jQueryInput = myob.myFilterFormInner.find('input[name="'+category+'"].awesomplete').first();
                        var id = jQuery(jQueryInput).attr('id');
                        var input = document.getElementById(id);
                        new Awesomplete(
                            input,
                            {
                                list: myob.dataDictionary[category]['Options'],
                                autoFirst: true,
                                filter: function(text, input) {
                                    return Awesomplete.FILTER_CONTAINS(text, input) && Awesomplete.blackList.indexOf(text.value) === -1;;
                                },
                                replace: function(text) {
                                    // var before = this.input.value.match(/^.+,\s*|/)[0];
                                    // this.input.value = before + text + ', ';
                                    myob.makeCheckboxSection(
                                        this.input,
                                        text.value
                                    );
                                    this.input.value = '';
                                    Awesomplete.blackList.push(text.value);
                                    myob.runCurrentFilter();
                                }
                            }
                        );
                        Awesomplete.blackList = [];
                    }
                }
                myob.profileEnder('createFilterForm');
            },


            makeSectionHeaderForForm: function(type, category)
            {
                var myClass = type + myob.sectionFilterClassAppendix;
                var cleanCategory = category.replace(/\W/g, '');
                var html =  '<div class="' + myob.filterGroupClass + ' ' + myClass + '" field-type="'+type+'" data-to-filter="' + category.raw2attr() + '">';
                if (type === 'checkbox') {
                    html += '<span class="' + myob.inverseSelectionFilterClass + '"><i class="material-icons">flip</i></span>';
                }
                html += '<label class="'+myob.groupLabelClass+'">' + myob.replaceAll(category, '-', ' ') + '</label>';
                html += '<ul>';
                return html;
            },

            /**
             * creates the filter form
             * @param  {string} type       [description]
             * @param  {string} category   [description]
             * @param  {int} tabIndex   [description]
             * @param  {string} valueIndex [description]
             *
             * @return {string}            HTML
             */
            makeFieldForForm: function(type, category, tabIndex, valueIndex)
            {
                var cleanCategory = category.replace(/\W/g, '');
                var cleanValue = valueIndex.toString().raw2safe().toLowerCase();
                var valueID = ('TFS_' + cleanCategory + '_' + cleanValue).replace(/[^a-zA-Z0-9]+/g, '_');
                if(myob.myFilterFormInner.find('input#'+valueID).length === 0){
                    var startString = '<li class="' + type + 'Field">';
                    var endString = '</li>';
                    switch (type) {
                        case 'favourites':
                            var checked = '';
                            if(typeof myob.cfi[category] !== 'undefined') {
                                checked = ' checked="checked"';
                            }
                            return startString +
                                '<input class="favourites" type="checkbox" name="'+category.raw2attr()+'" id="'+valueID+'" tabindex="'+tabIndex+'" '+checked+' />' +
                                '<label for="' + valueID + '">❤ ❤ ❤</label>' +
                                endString;
                            break;
                        case 'keyword':
                        case 'tag':
                            var currentValueForForm = '';
                            var additionToField = '';
                            if(type === 'keyword') {
                                var extraClass = 'keyword';
                                if(typeof myob.cfi[category] !== 'undefined') {
                                    if(typeof myob.cfi[category][0] !== 'undefined') {
                                        for(var i = 0; i < myob.cfi[category].length; i++) {
                                            currentValueForForm = myob.cfi[category][i].vtm;
                                            currentValueForForm = currentValueForForm.raw2attr();
                                        }
                                    }
                                }
                            } else if(type === 'tag') {
                                if(typeof myob.cfi[category] !== 'undefined') {
                                    for(var i = 0; i < myob.cfi[category].length; i++) {
                                        valueIndex = myob.cfi[category][i].vtm + '';
                                        var html = myob.makeFieldForForm('checkbox', category, tabIndex, valueIndex);
                                        if(html.length > 5) {
                                            html = html.replace('<input ', '<input checked="checked" ');
                                        }
                                        additionToField += html;
                                    }
                                }
                                var extraClass = 'awesomplete';
                            }
                            return startString +
                                    '<input class="text ' + extraClass + '" type="text" name="'+category.raw2attr()+'" id="'+valueID+'" tabindex="'+tabIndex+'" value="'+currentValueForForm+'" />' +
                                    additionToField +
                                    endString;
                        case 'checkbox':
                            var checked = '';
                            if(typeof myob.cfi[category] !== 'undefined') {
                                for(var i = 0; i < myob.cfi[category].length; i++) {
                                    if(cleanValue === myob.cfi[category][i].vtm.trim()) {
                                        checked = 'checked="checked"';
                                        break;
                                    }
                                }
                            }
                            var labelValue = valueIndex.toString().raw2safe();
                            return startString +
                                    '<input class="checkbox" type="checkbox" name="' + valueID + '" id="' + valueID + '" value="' + cleanValue + '" ' + checked + ' tabindex="'+tabIndex+'" />' +
                                    '<label for="' + valueID + '">' + labelValue + '</label>' +
                                    endString;

                        case 'number':
                        case 'date':
                            var currentValueForForm = {gt: '', lt: ''};
                            if(typeof myob.cfi[category] !== 'undefined') {
                                currentValueForForm = myob.cfi[category][0];
                            }
                            var s = startString +
                                    '<span class="gt">' +
                                    ' <label for="' + valueID + '_gt">' + myob.greaterThanLabel + '</label>' +
                                    ' <input data-dir="gt" data-label="' + myob.greaterThanLabel.raw2attr() + '" class="number" step="any" type="number" name="' + cleanCategory + '[]" id="' + valueID + '" tabindex="'+tabIndex+'" value="'+currentValueForForm['gt']+'" />' +
                                    ' </span><span class="lt">' +
                                    ' <label for="' + valueID + '_lt">' + myob.lowerThanLabel + '</label>' +
                                    ' <input data-dir="lt" data-label="' + myob.lowerThanLabel.raw2attr() + '"  class="number" step="any" type="number" name="' + cleanCategory + '[]" id="' + valueID + '_lt" tabindex="'+tabIndex+'" value="'+currentValueForForm['lt']+'" />' +
                                    ' </span>' +
                                    endString;
                            if(type === 'date') {
                                s = myob.replaceAll(s, 'number', 'datetime-local');
                                s = myob.replaceAll(s, 'step', '86400');
                            }
                            return s;

                    }
                }
            },

            makeSectionFooterForForm: function()
            {
                return '</ul></div>';
            },

            makeCheckboxSection: function(input, valueIndex)
            {
                input = jQuery(input);
                var category = input.attr('name');
                var tabIndex = input.attr('tabindex');
                var html = myob.makeFieldForForm('checkbox', category, tabIndex, valueIndex);
                if(html.length > 5) {
                    html = html.replace('<input ', '<input checked="checked" ');
                    input.closest('ul').append(html);
                }
            },













            //===================================================================
            // SCRIPT SECTION: *** MANIPULATIONS
            //===================================================================

            resetAll: function(){
                myob.cfi = {};
                myob.myRowsMatching.length = 0;
                myob.myRowsMatching = [];
                myob.createFilterForm();
                myob.windowTimeoutStoreSetter(
                    'runCurrentFilter',
                    function() {
                        myob.runCurrentFilter();
                    },
                    myob.millisecondsBetweenActionsLong
                );
            },

            runCurrentSort: function()
            {
                // clear endRowManipulation just because we are going to run it in the end again - anyway ...
                myob.windowTimeoutStoreSetter('endRowManipulation');

                myob.profileStarter('runCurrentSort');
                myob.sfr = 0;
                myob.myTableHead.find(myob.sortLinkSelector)
                    .removeClass(myob.sortAscClass)
                    .removeClass(myob.sortDescClass);
                var myEl = myob.myTableHead.find(myob.sortLinkSelector+'[data-sort-field="'+myob.csr.sct+'"]').first();
                if(myEl && myEl.length > 0) {
                    myob.startRowManipulation();
                    var type = myEl.attr("data-sort-type");
                    var category = myob.csr.sct;
                    if(typeof type === 'undefined') {
                        type = myob.dataDictionary[category]['DataType'];
                    }
                    var arr = [];
                    if(typeof myob.dataDictionary[category] === 'undefined') {
                        myob.dataDictionary[category] = {};
                    }
                    if(typeof myob.dataDictionary[category]['Values'] === 'undefined') {
                        myob.dataDictionary[category]['Values'] = {};
                    }
                    var rows = myob.dataDictionary[category]['Values'];
                    for (var rowID in rows) {
                        if (rows.hasOwnProperty(rowID)) {
                            var dataValue = rows[rowID][0];
                            if(typeof dataValue !== 'undefined') {
                                if(type === "number") {
                                    if(typeof dataValue !== 'number') {
                                        dataValue = dataValue.replace(/[^\d.-]/g, '');
                                        dataValue = parseFloat(dataValue);
                                    }
                                }
                                else {
                                    //do nothing ...
                                }
                            }
                            else {
                                dataValue = 'zzzzzzzzzzzzzzzzzz';
                            }
                            var innerArray = [dataValue, rowID];
                            arr.push(innerArray);
                        }
                    }

                    if(myob.useJSON) {
                        //do nothing
                    } else {
                        var tempRows = myob.myTableBody.find('> tr');
                        var tempRowsAsObject = {};
                        jQuery(tempRows).each(
                            function(i, el) {
                                var myTempRowObject = jQuery(el);
                                var tempRowID = myTempRowObject.attr('id');
                                tempRowsAsObject[tempRowID] = myTempRowObject;
                            }
                        )
                    }
                    //start doing stuff
                    //clear table ...
                    myob.myTableBody.empty();

                    //sort
                    arr.sort(myob.getSortComparator(type));

                    //show direction
                    var sortLinkSelection = myob.myTableHead
                        .find(myob.sortLinkSelector + '[data-sort-field="'+myob.csr.sct+'"]');
                    if(myob.csr.sdi === "desc"){
                        arr.reverse();
                        sortLinkSelection.attr("data-sort-direction", "asc")
                            .addClass(myob.sortDescClass)
                            .removeClass(myob.sortAscClass);
                    }
                    else{
                        sortLinkSelection.attr("data-sort-direction", "desc")
                            .addClass(myob.sortAscClass)
                            .removeClass(myob.sortDescClass);
                    }
                    myob.myRowsSorted.length = 0;
                    myob.myRowsSorted = [];
                    arr.forEach(
                        function(innerArray) {
                            var rowID = innerArray[1];
                            myob.myRowsSorted.push(rowID);
                            if(myob.useJSON) {
                                //do nothing
                            } else {
                                myob.myTableBody.append(tempRowsAsObject[rowID]);
                            }
                        }
                    );
                    myob.windowTimeoutStoreSetter(
                        'endRowManipulation',
                        function() {
                            myob.endRowManipulation();
                        },
                        myob.millisecondsBetweenActionsLong
                    );
                }
                myob.profileEnder('runCurrentSort');
            },




            runCurrentFilter: function()
            {
                myob.profileStarter('runCurrentFilter');
                // clear endRowManipulation just because we are going to run it in the end again - anyway ...
                myob.windowTimeoutStoreSetter('endRowManipulation');
                myob.sfr = 0;
                myob.workOutCurrentFilter();
                myob.startRowManipulation();
                if(myob.hasFilter() === false) {
                    //clone!
                    myob.myRowsMatching = myob.myRowsSorted.splice(0);
                    myob.myRows.each(
                        function(i, row) {
                            var row = jQuery(row);
                            row.addClass(myob.matchClass).removeClass(myob.notMatchClass);
                        }
                    );

                } else {
                    //start with blank slate ...
                    myob.myRowsMatching.length = 0;
                    myob.myRowsMatching = [];
                    for(var i = 0; i < myob.myRowsSorted.length; i++) {
                        var rowID = myob.myRowsSorted[i];
                        if(myob.useJSON) {
                            var rowObject = myob.rowRawData[rowID];
                        } else {
                            var row = myob.myTableBody.find('#'+rowID).first();
                        }
                        //innocent until proven guilty
                        var rowMatches = true;

                        var stillLookingForCategory = true;
                        //check for each category
                        Object.keys(myob.cfi).forEach(
                            function(categoryToMatch, categoryToMatchIndex) {
                                if(stillLookingForCategory) {
                                    //lets not assume there is anything
                                    var rowMatchesForFilterGroup = false;
                                    //values selected in category
                                    var stillLookingForValue = true;
                                    for(var j = 0; j < myob.cfi[categoryToMatch].length; j++) {
                                        var searchObject = myob.cfi[categoryToMatch][j];
                                        //what is the value .. if it matches, the row is OK and we can go to next category ...
                                        if(stillLookingForValue) {
                                            if(categoryToMatch === myob.favouritesCategoryTitle) {

                                                if(typeof rowID !== 'undefined' && rowID.length > 0) {
                                                    if(myob.mfv.indexOf(rowID) > -1) {
                                                        rowMatchesForFilterGroup = true;
                                                    }
                                                }
                                            } else if(categoryToMatch === myob.keywordsCategoryTitle) {
                                                var vtm = searchObject['vtm'];
                                                if(myob.useJSON) {
                                                    var rowText = '';
                                                    for(category in myob.dataDictionary) {
                                                        if(myob.dataDictionary.hasOwnProperty(category)) {
                                                            var myTempValues = myob.dataDictionary[category]['Values'][rowID];
                                                            rowText += myTempValues.join(' ').toLowerCase();
                                                        }
                                                    }
                                                } else {
                                                    var rowText = row.text().toLowerCase();
                                                }
                                                var keywords = vtm.split(' ');
                                                var matches = true;
                                                for(var k = 0; k < keywords.length; k++) {
                                                    var keyword = keywords[k].trim().toLowerCase();
                                                    if(rowText.indexOf(keyword) === -1) {
                                                        matches = false;
                                                        break;
                                                    }
                                                }
                                                if(matches === true) {
                                                    rowMatchesForFilterGroup = true;
                                                }
                                            } else {
                                                if(Array.isArray(myob.dataDictionary[categoryToMatch]['Values'][rowID])) {
                                                    var myTempValues = myob.dataDictionary[categoryToMatch]['Values'][rowID];
                                                    for(var myTempValuesCount = 0; myTempValuesCount < myTempValues.length; myTempValuesCount++) {
                                                        var rowValue = myTempValues[myTempValuesCount];
                                                        switch(myob.dataDictionary[categoryToMatch]['DataType']) {
                                                            case 'date':
                                                                //to do ....
                                                                break;
                                                            case 'number':
                                                                if(typeof searchObject['vtm'] !== 'undefined'){
                                                                    var vtm = searchObject['vtm'];
                                                                    if(rowValue == vtm){
                                                                        rowMatchesForFilterGroup = true;
                                                                    }
                                                                } else {
                                                                    if(typeof rowValue !== 'number') {
                                                                        rowValue = parseFloat(rowValue.replace(/[^0-9.]/g,''));
                                                                    }
                                                                    var lt = searchObject['lt'];
                                                                    var match = true;
                                                                    if(jQuery.isNumeric(lt) && lt !== 0) {
                                                                        if(lt < rowValue) {
                                                                            match = false;
                                                                        }
                                                                    }
                                                                    if(match) {
                                                                        var gt = searchObject['gt'];
                                                                        if(jQuery.isNumeric(gt) && gt !== 0) {
                                                                            if(gt > rowValue) {
                                                                                match = false;
                                                                            }
                                                                        }
                                                                    }
                                                                    if(match) {
                                                                        rowMatchesForFilterGroup = true;
                                                                    }
                                                                }
                                                                break;
                                                            case 'string':
                                                                rowValue = rowValue.raw2safe().toLowerCase();
                                                            default:
                                                                if(rowValue === searchObject['vtm']){
                                                                    rowMatchesForFilterGroup = true;
                                                                }
                                                        }
                                                        if(rowMatchesForFilterGroup){
                                                            //break out for each loop
                                                            return false;
                                                        }
                                                    }
                                                }
                                            }
                                            if(rowMatchesForFilterGroup) {
                                                stillLookingForValue = false;
                                            }
                                        }
                                    }
                                    // you are out ...
                                    if(!rowMatchesForFilterGroup) {
                                        rowMatches = false;
                                        //by breaking here, we have an "AND" filter search....
                                        stillLookingForCategory = false;
                                    }
                                }
                            }
                        );
                        //hide or show
                        if(rowMatches){
                            myob.myRowsMatching.push(rowID);
                            if(myob.useJSON) {
                                //do nothing
                            } else {
                                row.addClass(myob.matchClass).removeClass(myob.notMatchClass);
                            }
                        }
                        else {
                            if(myob.useJSON) {
                                //do nothing
                            } else {
                                row.addClass(myob.notMatchClass).removeClass(myob.matchClass);
                            }
                        }
                    }
                }
                myob.windowTimeoutStoreSetter(
                    'endRowManipulation',
                    function() {
                        myob.endRowManipulation();
                    },
                    myob.millisecondsBetweenActionsLong
                );
                myob.profileEnder('runCurrentFilter');
            },

            /**
             * switch to a different page
             * @param  {int} page [description]
             */
            gotoPage: function(page, force)
            {
                myob.profileStarter('gotoPage');
                var newSFR = page * myob.visibleRowCount;
                myob.pge = page;
                if(newSFR !== myob.sfr || force) {
                    // clear endRowManipulation just because we are going to run it in the end again - anyway ...
                    myob.windowTimeoutStoreSetter('endRowManipulation');
                    myob.sfr = newSFR;
                    myob.startRowManipulation();
                    myob.windowTimeoutStoreSetter(
                        'endRowManipulation',
                        function() {
                            myob.endRowManipulation();
                        },
                        myob.millisecondsBetweenActionsLong
                    );
                }
                myob.profileEnder('gotoPage');
            },

            /**
             * switch to a different page
             * @param  {int} page [description]
             */
            reloadCurrentPage: function()
            {
                myob.profileStarter('reloadCurrentPage');
                // clear endRowManipulation just because we are going to run it in the end again - anyway ...
                myob.windowTimeoutStoreSetter('endRowManipulation');
                myob.startRowManipulation();
                myob.windowTimeoutStoreSetter(
                    'endRowManipulation',
                    function() {
                        myob.endRowManipulation();
                    },
                    myob.millisecondsBetweenActionsLong
                );
                myob.profileEnder('reloadCurrentPage');
            },










            //===================================================================
            // SCRIPT SECTION: *** SCROLLING
            //===================================================================

            /**
             * show the form button when it table is in view OR when it is form is open
             * do this every second
             */
             scrollToTopOfHolder: function()
             {
                 if(myob.canPushState && myob.scrollToTopAtPageOpening) {
                     var exactPosition = myob.myTableHolder.position().top;
                     if(myob.sizeOfFixedHeader) {
                         exactPosition = exactPosition - myob.sizeOfFixedHeader;
                     }
                     jQuery('html, body').animate(
                         {
                             scrollTop: exactPosition
                         },
                         myob.millisecondsBetweenActionsLong
                     );
                 } else {
                     //fire scroll event in any case ...
                     window.scrollTo(window.scrollX, window.scrollY);
                 }

                 //we now allow scrolls
                 myob.scrollToTopAtPageOpening = true;
             },


            setTableWidthAndFixHeader: function()
            {
                myob.windowTimeoutStoreSetter(
                    'setTableWidthInFuture',
                    function() {
                        myob.setTableWidth();
                        myob.fixTableHeader();
                    },
                    myob.millisecondsBetweenActionsLong
                );
            },

            setTableWidth: function()
            {
                myob.profileStarter('setTableWidth');
                if(myob.fixedHeaderClass) {
                    myob.removeFixedTableHeader();
                    //just in case ...
                    if(myob.myTableHolder.isOnScreen()) {

                    }
                    var filterFormIsOpen = myob.myTableHolder.hasClass(myob.filterIsOpenClass);
                    if(filterFormIsOpen === false) {
                        //weird? why add twice?????
                        if(myob.myTableHolder.find('.tfspushdowndiv').length === 0) {
                            jQuery('<div class="tfspushdowndiv"></div>').insertBefore(myob.myTable);
                        }
                    } else {
                        if(myob.myTableHolder.find('.tfspushdowndiv').length > 0) {
                            //remove tfspushdowndiv
                        }
                    }
                }
                myob.profileEnder('setTableWidth');
            },

            removeFixedTableHeader: function()
            {
                myob.myTableHolder.removeClass(myob.fixedHeaderClass);
                myob.hasFixedTableHeaderSet = false;
            },

            fixTableHeader: function()
            {
                myob.profileStarter('fixTableHeader');
                if(myob.myTableHolder.isOnScreen()) {
                    //show if it is in use / not in use ...
                    //why do we need this?
                    myob.myTableHolder.addClass(myob.filterInUseClass); //class for filter
                    myob.myTableHolder.removeClass(myob.filterNotInUseClass);
                    if(myob.hasFixedTableHeader) {
                        //about height ...
                        var relativeMove = myob.myTableHead.outerHeight();
                        relativeMove += myob.myFilterFormHolder.outerHeight();
                        var pushDownDiv = myob.myTableHolder.find('.tfspushdowndiv');
                        pushDownDiv.height(relativeMove);
                        //get basic data about scroll situation...
                        var tableOffset = myob.myTableBody.offset().top;
                        var offset = jQuery(window).scrollTop();
                        //show fixed header if the Page offset is Grater than the table
                        //ie. the table is above the current scroll point
                        //ie. the table header is no longer visible
                        var showFixedHeader = offset > tableOffset ? true: false;

                        //end reset
                        if(showFixedHeader === true && myob.hasFixedTableHeaderSet === false) {
                            myob.myTableHolder.addClass(myob.fixedHeaderClass); //class for pos fixed
                            myob.hasFixedTableHeaderSet = true;

                            var width = myob.myTableHead.width();
                            myob.myFilterFormHolder.width(width);

                            var top = myob.myFilterFormHolder.outerHeight();
                            myob.myFloatingTable.css('top', top); //set offset
                            myob.myFloatingTable.width(width)
                        } else {
                            if(myob.hasFixedTableHeaderSet === true) {
                                myob.hasFixedTableHeaderSet = false;
                                myob.myTableHolder.removeClass(myob.fixedHeaderClass);
                            }
                        }
                    }
                } else {
                    myob.myTableHolder.addClass(myob.filterNotInUseClass);
                    myob.myTableHolder.removeClass(myob.filterInUseClass);
                }
                myob.profileEnder('fixTableHeader');
            },










            //===================================================================
            // SCRIPT SECTION: *** ROW MANIPULATION: START + END
            //===================================================================

            startRowManipulation: function()
            {
                myob.profileStarter('startRowManipulation');
                if(typeof myob.startRowFX1 === 'function') {
                    myob.startRowFX1(myob);
                }
                //show the table as loading
                myob.myTable.addClass(myob.hideClass);

                myob.myTableHolder.find(myob.moreRowEntriesSelector).hide();

                myob.setRowsWithDetails(true);

                //hide all the rows

                if(typeof myob.startRowFX2 === 'function') {
                    myob.startRowFX2(myob);
                }
                myob.profileEnder('startRowManipulation');
            },

            endRowManipulation: function()
            {
                myob.profileStarter('endRowManipulation');
                if(typeof myob.endRowFX1 === 'function') {
                    myob.endRowFX1(myob);
                }
                //crucial!
                myob.setRowsWithDetails();
                //get basic numbers
                var minRow = myob.sfr;
                var matchCount = 0;
                var actualVisibleRowCount = 0;
                var hasFilter = myob.hasFilter();
                var noFilter = hasFilter ? false : true;
                if(hasFilter) {
                    var tempRowsMatching = myob.myRowsMatching.slice(0);
                } else {
                    if(myob.myRowsTotalCount !== myob.myRowsMatching.length) {
                        myob.myRowsMatching = myob.myRowsSorted.splice(0);
                    }
                }
                myob.myRowsVisible.length = 0;
                myob.myRowsVisible = [];
                if(myob.useJSON) {
                    for(var i = 0; i < myob.myRowsSorted.length; i++) {
                        var rowID = myob.myRowsSorted[i];
                        var match = false;
                        if(hasFilter) {
                            var index = tempRowsMatching.indexOf(rowID);
                            if(index !== -1) {
                                match = true;
                                tempRowsMatching.splice(index, 1);
                            }
                        } else {
                            match = true;
                        }
                        if(match) {
                            matchCount++;
                            if(matchCount > minRow && actualVisibleRowCount < myob.visibleRowCount) {
                                actualVisibleRowCount++;
                                myob.myRowsVisible.push(rowID);
                            }
                        }
                    }
                    myob.buildRows();
                } else {
                    var rowMatches = false;
                    //hide and show ...
                    myob.myRows.each(
                        function(i, el) {
                            el = jQuery(el);
                            rowID = el.attr('id');
                            if(noFilter || el.hasClass(myob.matchClass)) {
                                matchCount++;
                                if(matchCount > minRow && actualVisibleRowCount < myob.visibleRowCount) {
                                    actualVisibleRowCount++;
                                    el.removeClass(myob.hideClass).addClass(myob.showClass);
                                    myob.myRowsVisible.push(rowID);
                                }
                            }
                        }
                    );
                }

                myob.highlightFilteredRows();

                myob.myTable.removeClass(myob.hideClass);
                //todo: double-up...
                // myob.myTable.show();


                if( ! myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                    myob.windowTimeoutStoreSetter(
                        'scrollToTopOfHolder',
                        function() {
                            myob.scrollToTopOfHolder();
                        },
                        myob.millisecondsBetweenActionsShort
                    );
                }

                myob.createPagination(minRow, matchCount, actualVisibleRowCount);
                //reset rows ...
                myob.setRowsWithDetails();
                myob.pushState();
                if(typeof myob.endRowFX2 === 'function') {
                    myob.endRowFX2(myob);
                }
                myob.profileEnder('endRowManipulation');
                myob.debugger();
            },


            buildRows: function()
            {
                myob.profileStarter('buildRows');
                var dd = myob.dataDictionary;
                var pre = myob.placeholderStartDelimiter;
                var post = myob.placeholderEndDelimiter;
                var html = '';
                for(var i = 0; i < myob.myRowsVisible.length; i++) {
                    rowID = myob.myRowsVisible[i];
                    innerHtml = myob.templateRow;
                    hasDoneID = false;
                    for(category in dd) {
                        if (dd.hasOwnProperty(category)) {
                            //category info
                            var ddc = dd[category]
                            var values = ddc['Values'][rowID];
                            for(var j = 0; j < values.length; j++) {
                                var value = values[j];
                                searchValue = pre+category+post;
                                //easiest way to avoid regex, etc...
                                innerHtml = innerHtml.split(searchValue).join(value);
                            }

                            //also replace the row ID
                            if(hasDoneID === false) {
                                hasDoneID = true;
                                searchValue = pre+'RowID'+post;
                                //easiest way to avoid regex, etc...
                                innerHtml = innerHtml.split(searchValue).join(rowID);
                            }
                        }
                    }
                    html += innerHtml;
                }
                if(html.length > 0) {
                    myob.myTableBody.html(html);
                    var selectorPhrase = 'input['+myob.inputValueDataAttribute+'], select['+myob.inputValueDataAttribute+'], textarea['+myob.inputValueDataAttribute+']'
                    myob.myTableBody.find(selectorPhrase).each(
                        function(i, el) {
                            var el = jQuery(el)
                            var value = el.attr(myob.inputValueDataAttribute);
                            value = value.raw2safe();
                            jQuery(el).val(value);
                        }
                    );
                }
                myob.profileEnder('buildRows');
            },

            highlightFilteredRows: function()
            {
                myob.profileStarter('highlightFilteredRows');
                myob.myTableBody.find('.' + myob.selectedFilterItem).each(
                    function(i, el) {
                        jQuery(el).removeClass(myob.selectedFilterItem);
                    }
                );
                Object.keys(myob.cfi).forEach(
                    function(categoryToMatch, categoryToMatchIndex) {
                        myob.myTableBody.find('['+myob.filterItemAttribute+'="' + categoryToMatch + '"]').each(
                            function(i, el) {
                                jQuery(el).addClass(myob.selectedFilterItem);
                            }
                        );
                    }
                );
                myob.profileEnder('highlightFilteredRows');
            },

            createPagination: function(minRow, matchCount, actualVisibleRowCount)
            {
                //calculate final stuff ...
                if(matchCount > 0){
                    jQuery('.'+myob.noMatchMessageClass).hide();
                }
                else {
                    jQuery('.'+myob.noMatchMessageClass).show();
                }            //
                var maxRow = minRow + actualVisibleRowCount;
                var pageCount = Math.ceil(matchCount / myob.visibleRowCount);
                var currentPage = Math.floor(myob.sfr / myob.visibleRowCount);
                //create html for pagination
                var pageHTML = '';
                if(pageCount > 1) {
                    var i = 0;
                    var dotCount = 0;
                    var startOfPaginator = currentPage - 2;
                    var endOfPaginator = currentPage + 2;
                    var classes = [];
                    for(i = 0; i < pageCount; i++) {
                        if(currentPage === i) {
                            dotCount = 0;
                            pageHTML += '<span>['+(i+1)+']</span>';
                        } else {
                            var test1 = (i > startOfPaginator && i < endOfPaginator);
                            var test2 = (i >= (pageCount - 1));
                            var test3 = (i < (0 + 1));
                            if(test1 || test2 || test3) {
                                classes.length = 0;
                                classes = [];
                                dotCount = 0;
                                if(i === 0) {
                                    classes.push('first');
                                }
                                if(i === (pageCount - 1)) {
                                    classes.push('last');
                                }
                                if(i === (currentPage - 1)) {
                                    classes.push('prev');
                                }
                                if(i === (currentPage  + 1)) {
                                    classes.push('next');
                                }
                                pageHTML += '<a href="#" class="'+classes.join(' ')+'"data-page="'+i+'">'+(i+1)+'</a> ';
                            } else {
                                if(dotCount < 3) {
                                    dotCount++;
                                    pageHTML += ' . ';
                                }
                            }
                         }
                         pageHTML += ' ';
                     }
                     myob.myTableHolder.find(myob.moreRowEntriesSelector).show();
                }
                minRow++;
                if(myob.myRowsTotalCount === matchCount) {
                    myob.myTableHolder.find(myob.filteredCountHolder).hide();
                    myob.myTableHolder.find(myob.unfilteredCountHolder).show();
                } else {
                    myob.myTableHolder.find(myob.unfilteredCountHolder).hide();
                    myob.myTableHolder.find(myob.filteredCountHolder).show();
                }
                myob.myTableHolder.find(myob.minRowSelector).text(minRow);
                myob.myTableHolder.find(myob.maxRowSelector).text(maxRow);
                myob.myTableHolder.find(myob.matchRowCountSelector).text(matchCount);
                myob.myTableHolder.find(myob.totalRowCountSelector).text(myob.myRowsTotalCount);
                myob.myTableHolder.find(myob.visibleRowCountSelector).val(myob.visibleRowCount);
                myob.myTableHolder.find(myob.paginationSelector).html(pageHTML);
            },


            //===================================================================
            // SCRIPT SECTION: *** CALCULATIONS
            //===================================================================

            hasFilter: function()
            {
                return myob.objectSize(myob.cfi) === 0  ? false : true;
            },

            workOutCurrentFilter: function(){
                myob.profileStarter('workOutCurrentFilter');
                var html = "";
                var categoryHolder;
                var category = '';
                var type = '';
                var ivl = '';
                var vtm = '';
                var filterValueArray = [];
                //reset
                myob.cfi = {};
                myob.myFilterFormHolder
                    .find(' .' + myob.filterGroupClass)
                    .each(
                        function(i, el){
                            categoryHolder = jQuery(el);
                            category = categoryHolder.attr('data-to-filter');
                            var fieldType = categoryHolder.attr('field-type')
                            if(fieldType === 'keyword') {
                                var dataType = 'keyword';
                            } else if(fieldType === 'favourites') {
                                var dataType = 'favourites';
                            } else {
                                var dataType = myob.dataDictionary[category]['DataType'];
                            }
                            var vtms = [];
                            categoryHolder.find('input').each(
                                function(i, input) {
                                    input = jQuery(input);
                                    var ivl = input.val().raw2safe();
                                    var vtm = ivl.toLowerCase();
                                    var innerInputVal = '';
                                    var innerValueToMatch = '';
                                    switch(fieldType) {
                                        case 'keyword':
                                            if(vtm.length > 1) {
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = [];
                                                }
                                                if(type === 'keyword') {
                                                    myob.cfi[category].push(
                                                        {
                                                            vtm: vtm,
                                                            ivl: ivl
                                                        }
                                                    );
                                                    vtms.push(vtm);
                                                } else {
                                                    var filterValueArray = vtm.split(",");
                                                    var i = 0;
                                                    var len = filterValueArray.length;
                                                    var tempVal = '';
                                                    for(i = 0; i < len; i++) {
                                                        innerInputVal = filterValueArray[i].trim();
                                                        innerValueToMatch = innerInputVal;
                                                        if(innerValueToMatch.length > 1) {
                                                            myob.cfi[category].push(
                                                                {
                                                                    vtm: innerValueToMatch,
                                                                    ivl: innerInputVal
                                                                }
                                                            );
                                                            vtms.push(innerValueToMatch);
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 'tag':
                                        case 'checkbox':
                                            if(input.is(":checked")){
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = [];
                                                }
                                                vtms.push(vtm);
                                                myob.cfi[category].push(
                                                    {
                                                        vtm: vtm,
                                                        ivl: ivl
                                                    }
                                                );
                                            }
                                            break;
                                        case 'favourites':
                                            if(input.is(":checked")){
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = [];
                                                }
                                                myob.cfi[category].push(
                                                    {
                                                        vtm: vtm, ivl: ivl
                                                    }
                                                );
                                                vtms.push(vtm);
                                                myob.myTableHolder.addClass(myob.hasFavouritesInFilterClass);
                                            } else {
                                                myob.myTableHolder.removeClass(myob.hasFavouritesInFilterClass);
                                            }
                                            break;
                                        case 'number':
                                            var val = parseFloat(input.val());
                                            if(jQuery.isNumeric(val) && val !== 0) {
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = [];
                                                }
                                                if(typeof myob.cfi[category][0] === 'undefined') {
                                                    myob.cfi[category][0] = {};
                                                }
                                                vtms.push(input.attr('data-label') + val + ' ');
                                                myob.cfi[category][0][input.attr('data-dir')] = val;
                                            }
                                            break;
                                        case 'date':
                                            var val = input.val().trim();
                                            if(val !== '0' && val !== '') {
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = {};
                                                }
                                                vtms.push(input.attr('data-label') + val);
                                                myob.cfi[category][0][input.attr('data-dir')] = val;
                                            }
                                            break;
                                    }
                                }
                            );
                            if(typeof myob.cfi[category] !== "undefined") {
                                var leftLabel = categoryHolder.find('label.'+myob.groupLabelClass).text();
                                html += "<li class=\"category\"><strong>" + leftLabel + ":</strong> <span>" + vtms.join('</span><span>') + "</span></li>";
                            }
                        }
                    //funny indenting to stay ....
                );
                var targetDomElement = myob.myTableHolder.find('.'+myob.currentSearchFilterClass);
                if( myob.hasFilter() === true) {
                    html = '<ul>' + html + '</ul>';
                    var title = targetDomElement.attr('data-title');
                    if(typeof title === 'string' && title.length > 0) {
                        title = '<h3>' + title + '</h3>';
                        html = title + html;
                    }
                    myob.myTableHolder.addClass(myob.hasFilterClass).removeClass(myob.doesNotHaveFilterClass);
                } else {
                    html = targetDomElement.attr('data-no-filter-text');
                    myob.myTableHolder.removeClass(myob.hasFilterClass).addClass(myob.doesNotHaveFilterClass);
                }
                targetDomElement.html(html);
                myob.profileEnder('workOutCurrentFilter');
            },





            //===================================================================
            // SCRIPT SECTION: *** URL CHANGES, SERVER, URL, AND COOKIE INTERACTIONS
            //===================================================================

            /**
             * change URL
             * @param  {boolean} push push the state
             */
            pushState: function()
            {
                if(myob.canPushState === true) {
                    history.replaceState(null, null, myob.currentURL());
                }
            },


            currentURL: function ()
            {
                var urlObject = {};
                for(var i =0;i < myob.filterAndSortVariables.length; i++) {
                    var varName = myob.filterAndSortVariables[i];
                    var tempType = typeof myob[varName];
                    if(
                        (tempType === 'number' && myob[varName] !== 0) ||
                        (tempType === 'string' && myob[varName].length > 0) ||
                        (tempType === 'boolean') ||
                        (tempType === 'object' && myob.objectSize(myob[varName]) > 0)
                    ) {
                        urlObject[varName] = myob[varName];
                    }
                }
                if(typeof JSURL !== 'undefined')  {
                    var urlpart = JSURL.stringify(urlObject);
                }
                else {
                    var urlpart = "tfs=" + encodeURI(JSON.stringify(urlObject));
                }
                return myob.baseURL + '#' + urlpart
            },

            retrieveLocalCookie: function()
            {
                //get favourites data
                if(typeof Cookies !== 'undefined') {
                    myob.mfv = Cookies.getJSON('mfv');
                    if(typeof myob.mfv === 'undefined') {
                        myob.mfv = [];
                    } else {
                        myob.serverDataToApply['mfv'] = true;
                    }
                    var v = Cookies.getJSON('visibleRowCount');
                    visibleRowCount = myob.visibleRowCountValidator(v);
                    if(visibleRowCount !== false) {
                        myob.visibleRowCount = v;
                    }
                }
            },

            /**
             * get data from the server and apply it to the current object ...
             * only 'load' works right now, but other variables can be applied
             * in the future...
             */
            retrieveDataFromFragment: function()
            {
                var qd = {};
                if(typeof JSURL !== 'undefined') {
                    if(typeof location.hash !== 'undefined' && location.hash && location.hash.length > 0) {
                        var hash = window.location.hash.substr(1);
                        var data = JSURL.tryParse(hash, {});
                        for (var property in data) {
                            if (data.hasOwnProperty(property)) {
                                if(property === 'pge') {
                                    data[property] = parseInt(data[property]);
                                }
                                myob[property] = data[property];
                                myob.serverDataToApply[property] = true;
                            }
                        }
                    }
                }
            },

            /**
             * get data from the server and apply it to the current object ...
             * only 'load' works right now, but other variables can be applied
             * in the future...
             */
            retrieveDataFromGetVar: function()
            {
                var qd = {};
                if(typeof location.search !== 'undefined' && location.search && location.search.length > 0) {
                    location.search.substr(1).split("&").forEach(
                        function(item) {
                            var s = item.split("="),
                                k = s[0],
                                v = s[1] && decodeURIComponent(s[1]);
                            //(k in qd) ? qd[k].push(v) : qd[k] = [v]
                            (qd[k] = qd[k] || []).push(v) //short-circuit
                        }
                    );
                }
                if(typeof qd.load !== 'undefined') {
                    if(typeof qd.load[0] !== 'undefined') {
                        if(typeof qd.load[0] === 'string' && qd.load.length > 0) {
                            myob.urlToLoad = qd.load;
                        }
                    }
                }
            },

            processRetrievedData: function(forceFavs)
            {
                myob.profileStarter('processRetrievedData');
                if(myob.urlToLoad !== '') {
                    var url = myob.serverConnectionURL + 'load/' + myob.urlToLoad + '/';
                    myob.urlToLoad = '';
                    jQuery.getJSON(
                        url,
                        function( response ) {
                            var forceFavs = false
                            var data = response.Data;
                            data = JSON.parse(data);
                            for (var property in data) {
                                if (data.hasOwnProperty(property)) {
                                    myob[property] = data[property];
                                    myob.serverDataToApply[property] = true;
                                    if(property === 'mfv') {
                                        forceFavs = true;
                                    }
                                }
                            }
                            myob.processRetrievedData(forceFavs);
                        }
                    ).fail(
                        function(){
                            myob.processRetrievedData(false);
                        }
                    );
                } else {
                    if(typeof myob.serverDataToApply['mfv'] !== 'undefined' && myob.serverDataToApply['mfv'] === true) {
                        //remove all favourites
                        if(myob.useJSON) {
                        } else {
                            myob.myTableBody.find('tr.'+myob.favouriteClass).removeClass(myob.favouriteClass);
                        }
                        //add all favourites
                        for (var i = 0;i < myob.mfv.length;  i++) {
                            var id = myob.mfv[i];
                            if(myob.useJSON) {
                                var favRow = [];
                            } else {
                                var favRow = myob.myTableBody.find('#' + id);
                            }
                            if(favRow.length > 0) {
                                favRow.addClass(myob.favouriteClass);
                            } else {
                                myob.mfv.splice(i, 1);
                                if(typeof Cookies !== 'undefined') {
                                    Cookies.set('mfv', myob.mfv, {path: myob.baseURL, expires: 180});
                                }
                            }
                        }
                        if(myob.mfv.length > 0) {
                            myob.myTableHolder.addClass(myob.hasFavouritesClass);
                        } else {
                            myob.myTableHolder.removeClass(myob.hasFavouritesClass);
                        }
                        if(forceFavs === true) {
                            if(myob.myTableHolder.hasClass(myob.hasFavouritesInFilterClass)) {
                                //doing it twice!
                                myob.myTableHolder.find(myob.showFavouritesSelector).click();
                            }
                            myob.myTableHolder.find(myob.showFavouritesSelector).click();
                        }
                        delete myob.serverDataToApply['mfv']
                    }
                    myob.createFilterForm();
                    if(typeof myob.serverDataToApply['cfi'] !== 'undefined' && myob.serverDataToApply['cfi'] === true) {
                        myob.runCurrentFilter();
                        delete myob.serverDataToApply['cfi'];
                    }
                    if(typeof myob.serverDataToApply['csr'] !== 'undefined' && myob.serverDataToApply['csr'] === true) {
                        var category = myob.csr.sct;
                        var direction = myob.csr.sdi;
                        myob.myTableHead.find(myob.sortLinkSelector)
                            .removeClass(myob.sortAscClass)
                            .removeClass(myob.sortDescClass);
                        myob.myTableHead.find(myob.sortLinkSelector+'[data-sort-field=\''+category+'\']')
                            .attr('data-sort-direction', direction)
                            .click();
                        delete myob.serverDataToApply['csr'];

                    }
                    if(typeof myob.serverDataToApply['pge'] !== 'undefined' && myob.serverDataToApply['pge'] === true) {
                        myob.gotoPage(myob.pge);
                        delete myob.serverDataToApply['pge'];
                    }
                }
                myob.profileEnder('processRetrievedData');
            },



            //===================================================================
            // SCRIPT SECTION: *** HELPER FUNCTIONS
            //===================================================================


            /**
             * * @param {string} type [description]
             */
            getSortComparator: function(type)
            {
                switch (type) {
                    case 'number':
                        return myob.numberComparator;
                    case 'string':
                        return myob.stringComparator;
                    default:
                        return myob.stringComparator;
                }
            },

            findValueOfObject: function(myObject)
            {
                var val = ''
                if(typeof myObject === 'undefined') {
                    return '';
                }
                var nodeName = myObject.prop('nodeName');
                if(typeof nodeName === 'undefined') {
                    nodeName = 'SPAN';
                }
                var mytype = nodeName.toUpperCase();
                var quickInputFind = false;
                switch(mytype) {
                    case 'INPUT':
                    case 'SELECT':
                    case 'TEXTAREA':
                        val = myObject.attr(myob.inputValueDataAttribute);
                        if(typeof val !== 'undefined') {
                            quickInputFind = true;
                        }
                        break;
                    default:
                        quickInputFind = true;
                        val = myObject.text().trim();
                }
                if(quickInputFind === false) {
                    val = myob.findCurrentValueOfInputObject(myObject, mytype);
                    myObject.attr(myob.inputValueDataAttribute, val);
                }
                val = val.raw2safe();

                return val;
            },

            findCurrentValueOfInputObject: function(element, elementType)
            {
                if (typeof elementType === 'undefined') {
                    var nodeName = element.prop('nodeName');
                    var elementType = nodeName.toUpperCase();
                }

                switch(elementType) {
                    case 'INPUT':
                        var inputType = element.attr('type');
                        if(inputType === 'checkbox') {
                            return element[0].checked ? 'YES' : 'NO';
                        }
                        return element.val();
                    case 'SELECT':
                        return element.find("option:selected").text();
                    case 'TEXTAREA':
                        return element.val();
                    default:
                        return '';
                }
            },

            replaceAll: function(string, search, replacement)
            {
                string.split(search).join(replacement);
                return string;
            },

            /**
             * Not currently used ...
             * @param object object
             * @return int
             */
            objectSize: function(object)
            {
                var size = 0;
                var key;
                if(typeof object === "undefined") {
                    return 0;
                }
                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        size++;
                    }
                }
                return size;
            },

            /**
             * sort object ...
             * not currently used ...
             * @param object object
             * @return object
             */
            objectSort: function(object)
            {
                var sortedObject = [];
                for (var valueEntry in object) {
                    if (object.hasOwnProperty(valueEntry)) {
                        sortedObject.push([valueEntry, object[valueEntry]]);
                    }
                }
                sortedObject.sort(function(a, b) {
                    a = a[1];
                    b = b[1];
                    return a < b ? -1 : (a > b ? 1 : 0);
                });
                var newObject = {};
                var i = 0;
                for(i =0; i < sortedObject.length; i++) {
                    if((typeof sortedObject[i][1]) === 'string') {
                        newObject[sortedObject[i][0]] = sortedObject[i][1];
                    }
                }
                return newObject;
            },

            visibleRowCountValidator: function(val)
            {
                val = parseInt(val);
                if (isNaN(val)) {
                    //do nothing
                }
                else if((val | 0) === val) {
                    if(val > 0 && val < 10000) {
                        return val;
                    }
                }
                return false;
            },

            /**
             * not currently used!
             * returns random string
             * @return string
             */
            makeID: function()
            {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                for( var i=0; i < 9; i++ ) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            },

            /**
             * String sorting function
             */
            stringComparator: function(a, b)
            {
                var strA = a[0].toLowerCase();
                var strB = b[0].toLowerCase();
                if (strA == strB) {
                    return 0;
                }
                return strA > strB ? 1 : -1;
            },
            /**
             * Number sorting function
             */
            numberComparator: function(a, b)
            {
                if (isNaN(a[0])) {
                    return 1;
                }
                if (isNaN(b[0])) {
                    return -1;
                }
                return (a[0]- b[0])
            },

            windowTimeoutStoreSetter(name, fx, delay) {
                if(typeof delay === 'undefined') {
                    delay = myob.millisecondsBetweenActionsShort;
                }
                if(typeof myob.windowTimeoutStore[name] !== 'undefined') {
                    window.clearTimeout(myob.windowTimeoutStore[name]);
                }
                myob.windowTimeoutStore[name] = window.setTimeout(
                    fx,
                    delay
                );
            },

            profileStarter: function(name)
            {
                if(myob.debug) {
                    console.log('-----------------------');
                    console.count(name);
                    console.time(name)
                    console.profile(name);
                }
            },

            profileEnder: function(name)
            {
                if(myob.debug) {
                    console.profileEnd(name);
                    console.timeEnd(name);
                    console.log('_______________________');
                }
            },

            debugger: function(name)
            {
                if(myob.debug) {
                    console.log('_______________________');
                    console.log('_______________________ SORTED');
                    console.debug(myob.myRowsSorted);
                    console.log('_______________________ HAS FILTER');
                    console.debug(myob.hasFilter() ? "TRUE" : "FALSE");
                    console.log('_______________________ MATCHING');
                    console.debug(myob.myRowsMatching);
                    console.log('_______________________  VISIBLE ');
                    console.debug(myob.myRowsVisible);
                    var booleans = [];
                    var strings = [];
                    var numbers = [];
                    var arrays = [];
                    var jqueries = [];
                    var objects = [];
                    var others = [];
                    for(prop in myob) {
                        value = myob[prop];
                        var type = typeof value;
                        switch(type) {
                            case "boolean":
                                booleans[prop] = value;
                                break;
                            case "string":
                                strings[prop] = value;
                                break;
                            case "number":
                                numbers[prop] = value;
                                break;
                            case "object":
                                if(Array.isArray(value)) {
                                    arrays[prop] = value;
                                } else if(value instanceof jQuery) {
                                    jqueries[prop] = value;
                                } else {
                                    objects[prop] = value;
                                }
                                break;
                            default:
                                others[prop] = value;
                        }
                    }
                    console.log('_______________________ BOOLEANS');
                    console.debug(booleans);
                    console.log('_______________________ STRINGS');
                    console.debug(strings);
                    console.log('_______________________ NUMBERS');
                    console.debug(numbers);
                    console.log('_______________________ ARRAYS');
                    console.debug(arrays);
                    console.log('_______________________ JQUERY OBJECTS');
                    console.debug(jqueries);
                    console.log('_______________________ OTHER OBJECTS');
                    console.debug(objects);
                    console.log('_______________________ OTHERS');
                    console.debug(others);
                    console.log('_______________________');
                }
            }

        };

        myob = jQuery.extend(
            myob,
            options
        );

        this.each(
            function(i, el) {
                myob.init(holderNumber);
                holderNumber++;
            }
        );

        // Expose public API
        return {
            getVar: function( variableName ) {
                if ( myob.hasOwnProperty(variableName)) {
                    return myob[variableName];
                }
            },
            setVar: function(variableName, value) {
                myob[variableName] = value;
                return this;
            },
            reloadCurrentPage: function(pageNumber) {
                myob.reloadCurrentPage();
                return this;
            },
            gotoPage: function(pageNumber) {
                myob.gotoPage(pageNumber);
                return this;
            },
            reloadCurrentSelection: function() {
                myob.gotoPage(0, true);
                return this;
            },
            updateDataDictionary: function(category, rowID, oldValue, newValue){
                myob.replaceOptionInCategory(category, oldValue, newValue);
                myob.replaceRowValue(category, rowID, newValue);
                return this;
            },
            updateMatchingRowsInDataDictionary: function(category, newValue){
                myob.updateMatchingRowsInDataDictionary(category, newValue);
                return this;
            },
            resetAll: function()
            {
                myob.resetAll();
                return this;
            }
        };
    }
}( jQuery ));



String.prototype.raw2safe = function(){
    var tmp = document.createElement("DIV");
    tmp.innerHTML = this;
    var v = tmp.textContent || tmp.innerText || "";
    return v.trim();
    // return this.replace(/[^a-z0-9*._\-,\s]/gi, " ");
}


/**
 * source: http://stackoverflow.com/questions/7753448/how-do-i-escape-quotes-in-html-attribute-values
 * the methods below make sure that the values are safe for html attribute values ...
 */

String.prototype.raw2attr = function(){
    return ('' + this) /* Forces the conversion to string. */
            .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
            .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            /*
            You may add other replacements here for HTML only
            (but it's not necessary).
            Or for XML, only if the named entities are defined in its DTD.
            */
            .replace(/\r\n/g, '&#13;') /* Must be before the next replacement. */
            .replace(/[\r\n]/g, '&#13;');
};

String.prototype.attr2raw = function(){
    /*
    Note: this can be implemented more efficiently by a loop searching for
    ampersands, from start to end of ssource string, and parsing the
    character(s) found immediately after after the ampersand.
    */
    var s = ('' + this); /* Forces the conversion to string type. */
    /*
    You may optionally start by detecting CDATA sections (like
    `<![CDATA[` ... `]]>`), whose contents must not be reparsed by the
    following replacements, but separated, filtered out of the CDATA
    delimiters, and then concatenated into an output buffer.
    The following replacements are only for sections of source text
    found *outside* such CDATA sections, that will be concatenated
    in the output buffer only after all the following replacements and
    security checkings.

    This will require a loop starting here.

    The following code is only for the alternate sections that are
    not within the detected CDATA sections.
    Decode by reversing the initial order of replacements.
    */
    s = s
            .replace(/\r\n/g, '\n') /* To do before the next replacement. */
            .replace(/[\r\n]/, '\n')
            .replace(/&#13;&#10;/g, '\n') /* These 3 replacements keep whitespaces. */
            .replace(/&#1[03];/g, '\n')
            .replace(/&#9;/g, '\t')
            .replace(/&gt;/g, '>') /* The 4 other predefined entities required. */
            .replace(/&lt;/g, '<')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            ;
    /*
    You may add other replacements here for predefined HTML entities only
    (but it's not necessary). Or for XML, only if the named entities are
    defined in *your* assumed DTD.
    But you can add these replacements only if these entities will *not*
    be replaced by a string value containing *any* ampersand character.
    Do not decode the '&amp;' sequence here !

    If you choose to support more numeric character entities, their
    decoded numeric value *must* be assigned characters or unassigned
    Unicode code points, but *not* surrogates or assigned non-characters,
    and *not* most C0 and C1 controls (except a few ones that are valid
    in HTML/XML text elements and attribute values: TAB, LF, CR, and
    NL='\x85').

    If you find valid Unicode code points that are invalid characters
    for XML/HTML, this function *must* reject the source string as
    invalid and throw an exception.

    In addition, the four possible representations of newlines (CR, LF,
    CR+LF, or NL) *must* be decoded only as if they were '\n' (U+000A).

    See the XML/HTML reference specifications !
    Required check for security! */
    var found = /&[^;]*;?/.match(s);
    if (found.length >0 && found[0] !== '&amp;')
            throw 'unsafe entity found in the attribute literal content';
     /* This MUST be the last replacement. */
    s = s.replace(/&amp;/g, '&');
    /*
    The loop needed to support CDATA sections will end here.
    This is where you'll concatenate the replaced sections (CDATA or
    not), if you have splitted the source string to detect and support
    these CDATA sections.

    Note that all backslashes found in CDATA sections do NOT have the
    semantic of escapes, and are *safe*.

    On the opposite, CDATA sections not properly terminated by a
    matching `]]>` section terminator are *unsafe*, and must be rejected
    before reaching this final point.
    */
    return s;
};


jQuery.fn.isOnScreen = function(){
    var viewport = {};
    viewport.top = jQuery(window).scrollTop();
    viewport.bottom = viewport.top + jQuery(window).height();
    var bounds = {};
    bounds.top = this.offset().top;
    bounds.bottom = bounds.top + this.outerHeight();
    return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
};


/*!
 * jquery.unevent.js 0.2
 * https://github.com/yckart/jquery.unevent.js
 * use jquery.on with timeout
 *
 * Copyright (c) 2013 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/07/26
**/
;(function ($) {
    var on = $.fn.on, timer;
    $.fn.delayedOn = function () {
        var args = Array.apply(null, arguments);
        var last = args[args.length - 1];
        //there is no delay
        if (isNaN(last) || (last === 1 && args.pop())) {
            return on.apply(this, args);
        }
        //get delay
        var delay = args.pop();
        var fn = args.pop();
        //add function
        args.push(
            function () {
                var self = this, params = arguments;
                window.clearTimeout(timer);
                timer = setTimeout(
                    function () {
                        fn.apply(self, params);
                    },
                    delay
                );
            }
        );

        return on.apply(this, args);
    };
}(jQuery));
