if(typeof window.JSURL === 'undefined') {
    var JSURL = require('jsurl');
}
if(typeof window.doT === 'undefined') {
    var doT = require('dot');
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
             * turn on to see what is going on in console
             * @type {boolean}
             */
            profile: false,

            /**
             * set to true if we use a templateRow
             * and rowRawData
             * @type {Boolean}
             */
            useJSON: false,

            /**
             * the raw json object per row ... you need to provide this of the useJSON
             * way of running this...
             *
             * @type {null|object}
             */
            rowRawData: null,

            /**
             * A list of keys for categories
             * categories can be provided with SHORT keys
             * so that the rowRawData can be shorter!
             * This object is for translations to proper keys
             * @type {null|object}
             */
            rawDataFieldKey: null,

            /**
             *
             * @type {string}
             */
            templateRow: '',

            /**
             *
             * @type {function}
             */
            templateRowCompiled: null,

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
             * you need this for saving the favourites.
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
             * This is a fixed header outside of the table filter sort itself.
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
             startWithOpenFilter: false,

            /**
             * used for releasing
             * @type {boolean}
             */
            millisecondsBetweenActionsShort: 20,

            /**
             * used for setting input updates, scroll updates, etc...
             * @type {boolean}
             */
            millisecondsBetweenActionsLong: 300,

            /**
             * order matters ...!
             * object is left out, as is array
             * @type {array}
             */
            validDataTypes: ['date', 'number', 'boolean', 'string'],

            /**
             * if we have more than the rows specified then we do not search for identicals
             * @type {integer}
             */
            maximumRowsForHideIdentical: 5000,

            /**
             * categories to be included in filter ...
             * include overrules exclude
             * this variables also sets the order in which the fields appear
             * in the filter ...
             * @type {array}
             */
            includeInFilter:[],

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
             * the rows as HTML
             * if we use JSON then this is the template row
             * if we do not use JSON then this is a jQuery object of all rows
             * @type {jQuery}
             */
            myRows: null,

            /**
             * [myRows description]
             * @type {jQuery}
             */
            myFloatingTable: null,





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
             *    Label: 'Field A'
             *    CanFilter: true
             *    CanSort: false
             *    DataType: number | string | date | boolean | object
             *    Options: [A,B,C]
             *    Values: {RowID1: [A], [RowID2]: [B], 3: RowID: [C]}
             *    IsEditable: false
             * MyFieldB:
             *    Label: 'Field Bee'
             *    CanFilter: true
             *    CanSort: false
             *    DataType: number | string | date | boolean | object
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
             * @type {boolean|null}
             */
            fixedTableHeaderIsOn: null,

            /**
             *
             * @type {boolean}
             */
            hasKeywordSearch: true,

            /**
             * Filter Fields that are completed based on Keywords...
             *
             * e.g. if the Filter Field = Tag and the user enters a keyword
             * that matches a Tag then the keyword is used as a Tag filter
             * @type {array}
             */
            keywordToFilterFieldArray: [],

            /**
             * can favourites be selected by user?
             * if not set, it will be set by checking HTML
             * @type {boolean}
             */
            hasFavourites: null,

            /**
             * are their form elements the user can edit
             * and filter with ...
             * @type {boolean}
             */
            hasFormElements: false,

            /**
             * is there a place to save it to?
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
            visibleRowCount: 10,


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
            visibleRowCountSelector: ".total-showing-row-number select",

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
                myob.myTableHolder.addClass(myob.loadingClass);

                myob.setHTMLAndTemplateRow();
                myob.setRowsWithDetails(true);
                myob.whatIsIncluded();

                //get the rows
                if(myob.myRowsTotalCount > 0){

                    if(typeof myob.initFX1 === 'function') {
                        myob.initFX1();
                    }
                    myob.myTableHolder.find(myob.matchRowCountSelector).html('...');

                    //we reload DOM here to show loading ...
                    window.setTimeout(
                        function() {

                            // COLLECT AND FIX
                            myob.turnHTMLIntoJSON();
                            // what needs to be done

                            //check data types ...
                            myob.dataSampling();

                            //collect filter items
                            myob.filterItemCollector();

                            //finalise sort data in dictionary
                            myob.dataDictionaryCollector();

                            //look for cols that are the same
                            myob.hideIdenticalCols();

                            //MASSAGE DATA AND FIND SORT

                            //find defaultSort
                            myob.findDefaultSort();

                            //build floating header after we have finished cols
                            myob.buildFloatingHeaderTable()

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
                            myob.retrieveDataFromServer();

                            //we are now ready!
                            myob.myTableHolder.removeClass(myob.loadingClass);

                            //set table width
                            jQuery('body').scroll();

                            if(typeof myob.initFX2 === 'function') {
                                myob.initFX2();
                            }
                            myob.canPushState = true;
                            if(myob.startWithOpenFilter) {
                                window.setTimeout(
                                    function() {
                                        myob.myFilterFormHolder.find('.' + myob.openAndCloseFilterFormClass).first().click();
                                    },
                                    300
                                );
                            }
                            //ADD SCROLL AND OTHER STUFF ...
                            window.setTimeout(
                                function() {
                                    myob.scrollToTopAtPageOpening = true;
                                },
                                1000
                            );
                        },
                        myob.millisecondsBetweenActionsShort
                    );
                } else {
                    myob.myTableHolder.removeClass(myob.loadingClass);
                }
            },

            setHTMLAndTemplateRow: function()
            {
                myob.profileStarter('setHTMLAndTemplateRow');
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
                            myob.buildTemplateRow();
                        }
                    }
                }
                myob.myTable.css('table-layout', 'fixed');
                //base URL
                myob.baseURL = location.protocol + '//' + location.host + location.pathname + location.search;
                myob.profileEnder('setHTMLAndTemplateRow');
            },


            buildFloatingHeaderTable: function()
            {
                myob.profileStarter('buildFloatingHeaderTable');
                myob.myFloatingTable = myob.myTable.clone();
                myob.myFloatingTable.appendTo(myob.myTableHolder);
                myob.myFloatingTable.addClass("floating-table");
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
                myob.profileEnder('setRows');
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
                                el = jQuery(el);
                                if(findMyRowsSorted) {
                                    var rowID = el.attr('id');
                                    myob.myRowsSorted.push(rowID);
                                }
                                if(hideAll === true) {
                                    el.addClass(myob.hideClass).removeClass(myob.showClass);
                                }
                            }
                        );
                    }
                }
                if(myob.myRowsTotalCount === 0) {
                      myob.myRowsTotalCount = myob.myRowsSorted.length;
                }
                myob.profileEnder('setRowsWithDetails');
            },


            whatIsIncluded: function()
            {
                //are we saving favourites?
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

                //also check favourites:
                if(myob.hasFavourites === null) {
                    myob.hasFavourites = myob.myRows.find(myob.favouriteLinkSelector).length > 0 ? true : false;
                }

                if(myob.hasKeywordSearch) {
                    myob.dataDictionaryBuildCategory('Keyword');
                }

                if(myob.hasFavourites) {
                    myob.dataDictionaryBuildCategory('Favourites');
                }

            },

            /**
             * retrieve raw data from HTML for JSON
             * @return {[type]}
             */
            turnHTMLIntoJSON: function()
            {
                myob.profileStarter('turnHTMLIntoJSON');
                if(myob.useJSON) {
                    //nothing to do
                } else {
                    myob.setRows();
                    myob.rowRawData = {};
                    myob.myRows.each(
                        function(i, row) {
                            var row = jQuery(row);
                            var rowID = row.attr('id');
                            if(typeof rowID === 'string' && rowID.length > 0) {
                                //do nothing
                            } else {
                                rowID = 'tfs-row-'+i;
                                row.attr('id', rowID);
                            }
                            myob.rowRawData[rowID] = {'ID': rowID};
                            row.find('[' + myob.filterItemAttribute + ']').each(
                                function(j, el) {
                                    el = jQuery(el);
                                    value = myob.findValueOfObject(el);
                                    category = el.attr(myob.filterItemAttribute);
                                    myob.dataDictionaryBuildCategory(category);
                                    if(value.length > 0) {
                                        if(typeof myob.rowRawData[rowID][category] === 'undefined') {
                                            myob.rowRawData[rowID][category] = value;
                                        } else if(Array.isArray(myob.rowRawData[rowID][category]) === false) {
                                            myob.rowRawData[rowID][category] = [myob.rowRawData[rowID][category]];
                                            myob.rowRawData[rowID][category].push(value)
                                        }

                                    }
                                }
                            );
                        }
                    );
                }

                myob.profileEnder('turnHTMLIntoJSON');
            },

            /**
             * we turn the html into JSON
             */
            dataSampling: function()
            {
                myob.profileStarter('dataSampling');
                var isFirstRow = true;
                //work through rowRawData
                for(rowID in myob.rowRawData) {
                    if(myob.rowRawData.hasOwnProperty(rowID)) {
                        //data sampling!
                        for(category in myob.rowRawData[rowID]) {
                            if(myob.rowRawData[rowID].hasOwnProperty(category)) {

                                //switch over to actual keys
                                if(myob.rawDataFieldKey !== null) {
                                    if(myob.rawDataFieldKey.hasOwnProperty(category)) {
                                        var realCategory = myob.rawDataFieldKey[category];
                                        myob.rowRawData[rowID][realCategory] = myob.rowRawData[rowID][category];
                                        delete myob.rowRawData[rowID][category];
                                        category = realCategory;
                                        //switch
                                    }
                                }

                                //start building the category
                                if(isFirstRow === true) {
                                    myob.dataDictionaryBuildCategory(category);
                                }
                                var rawValue = myob.rowRawData[rowID][category];
                                if(myob.dataDictionary[category]['IsEditable'] === null) {
                                    if(myob.useJSON) {
                                        var firstRow = jQuery(myob.templateRow);
                                    } else {
                                        var firstRow = myob.myTableBody.find('tr').first();
                                    }
                                    var elementSelectorInner = '[' + myob.filterItemAttribute + '="'+category+'"]';
                                    var elementSelector = 'input'+elementSelectorInner+', select'+elementSelectorInner+', textarea'+elementSelectorInner;
                                    myob.dataDictionary[category]['IsEditable'] = firstRow.find(elementSelector).length > 0 ? true : false;
                                }
                                if(myob.dataDictionary[category]['DataType'] === '') {
                                    if(category === 'keyword') {
                                        myob.dataDictionary[category]['DataType'] = 'string';
                                        myob.dataDictionary[category]['CanFilter'] = true;
                                        myob.dataDictionary[category]['CanSort'] = false;
                                        myob.dataDictionary[category]['IsEditable'] = false;
                                    } else if(category === 'favourites') {
                                        myob.dataDictionary[category]['DataType'] = 'boolean';
                                        myob.dataDictionary[category]['CanFilter'] = true;
                                    }
                                    stillLookingForTypes = true;
                                    //if it is an array then we set a few things and recalculate
                                    while(Array.isArray(rawValue)) {
                                        rawValue = rawValue[0];
                                        myob.dataDictionary[category]['CanSort'] = false;
                                    }
                                    var type = myob.findDataTypeOfValue(rawValue);
                                    if(type === 'object') {
                                        myob.dataDictionary[category]['CanFilter'] = false;
                                        myob.dataDictionary[category]['CanSort'] = false;
                                        myob.dataDictionary[category]['IsEditable'] = false;
                                    }
                                    //we got to be sure it is not an array...
                                    if(type === 'array') {
                                        console.log('ERROR: object can not be an array '+type+'');
                                        console.log(rawValue);
                                    }
                                    myob.dataDictionary[category]['DataType'] = type;

                                }
                            }
                        }
                        isFirstRow = false;
                    }
                }

                myob.profileEnder('dataSampling');
            },



            //===================================================================
            // SCRIPT SECTION: *** COLLECTORS
            //=================================================================


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
                for(rowID in myob.rowRawData) {
                    if(myob.rowRawData.hasOwnProperty(rowID)) {
                        var rowData = myob.rowRawData[rowID];
                        var keywordString = '';
                        for(category in rowData) {
                            if(rowData.hasOwnProperty(category)) {
                                myob.dataDictionaryBuildCategory(category);
                                var values = rowData[category];
                                //make sure it is an array
                                if(Array.isArray(values) === false) {
                                    values = [values];
                                }
                                for(var i = 0; i < values.length; i++) {
                                    //to do? clean value???
                                    var value = values[i];
                                    myob.addValueToRow(category, rowID, value);
                                    keywordString += ' '+myob.joinRecursively(value,' ').trim()+' ';
                                }
                            }
                        }
                        keywordString = keywordString.replace(/  +/g, ' ').trim();
                        myob.addValueToRow('Keyword', rowID, keywordString);
                    }
                }

                myob.profileEnder('filterItemCollector');
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

                        //can it be sorted?
                        if(typeof myob.dataDictionary[category]['CanSort'] === "undefined" || myob.dataDictionary[category]['CanSort'] === null) {
                            myob.dataDictionary[category]['CanSort'] = (sortLink.length > 0) ? true : false;
                        }

                        myob.dataDictionarySorter(category);

                        //can it be filtered?
                        if(typeof myob.dataDictionary[category]['CanFilter'] === "undefined" || myob.dataDictionary[category]['CanFilter'] === null) {
                            if(category === 'Keyword' || category === 'ID') {
                                myob.dataDictionary[category]['CanFilter']  = false;
                            } else {
                                //if includeInFilter has items and category is not one of them, disable
                                if(myob.includeInFilter.length > 0 && myob.includeInFilter.indexOf(category) === -1) {
                                    myob.dataDictionary[category]['CanFilter'] = false;
                                }
                                //if explicit exclude
                                else if(myob.excludeFromFilter.length > 0 && myob.excludeFromFilter.indexOf(category) > -1) {
                                    myob.dataDictionary[category]['CanFilter'] = false;
                                //set depending on data type etc
                                } else {
                                    if(sortLink && sortLink.attr('data-sort-only') == 'true') {
                                        myob.dataDictionary[category]['CanFilter'] = false;
                                    } else {
                                        myob.dataDictionary[category]['CanFilter'] = myob.dataDictionary[category]['Options'].length > 1 || myob.dataDictionary[category]['IsEditable'] ? true : false;
                                    }
                                }
                            }
                        }

                    }
                );
                //if includeInFilter empty, fill with dataDict CanFilter
                if(myob.includeInFilter.length === 0) {
                    myob.includeInFilter = Object.keys(myob.dataDictionary).filter(category => myob.dataDictionary[category]['CanFilter'])
                }
                myob.profileEnder('dataDictionaryCollector');
            },


            dataDictionaryBuildCategory: function(category)
            {
                if(typeof myob.dataDictionary[category] === "undefined") {
                    myob.dataDictionary[category] = {}
                }
                if(typeof myob.dataDictionary[category]['Built'] === 'undefined') {
                    if(typeof myob.dataDictionary[category]['Label'] === "undefined") {
                        myob.dataDictionary[category]['Label'] = myob.replaceAll(category, '-', ' ');;
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
                    myob.dataDictionary[category]['Built'] = true;
                }
            },

            /**
             * updates the dataDictionary for all rows
             * that are currently marked as matching!
             * @param  {string} category
             * @param  {mixed} newValue
             */
            updateMatchingRowsInDataDictionary: function(category, newValue)
            {
                for(var i = 0; i < myob.myRowsMatching.length; i++) {
                    var rowID = myob.myRowsMatching[i];
                    myob.replaceRowValue(category, rowID, newValue);
                }
            },


            setCategoryLabel: function(category, label)
            {
                myob.dataDictionary[category]['Label'] = label;

                return myob;
            },

            getCategoryLabel: function(category)
            {
                //we return the straight category here for things like Keywords ...
                if(typeof myob.dataDictionary[category] === 'undefined'){
                    return category;
                }
                myob.dataDictionaryBuildCategory(category);
                return myob.dataDictionary[category]['Label'];
            },

            /**
             * replace ALL the values in a row
             * @param string  category
             * @param string  rowID
             * @param mixed   newValue
             */
            replaceRowValue: function(category, rowID, newValue)
            {
                //set up category
                myob.dataDictionaryBuildCategory(category);

                var oldValue = myob.dataDictionary[category]['Values'][rowID];
                //myob.removeOptionFromCategory(category, oldValue);

                //reset values
                if(Array.isArray(oldValue)) {
                    myob.dataDictionary[category]['Values'][rowID].length = 0;
                }
                myob.dataDictionary[category]['Values'][rowID] = [];

                //add value back in
                myob.addValueToRow(category, rowID, newValue);

            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param string rowID
             * @param mixed oldValue
             * @param mixed newValue
             */
            replaceValueInRow: function(category, rowID, oldValue, newValue)
            {

                myob.removeValueFromRow(category, rowID, oldValue)
                myob.addValueToRow(category, rowID, newValue);

                //standardise empty ones ...
                myob.standardiseEmptyRows(category, rowID);
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param string rowID
             * @param mixed value
             */
            addValueToRow: function(category, rowID, value)
            {
                //set up category
                myob.dataDictionaryBuildCategory(category);

                if(Array.isArray(myob.dataDictionary[category]['Values'][rowID]) === false) {
                    myob.dataDictionary[category]['Values'][rowID] = [];
                }
                myob.dataDictionary[category]['Values'][rowID].push(value);
                myob.addOptionToCategory(category, value);

                //standardise empty ones ...
                myob.standardiseEmptyRows(category, rowID);

            },

            /**
             * remove one value from a row (it may have other values ...)
             * @param string category
             * @param mixed value
             */
            removeValueFromRow: function(category, rowID, value)
            {
                //set up category
                myob.dataDictionaryBuildCategory(category);

                if(myob.dataDictionary[category]['Values'][rowID] === false) {
                    return;
                }
                if(value !== Object(value)) {
                    //myob.removeOptionFromCategory(category, value);
                    var index = myob.dataDictionary[category]['Values'][rowID].indexOf(value);
                    if(index === -1) {
                        //already done
                        return;
                    }
                    myob.dataDictionary[category]['Values'][rowID].splice(index, 1);
                } else {
                    console.log('ERROR: can only remove primitive values from rows!')
                }

                myob.standardiseEmptyRows(category, rowID);
            },


            standardiseEmptyRows: function(category, rowID)
            {
                //standardise empty ones ...
                if(myob.isEmptyValue(myob.dataDictionary[category]['Values'][rowID])) {
                    var standardEmptyValue = myob.validateValue(category, myob.dataDictionary[category]['Values'][rowID]);
                    myob.dataDictionary[category]['Values'][rowID] = standardEmptyValue;
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
                //myob.removeOptionFromCategory(category, oldValue);
                myob.addOptionToCategory(category, newValue);
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param mixed value
             */
            addOptionToCategory: function(category, value)
            {
                value = myob.validateValue(category, value);
                if(myob.isEmptyValue(value)) {
                    return;
                }
                //is this right or should we set the option as an Array?
                if(Array.isArray(value)) {
                    for(var i = 0; i < value.length; i++) {
                        return myob.addOptionToCategory(category, value[i]);
                    }
                } else if(typeof value === 'object') {
                    //we do NOT add objects!!!
                    return;
                }
                if(myob.dataDictionary[category]['Options'].indexOf(value) === -1) {
                    //push value
                    myob.dataDictionary[category]['Options'].push(value);
                }
            },

            /**
             * check if Option has been added to category and add if needed...
             * @param string category
             * @param mixed value
             */
            removeOptionFromCategory: function(category, value)
            {
                value = myob.validateValue(category, value);
                if(myob.isEmptyValue(value)) {
                    return;
                }
                //is this right or should we set the option as an Array?
                if(Array.isArray(value)) {
                    for(var i = 0; i < value.length; i++) {
                        return myob.removeOptionFromCategory(category, value[i]);
                    }
                } else if(typeof value === 'object') {
                    //we do NOT add objects!!!
                    return;
                }
                var index = myob.dataDictionary[category]['Options'].indexOf(value);
                if(index > -1) {
                    myob.dataDictionary[category]['Options'].splice(index, 1);
                }
            },

            /**
             *
             * @param  {mixed} value    any value you like
             * @return {string}         returns any of these options
             *                          array|object|date|number|string|'' (not decided)
             */
            findDataTypeOfValue: function(value)
            {
                if(myob.isEmptyValue(value)) {
                    return '';
                }

                //complex items are not
                if (Array.isArray(value)) {
                    return 'array';
                //objects
                } else if (typeof value === 'object') {
                    return 'object';
                //values
                } else {
                    if(value === true) {
                        return 'boolean';
                    } else if (isNaN(value)) {
                        return 'string';
                    } else {
                        return 'number';
                    }
                }
                //we are NOT SURE
                return '';
                //check number
            },

            /**
             * is this an empty variable?
             * @param  {mixed} value
             * @return {boolean}
             */
            isEmptyValue: function(value)
            {
                //should be fast if only one needs to match
                //start with easiest!
                if(
                    typeof value === 'undefined' ||
                    value === '' ||
                    value === false ||
                    value === 0 ||
                    value === '0' ||
                    value === null ||
                    (Array.isArray(value)) && value.length === 0 ||
                    (typeof value === 'object' && JSON.stringify(value) === JSON.stringify({}))
                ) {
                    return true;
                } else {
                    return false;
                }
            },



            /**
             * makes sure that the values are fit for what the data dictionary tells us.
             * @param  {string}  category       category in data dictionary
             * @param  {mixed}   value          value supplied
             * @param  {string}  forcedDataType specify the data type rather than relying on the category.
             *
             * @return {mixed}
             */
            validateValue: function(category, value, forcedDataType)
            {
                if(typeof forcedDataType === 'undefined') {
                    forcedDataType = myob.dataDictionary[category]['DataType'];
                }
                //reset all empty values - we are going to ignore those ...
                if(myob.isEmptyValue(value)) {
                    switch(forcedDataType) {
                        case 'date':
                            return '';
                            break;
                        case 'number':
                            return 0;
                            break;
                        case 'boolean':
                            return false;
                            break;
                        case 'object':
                            return null;
                            break;
                        case 'string':
                        case '':
                            return '';
                            break;
                        default:
                            console.log('ERROR: unknown data type.'+forcedDataType+' for '+value);
                    }
                }
                //arrays
                else if (Array.isArray(value)) {
                    for(var i = 0; i < value.length; i++) {
                        value[i] = myob.validateValue(category, value[i], forcedDataType);
                    }
                    return value;
                //objects
                } else if (typeof value === 'object') {
                    return value;
                //values
                } else {
                    switch(forcedDataType) {
                        case 'date':
                            if(myob.isDate(value) === false) {
                                value = '';
                            }
                            break;
                        case 'number':
                            if(isNaN(value)) {
                                value = parseFloat(value.replace(/[^0-9.]/g,'')) - 0;
                                if(isNaN(value)) {
                                    value = 0;
                                }
                            }
                            break;
                        case 'boolean':
                            if(value === true || value === false) {
                                //do nothing
                            } else {
                                value = false;
                            }
                            break;
                        case 'string':
                            if(typeof value !== 'string') {
                                value = '';
                            }
                        case '':
                            value = (String(value)+'').trim();
                            break;
                        default:
                            console.log('ERROR: unknown data type.'+forcedDataType+' for '+value);
                    }
                }
                return value;
            },

            /**
             * hide the cells that are all the same
             * and add to common content holder
             */
            hideIdenticalCols: function()
            {
                myob.profileStarter('hideIdenticalCols');
                if(myob.myRowsTotalCount > myob.maximumRowsForHideIdentical) {
                    myob.myTableHolder.find('.' + myob.commonContentHolderClass).remove();
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
                                                commonContent += "<li class=\"tfs-filter-column\"><strong>"+myob.getCategoryLabel(category) + ":</strong> <span>" + value + "</span></li>";
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
                                                        myob.buildTemplateRow();
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
                if(commonContentExists && commonContent.length > 10){
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
                if(myob.hasFixedTableHeader) {
                    jQuery(window).delayedOn(
                        "load resize",
                        function(e) {
                            //now we need to reset the table header
                            myob.fixedTableHeaderIsOn = null;
                        },
                        myob.millisecondsBetweenActionsShort
                    );
                    jQuery(window).delayedOn(
                        "load scroll resize",
                        function(e) {
                            //now we need to reset the table header
                            myob.fixTableHeader();
                        },
                        myob.millisecondsBetweenActionsShort
                    );
                }
                myob.profileEnder('fixTableHeaderListener');
            },

            /**
             * set up filter listeners ...
             * open and close filter form, etc...
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
                            // // if currently has table header open, then immediate swap
                            // myob.fixedTableHeaderIsOn ? 0 : "fast",
                            function() {
                                //set the height of the filter form
                                myob.myTableHolder.toggleClass(myob.filterIsOpenClass);
                                if(myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                                    //filter is now open
                                    myob.scrollToTopOfHolder();
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
                            myob.millisecondsBetweenActionsShort
                        );
                    }
                );

                //set actual keyword field and trigger change
                myob.myFilterFormHolder.on(
                    'input paste change',
                    myob.quickKeywordFilterSelector,
                    function(e) {
                        var val = jQuery(this).val();
                        myob.myFilterFormInner.find('input[name="Keyword"]')
                            .val(val);
                        myob.runCurrentFilter();
                    }
                );

                //update faux keyword field
                myob.myFilterFormInner.on(
                    'input paste change',
                    'input[name="Keyword"]',
                    function(e) {
                        var val = jQuery(this).val();
                        myob.myFilterFormHolder
                            .find(myob.quickKeywordFilterSelector)
                            .val(val);
                        myob.runCurrentFilter();
                    }
                );

                myob.myFilterFormInner.on(
                    'click',
                    '.' +  myob.inverseSelectionFilterClass,
                    function (e, target) {
                        jQuery(this).toggleClass('flipped');
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
                                        window.localStorage.setItem(
                                            'TFS_visibleRowCount',
                                            myob.visibleRowCount
                                        );
                                        // if(typeof Cookies !== 'undefined') {
                                        //     Cookies.set('visibleRowCount', myob.visibleRowCount, {path: myob.baseURL, expires: 180});
                                        // }
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
                        myob.retrieveDataFromServer();
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
                        myob.addDirectlyToFilter(category, filterValue);
                        myob.runCurrentFilter();

                        return false;
                    }
                );
            },

            addDirectlyToFilter: function(category, filterValue, alwaysTurnOn)
            {
                if(typeof alwaysTurnOn === 'boolean' && alwaysTurnOn === true) {
                    //do nothing
                } else {
                    alwaysTurnOn = false;
                }
                var filterHolder = myob.myFilterFormInner
                    .find('.'+myob.filterGroupClass+'[data-to-filter="'+category+'"]');
                var fieldType = filterHolder.attr('field-type');
                var filterToTriger = filterHolder
                    .find('input[value="'+ filterValue + '"].checkbox')
                    .first();
                if(filterToTriger && filterToTriger.length > 0) {
                    if(filterToTriger.is(':checkbox')){
                        if(filterToTriger.prop('checked') === true && alwaysTurnOn === false){
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
                            if(typeof id === 'string' && id !== '') {
                                myob.toggleIdInFavourites(id);
                                myob.checkAndSaveFavourites();
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

                            //remove if already set
                            if(filterToTriger.prop('checked') === true){
                                filterToTriger.prop('checked', false).trigger('change');
                            }
                            else {
                                //add it not set.
                                myob.myFilterFormHolder.find('.' + myob.clearFilterClass + ' a').click();
                                var filterToTriger = myob.myFilterFormInner.find('input[name="Favourites"]').first();
                                filterToTriger.prop('checked', true).trigger('change');
                            }
                        }
                    );
                }
            },

            checkAndSaveFavourites: function()
            {
                //remove ones that are not relevant
                for(var i = 0; i < myob.mfv.length; i++) {
                    if(jQuery.inArray(myob.mfv[i], myob.myRowsSorted) === -1) {
                        myob.mfv.splice(i, 1);
                    }
                }
                window.localStorage.setItem(
                    'TFS_mfv',
                    myob.mfv
                );
                // if(typeof Cookies !== 'undefined') {
                //     // Cookies.set('mfv', , {path: myob.baseURL, expires: 180});
                // }
            },

            toggleIdInFavourites: function(id)
            {
                var index = myob.mfv.indexOf(id);
                if (index === -1) {
                    myob.mfv.push(id);
                } else {
                    myob.mfv.splice(index, 1);
                }
            },

            /**
             * opens modal with data ...
             * data options are
             * - favourites
             * - filter
             * data is sent as the data get parameter, separated by &
             * @return {[type]}
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
                            var isFilter = true;
                            var isSave = false;
                            var parentPageID = myob.filtersParentPageID;
                            var variables = myob.filterAndSortVariables;
                            if(myParent.hasClass('filters')) {
                                //do nothing
                            }
                            else if(myParent.hasClass('favourites')) {
                                parentPageID = myob.favouritesParentPageID;
                                variables = myob.favouritesVariables;
                                isFilter = false;
                            } else {
                                isFilter = false;
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
                                                myob.retrieveDataFromServer();
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
                    var tabIndex = 0;
                    var awesompleteFields = [];
                    var content  = '<form class="'+myob.filterOptionsHolderClass+'">';
                    for(var categoryIndex = 0; categoryIndex < myob.includeInFilter.length; categoryIndex++) {
                        var category = myob.includeInFilter[categoryIndex];
                        if(myob.dataDictionary[category]['CanFilter']) {
                            tabIndex = categoryIndex + 2;
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
                    //add favourites
                    if(myob.hasFavourites) {
                        content += myob.makeSectionHeaderForForm(
                            'Favourites',
                            'Favourites'
                        );
                        content += myob.makeFieldForForm('favourites', 'Favourites', tabIndex, 0);
                        content += myob.makeSectionFooterForForm();
                        tabIndex++;
                    }
                    if(myob.hasKeywordSearch) {
                        content += myob.makeSectionHeaderForForm(
                            'Keyword',
                            'Keyword'
                        );
                        content += myob.makeFieldForForm('keyword', 'Keyword', tabIndex, 0);
                        content += myob.makeSectionFooterForForm('keyword');
                    }
                    content += '</form>';

                    //FINALISE!
                    myob.myFilterFormInner.html(content);

                    if(myob.hasKeywordSearch) {
                        var keywordVal = myob.myFilterFormInner.find('input[name="Keyword"]').val();
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
                                    return Awesomplete.FILTER_CONTAINS(text, input) && Awesomplete.blackList.indexOf(text.value) === -1;
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
                        input.addEventListener(
                            "awesomplete-close",
                            function(e) {
                                if(e.reason === 'nomatches') {
                                    var val = jQuery(e.srcElement).val();
                                    //remove last character
                                    jQuery(e.srcElement).val(val.slice(0,-1));
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
                html += '<label class="'+myob.groupLabelClass+'">' + myob.getCategoryLabel(category) + '</label>';
                html += '<ul>';
                return html;
            },

            /**
             * creates the filter form
             * @param  {string} type
             * @param  {string} category
             * @param  {int} tabIndex
             * @param  {string} valueIndex
             *
             * @return {string}            HTML
             */
            makeFieldForForm: function(type, category, tabIndex, valueIndex)
            {
                if(valueIndex === null) {
                    return;
                }
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
                            var placeholder = '';
                            var currentValueForForm = '';
                            var additionToField = '';
                            if(type === 'keyword') {
                                placeholder = 'separate phrases by comma';
                                var extraClass = 'keyword';
                                if(typeof myob.cfi[category] !== 'undefined') {
                                    if(typeof myob.cfi[category][0] !== 'undefined') {
                                        for(var i = 0; i < myob.cfi[category].length; i++) {
                                            currentValueForForm = myob.cfi[category][i].vtm.raw2attr();
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
                                    '<input class="text ' + extraClass + '" type="text" name="'+category.raw2attr()+'" id="'+valueID+'" tabindex="'+tabIndex+'" value="'+currentValueForForm+'" placeholder="'+placeholder.raw2attr()+'" />' +
                                    additionToField +
                                    endString;
                        case 'checkbox':
                            var checked = '';
                            if(typeof myob.cfi[category] !== 'undefined') {
                                for(var i = 0; i < myob.cfi[category].length; i++) {
                                    if(cleanValue === myob.cfi[category][i].vtm) {
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

            makeSectionFooterForForm: function(type)
            {
                var html = '';
                if(typeof type === 'string') {
                    switch(type) {
                        case 'keyword':
                    }
                }
                html += '</ul></div>';
                return html;
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
                    myob.millisecondsBetweenActionsShort
                );
            },

            runCurrentSort: function()
            {
                myob.profileStarter('runCurrentSort');

                // clear endRowManipulation just because we are going to run it in the end again - anyway ...
                myob.windowTimeoutStoreSetter('endRowManipulation');

                myob.sfr = 0;
                myob.myTableHead.find(myob.sortLinkSelector)
                    .removeClass(myob.sortAscClass)
                    .removeClass(myob.sortDescClass);
                var myEl = myob.myTableHead.find(myob.sortLinkSelector+'[data-sort-field="'+myob.csr.sct+'"]').first();
                if(myEl && myEl.length > 0) {
                    myob.startRowManipulation();
                    var category = myob.csr.sct;
                    myob.dataDictionaryBuildCategory(category);
                    type = myob.dataDictionary[category]['DataType'];
                    var arr = [];
                    var rows = myob.dataDictionary[category]['Values'];
                    for (var rowID in rows) {
                        if (rows.hasOwnProperty(rowID)) {
                            var dataValue = rows[rowID][0];
                            dataValue = myob.validateValue(category, dataValue);
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
                        myob.millisecondsBetweenActionsShort
                    );
                }
                myob.profileEnder('runCurrentSort');
            },



            /**
             * QUESTION! how clean is VTM when it gets here - do we need to clean it?
             */
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
                            //do nothing
                        } else {
                            //we need to keep this for showing / hiding ...
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
                                        if(stillLookingForValue === true) {
                                            if(categoryToMatch === 'Favourites') {
                                                if(typeof rowID !== 'undefined' && rowID.length > 0) {
                                                    if(myob.mfv.indexOf(rowID) > -1) {
                                                        rowMatchesForFilterGroup = true;
                                                    }
                                                }
                                            } else {
                                                if(Array.isArray(myob.dataDictionary[categoryToMatch]['Values'][rowID])) {
                                                    var myTempValues = myob.dataDictionary[categoryToMatch]['Values'][rowID];
                                                    for(var myTempValuesCount = 0; myTempValuesCount < myTempValues.length; myTempValuesCount++) {
                                                        var rowValue = myTempValues[myTempValuesCount];
                                                        rowValue = myob.validateValue(categoryToMatch, rowValue);
                                                        if (categoryToMatch === 'Keyword') {
                                                            var vtm = searchObject['vtm'];
                                                            rowValue = rowValue.toLowerCase();
                                                            var keywords = vtm.split(' ');
                                                            var keywordMatches = true;
                                                            for(var k = 0; k < keywords.length; k++) {
                                                                var keyword = keywords[k].raw2safe().toLowerCase();
                                                                if(rowValue.indexOf(keyword) === -1) {
                                                                    keywordMatches = false;
                                                                    break;
                                                                }
                                                            }
                                                            if(keywordMatches === true) {
                                                                rowMatchesForFilterGroup = true;
                                                            }
                                                        } else {
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
                                                                default:
                                                                    rowValue = rowValue.raw2safe().toLowerCase();
                                                                    if(rowValue === searchObject['vtm']){
                                                                        rowMatchesForFilterGroup = true;
                                                                    }
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
                    myob.millisecondsBetweenActionsShort
                );
                myob.profileEnder('runCurrentFilter');
            },

            /**
             * switch to a different page
             * @param  {int} page
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
                        myob.millisecondsBetweenActionsShort
                    );
                }
                myob.profileEnder('gotoPage');
            },

            /**
             * switch to a different page
             * @param  {int} page
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
                    myob.millisecondsBetweenActionsShort
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
                     myob.scrollToTopAtPageOpening = true;
                 } else {
                     //fire scroll event in any case ...
                     window.scrollTo(window.scrollX, window.scrollY);
                 }
                 //we now allow scrolls
             },

            fixTableHeader: function()
            {
                myob.profileStarter('fixTableHeader');
                if(myob.hasFixedTableHeader) {
                    var showFixedHeader = false
                    var width = myob.myTableHead.width();
                    if(width > 100) {
                        myob.myFilterFormHolder.width(width);
                    }
                    if(myob.myTableHolder.isOnScreen()) {
                        //get basic data about scroll situation...
                        var tableOffset = myob.myTableBody.offset().top;
                        var offset = jQuery(window).scrollTop();
                        //show fixed header if the Page offset is greater than the table
                        //ie. the table is above the current scroll point
                        //ie. the table header is no longer visible
                        showFixedHeader = offset > tableOffset ? true: false;
                    }

                    //if we should show it but it has not been done yet ...
                    if(showFixedHeader === true && (myob.fixedTableHeaderIsOn === false || myob.fixedTableHeaderIsOn === null)) {
                        //remove the filter
                        myob.myTableHolder.removeClass(myob.filterIsOpenClass);
                        myob.myFilterFormInner.slideUp(0)

                        myob.myTableHolder.addClass(myob.fixedHeaderClass); //class for pos fixed

                        myob.fixedTableHeaderIsOn = true;
                        if(width > 100) {
                            myob.myFloatingTable.width(width)
                        }
                        // myob.myFloatingTable("thead").width(width)

                        var top = myob.myFilterFormHolder.outerHeight(true)-2;
                        myob.myFloatingTable.css('top', top); //set offset
                        myob.myTable.css('margin-top', top);
                    }
                    if(showFixedHeader === false && (myob.fixedTableHeaderIsOn === true || myob.fixedTableHeaderIsOn === null)) {
                        myob.fixedTableHeaderIsOn = false;
                        myob.myTableHolder.removeClass(myob.fixedHeaderClass);
                        myob.myTable.css('margin-top', 0);
                    }
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

                //myob.myTableHolder.find(myob.moreRowEntriesSelector).hide();

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
                        myob.millisecondsBetweenActionsLong
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


            buildTemplateRow: function()
            {
                myob.templateRow = myob.myTableBody.clone().html();
                myob.templateRowCompiled = doT.template(myob.templateRow);
                myob.myTableBody.empty();
            },

            buildRows: function()
            {
                myob.profileStarter('buildRows');
                var dd = myob.dataDictionary;
                var html = '';
                for(var i = 0; i < myob.myRowsVisible.length; i++) {
                    var rowData = {};
                    rowData.RowID = myob.myRowsVisible[i];
                    for(category in dd) {
                        if (dd.hasOwnProperty(category)) {
                            //category info
                            var ddc = dd[category]
                            var valueOrValues = ddc['Values'][rowData.RowID];
                            if(typeof valueOrValues !== 'undefined') {
                                rowData[category] = valueOrValues;
                            }
                        }
                    }
                    html += myob.templateRowCompiled(rowData);
                }
                if(html.length > 0) {

                    //replace HTML
                    myob.myTableBody.html(html);

                    //set inputs
                    var selectorPhrase = 'input['+myob.inputValueDataAttribute+'], select['+myob.inputValueDataAttribute+'], textarea['+myob.inputValueDataAttribute+']'
                    myob.myTableBody.find(selectorPhrase).each(
                        function(i, el) {
                            var el = jQuery(el);
                            var value = el.attr(myob.inputValueDataAttribute);
                            value = value.raw2safe();
                            jQuery(el).val(value);
                        }
                    );

                    //highlight favourites
                    for(var i = 0; i < myob['mfv'].length; i++) {
                        myob.myTableBody.find('#' + myob['mfv'][i]).addClass(myob.favouriteClass);
                    }
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
                        var filterDetails = myob.cfi[categoryToMatch];
                        var options = [];
                        for(var i = 0; i < filterDetails.length; i++) {
                            options.push(filterDetails[i]['vtm']);
                        }
                        myob.myTableBody.find('['+myob.filterItemAttribute+'="' + categoryToMatch + '"]').each(
                            function(i, el) {
                                var elValue = jQuery(el).text().toString().raw2safe().toLowerCase();
                                for(var i = 0; i < options.length; i++) {
                                    var option = options[i]
                                    if(elValue === option) {
                                        jQuery(el).addClass(myob.selectedFilterItem);
                                        break;
                                    }
                                }
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
                var filterValueArray = [];
                //reset
                myob.cfi = {};
                myob.myFilterFormHolder
                    .find(' .' + myob.filterGroupClass)
                    .each(
                        function(i, el){
                            var ivl = '';
                            var vtm = '';
                            var categoryHolder = jQuery(el);
                            var category = categoryHolder.attr('data-to-filter');
                            var fieldType = categoryHolder.attr('field-type').toLowerCase();
                            var vtms = [];
                            categoryHolder.find('input').each(
                                function(i, input) {
                                    input = jQuery(input);
                                    var val = input.val();
                                    var validatedVal = myob.validateValue(category, val);
                                    ivl = val.raw2safe();
                                    vtm = ivl.toLowerCase();
                                    var innerInputVal = '';
                                    var innerValueToMatch = '';
                                    switch(fieldType) {
                                        case 'keyword':
                                            if(vtm.length > 1) {
                                                vtm.replace(' OR ', ',');
                                                var filterValueArray = vtm.split(",");
                                                var j = 0;
                                                var len = filterValueArray.length;
                                                var tempVal = '';

                                                //split by OR
                                                for(j = 0; j < len; j++) {
                                                    var filterValueArrayItem = filterValueArray[j].trim();
                                                    if(filterValueArrayItem.length > 1) {
                                                        var originalFilterValueArrayItem = filterValueArrayItem;
                                                        // check for filter field mapping
                                                        if(Array.isArray(myob.keywordToFilterFieldArray) && myob.keywordToFilterFieldArray.length > 0) {
                                                            for(var x = 0; x <  myob.keywordToFilterFieldArray.length; x++) {
                                                                //avoid very small words as this could be annoying
                                                                if(filterValueArrayItem.length > 2) {
                                                                    var keywordFilterCategory = myob.keywordToFilterFieldArray[x];
                                                                    var options = myob.dataDictionary[keywordFilterCategory].Options;
                                                                    var index = options.indexOf(filterValueArrayItem);
                                                                    if(index > -1) {
                                                                        if(typeof myob.cfi[keywordFilterCategory] === "undefined") {
                                                                            myob.cfi[keywordFilterCategory] = [];
                                                                        }
                                                                        myob.cfi[keywordFilterCategory].push(
                                                                            {
                                                                                vtm: filterValueArrayItem,
                                                                                ivl: filterValueArrayItem
                                                                            }
                                                                        );

                                                                        //remove what has been matched!
                                                                        filterValueArrayItem = '';
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if(filterValueArrayItem.length > 1) {
                                                            innerInputVal = filterValueArrayItem;
                                                            innerValueToMatch = innerInputVal;
                                                            if(typeof myob.cfi[category] === "undefined") {
                                                                myob.cfi[category] = [];
                                                            }
                                                            myob.cfi[category].push(
                                                                {
                                                                    vtm: innerValueToMatch,
                                                                    ivl: innerInputVal
                                                                }
                                                            );
                                                        }
                                                        vtms.push(originalFilterValueArrayItem);
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
                                                        vtm: vtm,
                                                        ivl: ivl
                                                    }
                                                );
                                                vtms.push(vtm);
                                                myob.myTableHolder.addClass(myob.hasFavouritesInFilterClass);
                                            } else {
                                                myob.myTableHolder.removeClass(myob.hasFavouritesInFilterClass);
                                            }
                                            break;
                                        case 'date':
                                            if(validatedVal !== '') {
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = {};
                                                }
                                                vtms.push(input.attr('data-label') + validatedVal);
                                                myob.cfi[category][0][input.attr('data-dir')] = validatedVal;
                                            }
                                            break;
                                        case 'number':
                                            if(validatedVal !== 0 && validatedVal !== '') {
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = [];
                                                }
                                                if(typeof myob.cfi[category][0] === 'undefined') {
                                                    myob.cfi[category][0] = {};
                                                }
                                                vtms.push(input.attr('data-label') + validatedVal + ' ');
                                                myob.cfi[category][0][input.attr('data-dir')] = validatedVal;
                                            }
                                            break;
                                        case 'boolean':
                                            if(validatedVal === false || validatedVal === true) {
                                                if(typeof myob.cfi[category] === "undefined") {
                                                    myob.cfi[category] = {};
                                                }
                                                vtms.push(input.attr('data-label') + validatedVal);
                                                myob.cfi[category][0][input.attr('data-dir')] = validatedVal;
                                            }
                                            break;
                                    }
                                }
                            );
                            if(vtms.length > 0) {
                                var leftLabel = myob.getCategoryLabel(category);
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
                // if(typeof Cookies !== 'undefined') {

                myob.mfv = window.localStorage.getItem('TFS_mfv');
                if(myob.mfv === 'undefined' || Array.isArray(myob.mfv) === false) {
                    myob.mfv = [];
                } else {
                    myob.serverDataToApply['mfv'] = true;
                }
                var v = window.localStorage.getItem('TFS_visibleRowCount');
                visibleRowCount = myob.visibleRowCountValidator(v);
                if(visibleRowCount !== false) {
                    myob.visibleRowCount = v;
                }
                // }
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

            retrieveDataFromServer: function(forceFavs)
            {
                myob.profileStarter('retrieveDataFromServer');

                var forceFavs = false;
                if(myob.urlToLoad !== '') {
                    var url = myob.serverConnectionURL + 'load/' + myob.urlToLoad + '/';
                    myob.urlToLoad = '';
                    jQuery.getJSON(
                        url,
                        function( response ) {
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
                        }
                    ).fail(
                        function(){
                            alert('Error - trying it again ...');
                        }
                    );
                }
                myob.profileEnder('retrieveDataFromServer');

                myob.processRetrievedData(forceFavs);
            },

            processRetrievedData: function(forceFavs)
            {
                myob.profileStarter('processRetrievedData');

                //favourites
                if(typeof myob.serverDataToApply['mfv'] !== 'undefined' && myob.serverDataToApply['mfv'] === true) {
                    //set cookies
                    myob.checkAndSaveFavourites();
                    //remove all favourites
                    if(myob.useJSON) {
                        //do do anything now...
                    } else {
                        myob.myTableBody.find('tr.'+myob.favouriteClass).removeClass(myob.favouriteClass);
                    }

                    //let the table know.
                    if(myob.mfv.length > 0) {
                        myob.myTableHolder.addClass(myob.hasFavouritesClass);
                    } else {
                        myob.myTableHolder.removeClass(myob.hasFavouritesClass);
                    }
                    //add all favourites
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
                myob.profileEnder('processRetrievedData');
            },



            //===================================================================
            // SCRIPT SECTION: *** HELPER FUNCTIONS
            //===================================================================


            /**
             * @param {string} type
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
                if (strA === strB) {
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

            joinRecursively: function(varOfAnyType, glue)
            {
                var finalResult = [];
                if(typeof varOfAnyType === 'string' || typeof varOfAnyType === 'number') {
                    finalResult.push(varOfAnyType);
                } else if (Array.isArray(varOfAnyType)) {
                    for(var i = 0; i < varOfAnyType.length; i++) {
                        finalResult.push(myob.joinRecursively(varOfAnyType[i], glue));
                    }
                } else if (typeof varOfAnyType === 'object') {
                    for(i in varOfAnyType) {
                        if(varOfAnyType.hasOwnProperty(i)) {
                            finalResult.push(myob.joinRecursively(varOfAnyType[i], glue));
                        }
                    }
                }
                return glue + finalResult.join(glue);
            },

            /**
             * is the current value a date of dd/mm/yyyy?
             *
             * @param  {mixed} value
             * @return {boolean}
             */
            isDate: function(value)
            {
                if(typeof value === 'string') {
                    var bits = value.split('/');
                    if(bits.length === 3) {
                        var d = new Date(bits[2], bits[1] - 1, bits[0]);
                        return isDate = d && (d.getMonth() + 1) == bits[1];
                    }
                }
                return false;
            },

            windowTimeoutStoreSetter(name, fx, delay) {
                if(typeof myob.windowTimeoutStore[name] !== 'undefined') {
                    window.clearTimeout(myob.windowTimeoutStore[name]);
                }
                if(typeof delay === 'undefined') {
                    delay = myob.millisecondsBetweenActionsShort;
                }
                if(typeof fx !== 'undefined') {
                    myob.windowTimeoutStore[name] = window.setTimeout(
                        fx,
                        delay
                    );
                }
            },

            profileStarter: function(name)
            {
                if(myob.debug === true) {
                    console.log('_______________________');
                    console.count(name);
                    console.time(name);
                    if(myob.profile === true) {
                        console.profile(name);
                    }
                }
            },

            profileEnder: function(name)
            {
                if(myob.debug === true) {
                    if(myob.profile === true) {
                        console.profileEnd(name);
                    }
                    console.timeEnd(name);
                    console.log('-----------------------');
                }
            },

            debugger: function(name)
            {
                if(myob.debug === true) {
                    console.log('_______________________');
                    console.log('_______________________ SORTED');
                    console.log(myob.myRowsSorted);
                    console.log('_______________________ HAS FILTER');
                    console.log(myob.hasFilter() ? "TRUE" : "FALSE");
                    console.log('_______________________ MATCHING');
                    console.log(myob.myRowsMatching);
                    console.log('_______________________  VISIBLE ');
                    console.log(myob.myRowsVisible);
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
                    console.log(booleans);
                    console.log('_______________________ STRINGS');
                    console.log(strings);
                    console.log('_______________________ NUMBERS');
                    console.log(numbers);
                    console.log('_______________________ ARRAYS');
                    console.log(arrays);
                    console.log('_______________________ JQUERY OBJECTS');
                    console.log(jqueries);
                    console.log('_______________________ OTHER OBJECTS');
                    console.log(objects);
                    console.log('_______________________ OTHERS');
                    console.log(others);
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
            updateDataDictionaryForCategoryRow: function(category, rowID, newValue){
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
