/**
 * http://stackoverflow.com/questions/9132347/iterating-through-table-cells-using-jquery
 * http://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
 * to do:
 * - change URL
 * - tagle field
 * - not all field values are clickable...
 *
 */
jQuery(document).ready(
    function() {
        if(typeof TableFilterSortTableList !== 'undefined') {
            var i = 0;
            for(i = 0; i < TableFilterSortTableList.length; i++) {
                TableFilterSortTableList[i] = jQuery(TableFilterSortTableList[i]).tableFilterSort();
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
             * turn on to see what is going on in console
             * @var boolean
             */
            debug: false,

            /**
             * url before the ?
             * @type {String}
             */
            baseURL: '',

            /**
             * url before the ?
             * @type {String}
             */
            serverConnectionURL: '/tfs/',

            /**
             * list of server data to apply ...
             * by default we apply everything on load!
             * e.g.
             * cfinc: true
             * @type {Object}
             */
            serverDataToApply: {
                'cfinc': true,
                'csort': true,
                'myfavs': true
            },

            /**
             * the code for all pages that share the same filters
             * @type {String}
             */
            filtersParentPageID: '',

            /**
             * the code for all pages that share the same favourites
             * @type {String}
             */
            favouritesParentPageID: '',

            /**
             * url before the ?
             * @type {String}
             */
            useBackAndForwardButtons: true,

            /**
             * the index in TableFilterSortTableList that holds this guy
             * @var int
             */
            holderNumber: 0,

            /**
             * selector for outer holder
             *
             * @var jQuery Object
             */
            myTableHolder: myTableHolder,

            /**
             * selector for the filter form
             * @var jQuery Object
             */
            myFilterFormHolder: null,

            /**
             * selector for the table
             * @var jQuery Object
             */
            myTable: null,

            /**
             * selector for the table header
             * @var jQuery Object
             */
            myTableHead: null,

            /**
             * selector for the tbody
             * @var jQuery Object
             */
            myTableBody: null,

            /**
             * the sortable rows
             * @var jQuery Object
             */
            myRows: null,

            /**
            * to keep field options simple ...
            * MyFieldA:
            *    CanFilter: true
            *    CanSort: false
            *    DataType: number | string | date
            *    Options: [A,B,C]
            * MyFieldB:
            *    CanFilter: true
            *    CanSort: false
            *    DataType: number | string | date
            *    Options: [A,B,C]
             * @var array
             */
            dataDictionary:[],

            /**
             * variables that determine the filter and sort
             *  - cfinc: details of current filter
             *  - cforcat: which categories are OR instead of AND
             *  - cfex: which category VALUES are to be EXCLUDED
             *  - csort: details on currentSort
             * @type {array}
             */
            filterAndSortVariables: ["cfinc","cforcat","cfex","csort"],

            /**
             * list of current filters by category
             * "Colour" => [Red]
             * "Size" => [S,M,L]
             * @var {object}
             */
            cfinc: {},

            /**
             * current filter categories that are OR rather than AND
             * e.g. [Colour] means that, in the filter any matching colours are OR
             * in relation to other filters like Size and Style
             * @var {array}
             */
            cforcat: [],

            /**
             * current category filter values that are to be excluded
             * "Colour" => [Red, Blue]
             * when the user
             * @var {object}
             */
            cfex: {},

            /**
             * has two variables:
             * "Direction" => 'ASC'
             * "Field" => 'MyField'
             * @var array
             */
            csort: {},

            /**
             * starting point for showing rows
             * @type Int
             */
            showFromRow: 0,

            /**
             * rows to show
             * @type Int
             */
            visibleRowCount: 50,

            /**
             * rows to show
             * @type Int
             */
            totalRowCount: 0,

            /**
             * maximum number of checkboxes in the filter before it becomes a text filter
             * @type Int
             */
            maximumNumberOfFilterOptions: 30,

            /**
             * number of milliseconds to check if filter is in use ...
             * @type Int
             */
            intervalForFilterCheck: 1000,

            /**
             *
             * @type {Boolean}
             */
            hasFixedTableHeader: true,

            /**
             *
             * @type {Boolean}
             */
            hasKeywords: true,

            /**
             *
             * @type {Boolean}
             */
            hasFavourites: false,

            /**
             *
             * @type {Boolean}
             */
            hasFavouritesSaving: false,

            /**
             *
             * @type {Boolean}
             */
            hasFilterSaving: false,

            /**
             *
             * @type {Boolean}
             */
            millisecondsBetweenActions: 10,

            /**
             * @type array
             */
            validDataTypes: ['number', 'string', 'date'], // 'date', 'boolean' to add!

            /**
             * when trying to establish the data-type
             * max
             * @type int
             */
            maxNumberOfValuesToCheck: 500,

            /**
             * list of favourites
             * @type {Array}
             */
            myfavs: [],



            /**
             *
             *
             * CALLBACKS
             *
             *
             */
            startRowFX1: null,
            startRowFX2: null,
            endRowFX1: null,
            endRowFX2: null,

            /**
             *
             *
             * PHRASES
             *
             *
             */

            /**
             * customise the title of the filter button
             * @var string
             */
            filterTitle: "Filter Table",

            /**
             *
             * @type string
             */
            noFilterSelectedText: 'No filter selected',

            /**
             *
             * @type string
             */
            closeAndApplyFilterText: 'Close and Apply Filter',

            /**
             *
             * @type string
             */
            cfincText: '',

            /**
             *
             * @type string
             */
            greaterThanLabel: '&gt; ',

            /**
             *
             * @type string
             */
            lowerThanLabel: '&lt; ',

            /**
             *
             * @type string
             */
            keywordsCategoryTitle: 'Keywords',

            /**
             *
             * @type string
             */
            favouritesCategoryTitle: 'Favourites',

            /**
             *
             * @type string
             */
            filtersTitle: 'Filter',

            /**
             *
             *
             * SELECTORS
             *
             *
             */

            /**
            * @var string
            */
            tableSelector: 'table.tableFilterSortTable',

            /**
             * @var string
             */
            rowSelector: 'tr.tfsRow',

            /**
             * items that can be filtered / sorted for ...
             * @var string
             */
            filterItemSelector: 'span[data-filter]',

            /**
             * @var string
             */
            showMoreDetailsSelector: '.more',

            /**
            * @var string
            */
            moreDetailsSelector: '.hidden',

            /**
            * @var string
            */
            filterFormHolderSelector: '.tableFilterSortFilterFormHolder',

            /**
            * @var string
            */
            sortLinkSelector: 'a.sortable',

            /**
             * selector used to identify add to favourite Links
             * @type {String}
             */
            favouriteLinkSelector: 'a.addFav',

            /**
             * class for an element showing details of hidden rows
             * @var string
             */
            moreRowEntriesSelector: ".tableFilterSortMoreEntries",

            /**
             * class for an element that shows the number of matches
             * @var string
             */
            matchRowCountSelector: ".match-row-number",

            /**
             * class for an element that shows the start row
             * @var string
             */
            minRowSelector: ".min-row-number",

            /**
             * class for an element that shows the end row
             * @var string
             */
            maxRowSelector: ".max-row-number",

            /**
             * class for an element that shows total number of rows available
             * @var string
             */
            totalRowCountSelector: ".total-row-number",

            /**
             * class for an element that shows the number of rows visible
             * @var string
             */
            visibleRowCountSelector: ".total-showing-row-number",

            /**
             * class for an element that holds the pagination
             * @var string
             */
            paginationSelector: ".pagination",

            /**
             *
             *
             * Classes
             *
             *
             */
             /**
              * class for an element that holds the pagination
              * @var string
              */
             saveAndLoadClass: "saveAndLoad",

            /**
             * loading class when things are being calculated
             * @type string
             */
            loadingClass: 'loading',

            /**
             * class for rows that should show
             * @type 'string'
             */
            showClass: 'show',

            /**
             * class for rows that should NOT show
             * @type string
             */
            hideClass: 'hide',

            /**
             * class for matching rows
             * @type string
             */
            matchClass: 'match',

            /**
             * class for non-matching rows
             * @type string
             */
            notMatchClass: 'no-match',

            /**
             * class for items that are closed (more, filter form, etc..)
             * @var string
             */
            openedClass: 'opened',

            /**
             * class to show that the form is open
             * @var string
             */
            filterIsOpenClass: 'filterIsOpen',

            /**
             * @var string
             */
            sectionFilterClassAppendix: 'Filter',

            /**
             * class for element that holds common content (that is the same in ALL rows)
             * @var string
             */
            commonContentHolderClass: 'tableFilterSortCommonContentHolder',

            /**
             * element that holds the current filter info
             * @var string
             */
            currentSearchFilterClass: 'tableFilterSortCurrentSearchHolder',

            /**
             * class that is used for links that open and close the filter form
             * @var string
             */
            openAndCloseFilterFormClass: 'tableFilterSortOpenFilterForm',

            /**
             * class of element that holds the filter options ...
             * @var string
             */
            filterOptionsHolderClass: 'tableFilterSortFilterFormOptions',

            /**
             * class for element that holds one filter group (e.g. Weight)
             * @var string
             */
            filterGroupClass: 'filterColumn',

            /**
             * @var string
             */
            groupLabelClass: 'groupLabel',

            /**
             * class of element that holds the close and apply filter button
             * @var string
             */
            applyFilterClass: 'applyFilter',

            /**
             * class to show that filter form CAN be used
             * @var string
             */
            filterInUseClass: 'tableFilterSortFilterInUse',

            /**
             * class to show that filter form CAN NOT be used
             * @var string
             */
            filterNotInUseClass: 'tableFilterSortFilterNotInUse',

            /**
             * class of element that shows the no match message
             * @var string
             */
            noMatchMessageClass: 'no-matches-message',

            /**
             * class to show that something is currently sorted in ascending order.
             * @var string
             */
            sortAscClass: 'sort-asc',

            /**
             * class to show that something is currently sorted in descending order.
             * @var string
             */
            sortDescClass: 'sort-desc',

            /**
             *
             * @var string
             */
            directLinkClass: 'dl',

            /**
             * class to show which TRs are favourites...
             * @type {String}
             */
            favouriteClass: 'fav',

            /**
             * startup
             *
             */
            init: function(holderNumber){

                //get the holders
                myob.holderNumber = holderNumber;
                myob.myTableHolder = myTableHolder;
                myob.myFilterFormHolder = myob.myTableHolder.find(myob.filterFormHolderSelector).first();
                myob.myTable = myob.myTableHolder.find(myob.tableSelector).first();
                myob.myTableHead = myob.myTableHolder.find("table thead");
                myob.myTableBody = myob.myTable.find(" > tbody");

                myob.favouritesParentPageID = myob.myFilterFormHolder.attr("data-favourites-parent-page-id");
                if(typeof myob.favouritesParentPageID === 'string' && myob.favouritesParentPageID.length > 0) {
                    myob.hasFavouritesSaving = true;
                }
                myob.filtersParentPageID = myob.myFilterFormHolder.attr("data-filters-parent-page-id");
                if(typeof myob.filtersParentPageID === 'string' && myob.filtersParentPageID.length > 0) {
                    myob.hasFilterSaving = true;
                }

                myob.baseURL = location.protocol + '//' + location.host + location.pathname;

                myob.resetObjects();
                if(myob.myRows.length > 1){
                    window.setTimeout(
                        function() {
                            //COLLECT ...
                            //collect filter items
                            if(myob.debug) { console.profileEnd();console.profile('filterItemCollector');}
                            myob.filterItemCollector();
                            //look for cols that are the same
                            if(myob.debug) { console.profileEnd();console.profile('tableHideColsWhichAreAllTheSame');}
                            myob.tableHideColsWhichAreAllTheSame();
                            //set table width
                            if(myob.debug) { console.profileEnd();console.profile('setTableWidth');}
                            myob.setTableWidth();

                            //now we can hide table ...
                            myob.myTableHolder.addClass(myob.loadingClass);

                            //finalise data dictionary
                            if(myob.debug) { console.profileEnd();console.profile('dataDictionaryCollector');}
                            myob.dataDictionaryCollector();
                            //find defaultSort
                            if(myob.debug) { console.profileEnd();console.profile('findDefaultSort');}
                            myob.findDefaultSort();



                            //LISTENERS ...
                            //set up filter form listener
                            if(myob.debug) { console.profileEnd();console.profile('fixTableHeaderListener');}
                            myob.fixTableHeaderListener();
                            //set up filter form listener
                            if(myob.debug) { console.profileEnd();console.profile('setupFilterFormListeners');}
                            myob.setupFilterFormListeners();
                            //set up sort listener
                            if(myob.debug) { console.profileEnd();console.profile('setupSortListeners');}
                            myob.setupSortListeners();
                            //add pagination listener
                            if(myob.debug) { console.profileEnd();console.profile('paginationListeners');}
                            myob.paginationListeners();
                            //allow things to slide up and down
                            if(myob.debug) { console.profile('setupMoreDetailsListener');}
                            myob.setupMoreDetailsListener();
                            //listen for forward and back buttons
                            if(myob.debug) { console.profile('addURLChangeListener');}
                            myob.addURLChangeListener();
                            //listen to favourite links, if any
                            if(myob.debug) { console.profileEnd();console.profile('openServerModalWindowListener');}
                            myob.openServerModalWindowListener();
                            //listen to favourite links, if any
                            if(myob.debug) { console.profileEnd();console.profile('favouriteLinkListener');}
                            myob.favouriteLinkListener();
                            //add direct filter listener, this can only be done afterwards
                            if(myob.debug) { console.profileEnd();console.profile('directFilterLinkListener');}
                            myob.directFilterLinkListener();

                            //LOAD DATA FROM SERVER
                            //check for data in local cookie
                            if(myob.debug) { console.profileEnd();console.profile('retrieveLocalCookie');}
                            myob.retrieveLocalCookie();
                            //check for data in local cookie
                            if(myob.debug) { console.profileEnd();console.profile('retrieveDataFromURL');}
                            myob.retrieveDataFromURL();
                            //check for data on server
                            if(myob.debug) { console.profileEnd();console.profile('retrieveDataFromServer');}
                            myob.retrieveDataFromServer();
                            //we need to process this here one more time ... in case of the cookie data
                            // if(myob.debug) { console.profileEnd();console.profile('processRetrievedData');}
                            // myob.processRetrievedData();

                            //FILTER FORM
                            // //create filter form
                            // if(myob.debug) { console.profileEnd();console.profile('createFilterForm');}
                            // myob.createFilterForm();

                            //RUN SORT / FILTER
                            //filter
                            if(myob.debug) {console.profileEnd(); console.profile('applyFilter');}
                            myob.applyFilter();
                            //sort
                            if(myob.debug) {console.profileEnd(); console.profile('runCurrentSort');}
                            myob.runCurrentSort();

                            if(myob.debug) {console.profileEnd();}

                            //we are now ready!
                            myob.myTableHolder.removeClass(myob.loadingClass);


                            //ADD SCROLL AND OTHER STUFF ...

                        },
                        myob.millisecondsBetweenActions
                    );
                }
            },

            /**
             * called after row manipulation to reset rows
             */
            resetObjects: function()
            {
                myob.myRows = myob.myTable.find(myob.rowSelector);
            },

            setTableWidth: function() {
                var html = '<colgroup>';
                myob.myTableHead.find('tr:first th').each(
                    function(colNumber, cell) {
                        var cell = jQuery(cell);
                        var myWidth = cell.width();
                        var myWidthPX = myWidth + 'px'
                        html += '<col width="'+myWidth+'" style="width: '+myWidthPX+'; min-width: '+myWidthPX+'; max-width: '+myWidthPX+';" />';
                        cell
                            .css('min-width', myWidthPX)
                            .css('max-width', myWidthPX)
                            .css('width', myWidthPX);
                    }
                );
                html +=  '</colgroup>';
                console.debug(html);
                myob.myTable.prepend(html);
                //add push down div ...
                jQuery('<div id="tfspushdowndiv"></div>').
                insertBefore(myob.myTable);
            },

            //===================================================================
            // COLLECTORS
            //===================================================================

            /**
             * find the filters ...
             */
            filterItemCollector: function()
            {
                //for each table with specific class ...
                var value = '';
                var category = '';
                myob.myRows.each(
                    function(i, row) {
                        jQuery(row).find(myob.filterItemSelector).each(
                            function(j, el) {
                                el = jQuery(el);
                                value = el.text();
                                category = el.attr('data-filter');
                                if(value.trim().length > 0) {
                                    if(myob.debug) { console.debug("adding "+value+" to "+category);}
                                    if(typeof myob.dataDictionary[category] === "undefined") {
                                        myob.dataDictionary[category] = {};
                                    }
                                    if(typeof myob.dataDictionary[category]['Options'] === "undefined") {
                                        myob.dataDictionary[category]['Options'] = [];
                                    }
                                    if(myob.dataDictionary[category]['Options'].indexOf(value) === -1) {
                                        myob.dataDictionary[category]['Options'].push(value);
                                    }
                                }
                            }
                        );
                    }
                );
            },

            /**
             * hide the cells that are all the same
             * and add to common content holder
             */
            tableHideColsWhichAreAllTheSame: function()
            {
                var title = myob.myTableHolder.find('.'+ myob.commonContentHolderClass).attr("data-title");
                if(typeof title !== "undefined") {
                    title = "<h3>"+title+"</h3>";
                }
                else {
                    title = "";
                }
                var commonContent = '<div class="'+myob.commonContentHolderClass+'-inner">' + title + "<ul>";
                var commonContentExists = false;
                Object.keys(myob.dataDictionary).forEach(
                    function(category, categoryIndex) {
                        if(myob.dataDictionary[category]['Options'].length === 1) {
                            delete myob.dataDictionary[category];
                            if(myob.debug) {console.debug("tableHideColsWhichAreAllTheSame: checking category: "+category);}
                            commonContentExists = true;
                            var commonContentAdded = false;
                            //remove text from span
                            jQuery('span[data-filter="' + category + '"]').each(
                                function(i, el) {
                                    el = jQuery(el);
                                    if(!commonContentAdded) {
                                        if(el.html() !== "" && !el.hasClass('ignore-content')){
                                            commonContent += "<li><strong>"+category + ":</strong> <span>" + el.html() + "</span></li>";
                                            commonContentAdded = true;
                                        }
                                    }
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
                                                myob.myTable.find('th').eq(colNumber).remove();
                                            }
                                            spanParent.remove();
                                        }
                                    }
                                }
                            );
                        }
                    }
                );
                commonContent += "</ul></div>";
                if(commonContentExists){
                    myob.myTableHolder.find('.' + myob.commonContentHolderClass).html(commonContent);
                } else {
                    myob.myTableHolder.find('.' + myob.commonContentHolderClass).remove();
                }
            },

            /**
             * ensures that all the dataDictionary data is available
             * and validates it.
             * @return {[type]} [description]
             */
            dataDictionaryCollector: function()
            {
                Object.keys(myob.dataDictionary).forEach(
                    function(category, categoryIndex) {
                        //make sure there are options
                        if(typeof myob.dataDictionary[category]['Options'] === "undefined") {
                            myob.dataDictionary[category]['Options'] = [];
                        }

                        var sortLink = myob.myTable.find(myob.sortLinkSelector+'[data-sort-field="'+category+'"]').first();
                        //can it be filtered?
                        if(typeof myob.dataDictionary[category]['CanFilter'] === "undefined") {
                            if(sortLink && sortLink.attr('data-sort-only') == 'true') {
                                myob.dataDictionary[category]['CanFilter'] = false;
                            } else {
                                myob.dataDictionary[category]['CanFilter'] = myob.dataDictionary[category]['Options'].length > 1
                            }
                        }

                        //can it be sorted?
                        if(typeof myob.dataDictionary[category]['CanSort'] === "undefined") {
                            myob.dataDictionary[category]['CanSort'] = sortLink.length > 0;
                        }

                        //what is the data type?
                        if(typeof myob.dataDictionary[category]['DataType'] === 'undefined') {
                            if(myob.dataDictionary[category]['CanSort']) {
                                var sortType = sortLink.attr("data-sort-type");
                                myob.dataDictionary[category]['DataType'] = sortType;
                            }
                        }
                        if(typeof myob.dataDictionary[category]['DataType'] === "undefined") {
                            var type = 'number';
                            var test = false
                            var i = 0;
                            var max = myob.dataDictionary[category]['Options'].length < myob.maxNumberOfValuesToCheck ? myob.dataDictionary[category]['Options'].length : 500;
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
                        //sort options
                        switch(myob.dataDictionary[category]['DataType']) {
                            case 'number':
                                myob.dataDictionary[category]['Options'].sort(
                                    function(a,b){
                                        a = parseFloat(a.replace(/[^0-9.]/g,''));
                                        b = parseFloat(b.replace(/[^0-9.]/g,''));
                                        return a - b
                                    }
                                );
                                break;
                            case 'string':
                            default:
                                myob.dataDictionary[category]['Options'].sort();
                        }
                    }
                );
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
                    myob.csort.sdir = currentSortObject.attr('data-sort-direction');
                    myob.csort.scat = currentSortObject.attr('data-sort-field');
                }
            },

            //===================================================================
            // LISTENERS
            //===================================================================

            fixTableHeaderListener: function() {
                jQuery(window).on(
                    "load scroll",
                    function(e) {
                        myob.fixTableHeader();
                    },
                    myob.millisecondsBetweenActions
                );
                jQuery(window).on(
                    "resize",
                    function(e) {
                        myob.myTableHolder.removeClass('fixed-header');
                        myob.myTable.find('colgroup').remove();
                        myob.myFilterFormHolder.css("width", "");
                        myob.myTable
                            .find('thead tr:first th')
                            .css({"width": "", "min-width": "", "max-width": ""});
                        window.setTimeout(
                            function() {
                                myob.setTableWidth();
                                myob.fixTableHeader();
                            },
                            myob.millisecondsBetweenActions
                        );
                    },
                    myob.millisecondsBetweenActions
                );
            },


            /**
             * set up filter listeners ...
             */
            setupFilterFormListeners: function()
            {
                myob.myFilterFormHolder.on(
                    'click',
                    '.' + myob.openAndCloseFilterFormClass,
                    function(event) {
                        event.preventDefault();
                        myob.myFilterFormHolder.find('.' + myob.filterOptionsHolderClass).toggleClass(myob.openedClass).slideToggle(
                            "fast",
                            function() {
                                myob.myTableHead.css('top', myob.myFilterFormHolder.outerHeight() + 'px');
                            }
                        );
                        myob.myTableHolder.toggleClass(myob.filterIsOpenClass);
                        if(myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                            //filter is now open
                        } else {
                            //filter is now closed
                        }
                        return false;
                    }
                );
                myob.myFilterFormHolder.on(
                    'change',
                    'input',
                    function(event) {
                        myob.applyFilter();
                    }
                );
                myob.myFilterFormHolder.on(
                    'click',
                    '.clear a',
                    function(event) {
                        event.preventDefault();
                        myob.cfinc = {};
                        myob.createFilterForm();
                        myob.applyFilter();
                        return false;
                        //myob.createFilterForm();
                    }
                );
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
                        myob.showFromRow = 0;
                        myob.startRowManipulation();
                        myob.myTableHead.find(myob.sortLinkSelector)
                            .removeClass(myob.sortAscClass)
                            .removeClass(myob.sortDescClass);
                        window.setTimeout(
                            function() {
                                myob.csort.scat = myEl.attr("data-sort-field");
                                myob.csort.sdir = myEl.attr("data-sort-direction");
                                var type = myEl.attr("data-sort-type");

                                if(typeof type === 'undefined') {
                                    type = myob.dataDictionary[myob.csort.category]['DataType'];
                                }
                                var arr = [];
                                myob.myRows.each(
                                    function(i, el) {
                                        var row = jQuery(el);
                                        var dataValue = row.find('[data-filter="' + myob.csort.scat + '"]').text();
                                        if(type === "number") {
                                            dataValue = dataValue.replace(/[^\d.-]/g, '');
                                            dataValue = parseFloat(dataValue);
                                        }
                                        else {
                                            //do nothing ...
                                        }
                                        var arrayRow = new Array(dataValue, i);
                                        arr.push(arrayRow);
                                    }
                                );

                                //start doing stuff
                                //clear table ...
                                myob.myTableBody.empty();

                                //sort
                                arr.sort(myob.sortMultiDimensionalArray);

                                //show direction
                                var sortLinkSelection = myob.myTableHead
                                    .find(myob.sortLinkSelector + '[data-sort-field="'+myob.csort.scat+'"]');
                                if(myob.csort.sdir === "desc"){
                                    arr.reverse();
                                    sortLinkSelection.attr("data-sort-direction", "asc").addClass(myob.sortDescClass);
                                }
                                else{
                                    sortLinkSelection.attr("data-sort-direction", "desc").addClass(myob.sortAscClass);
                                }
                                arr.forEach(
                                    function(entry) {
                                        myob.myTableBody.append(myob.myRows[entry[1]]);
                                    }
                                );
                                myob.endRowManipulation();
                            },
                            myob.millisecondsBetweenActions
                        );
                    }
                );
            },


            paginationListeners: function()
            {
                myob.myTableHolder.on(
                    'click',
                    myob.paginationSelector+' a',
                    function(event) {
                        event.preventDefault();
                        var pageNumber = jQuery(this).attr('data-page');
                        myob.gotoPage(pageNumber);
                        return false;
                    }
                );
            },

            /**
             * set up toggle slides ...
             */
            setupMoreDetailsListener: function()
            {
                //add toggle
                myob.myTableHolder.on(
                    'click',
                    myob.showMoreDetailsSelector,
                    function(event) {
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var myRow = myEl.closest('tr');
                        myRow
                            .toggleClass(myob.openedClass)
                            .find(myob.moreDetailsSelector)
                            .each(
                                function(i, moreDetailsItem) {
                                    moreDetailsItem = jQuery(moreDetailsItem);
                                    moreDetailsItem.slideToggle();
                                    moreDetailsItem.toggleClass(myob.openedClass);
                                }
                            );
                        myEl.toggleClass(myob.openedClass);
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
                        myob.retrieveDataFromURL();
                        myob.retrieveDataFromServer();
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
                    'span[data-filter].' + myob.directLinkClass,
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var category = myEl.attr('data-filter');
                        var filterValue = myEl.text().trim();
                        var filterHolder = myob.myFilterFormHolder
                            .find('.'+myob.filterGroupClass+'[data-to-filter="'+category+'"]');
                        var fieldType = filterHolder.attr('field-type');
                        var filterToTriger = filterHolder
                            .find('input[value="'+ filterValue + '"].checkbox')
                            .first();
                        var highlightIdenticals = true;
                        if(filterToTriger && filterToTriger.length > 0) {
                            if(filterToTriger.is(':checkbox')){
                                if(filterToTriger.prop('checked') === true){
                                    filterToTriger.prop('checked', false).trigger('change');
                                    highlightIdenticals = false;
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

                       if(highlightIdenticals) {
                            myob.myRows
                                .find('span.dl[data-filter="'+category+'"]').each(
                                    function(i, el) {
                                        var myEl = jQuery(el);
                                        if(myEl.text().trim() === filterValue) {
                                            myEl.addClass(myob.directLinkClass+'-on');
                                        }
                                    }
                                );
                        } else {
                            myob.myRows
                                .find('span.dl[data-filter="'+category+'"]').each(
                                    function(i, el) {
                                        var myEl = jQuery(el);
                                        if(myEl.text().trim() === filterValue) {
                                            myEl.removeClass(myob.directLinkClass+'-on');
                                        }
                                    }
                                );
                            }

                        myob.applyFilter();
                        return false;
                    }
                );
            },

            favouriteLinkListener: function(){
                myob.hasFavourites = myob.myTableBody.find(myob.favouriteLinkSelector).length > 0;
                if(myob.hasFavourites) {
                    myob.myTableHolder.on(
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
                                    myob.myfavs.push(id);
                                    if(myob.hasFavouritesSaving) {
                                        var html = '<ul id="favouriteFader">'+myob.makeRetrieveButtons(true, false, 'favourites')+'</ul>';
                                        cellHolder.append(html).addClass('hasFader');
                                        window.setTimeout(
                                            function() {
                                                jQuery('#favouriteFader').fadeOut(
                                                    500,
                                                    function() {
                                                        jQuery('#favouriteFader').remove();
                                                        cellHolder.removeClass('hasFader');
                                                    }
                                                );
                                            },
                                            4500
                                        );
                                    }
                                } else {
                                    var index = myob.myfavs.indexOf(id);
                                    if (index > -1) {
                                        myob.myfavs.splice(index, 1);
                                    }
                                }
                                if(typeof Cookies !== 'undefined') {
                                    Cookies.set('myfavs', myob.myfavs, {path: myob.baseURL, expires: 180});
                                    Cookies.set('lastFilter', myob.currentURL(), {path: myob.baseURL, expires: 180});
                                }
                            }
                            return false;
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
                myob.myTableHolder.on(
                    'click',
                    '.' + myob.saveAndLoadClass + ' a',
                    function(event){
                        event.preventDefault();
                        myob.myTable.removeClass(myob.loadingClass);
                        var myEl = jQuery(this);
                        var url = myEl.attr('data-url');
                        var parentPageID = myEl.attr('data-parent-page-id');
                        variables = myEl.attr('data-variables');
                        variables = variables.split(',');
                        var data = {};
                        for(var i = 0; i  < variables.length; i++) {
                            data[variables[i]] = myob[variables[i]];
                        }
                        data.ParentPageID = parentPageID;
                        jQuery.post(
                            url,
                            data,
                            function(returnedURL) {
                                var width = Math.round(jQuery(window).width() * 0.85);
                                var height = Math.round(jQuery(window).height() * 0.85);
                                jQuery.modal(
                                    '<iframe src="'+returnedURL+'" width="'+width+'"height="'+height+'" style="border:0" id="tfs-pop-up-i-frame" name="tfs-pop-up-i-frame">',
                                    {
                                        closeHTML:"close",
                                        containerCss:{
                                            backgroundColor:"#fff",
                                            borderColor:"#fff",
                                            padding:0,
                                            width: width,
                                            height: height

                                        },
                                        opacity: 75,
                                        overlayClose:true,
                                        onClose: function() {
                                            jQuery.modal.close();
                                            myob.retrieveDataFromServer();
                                        }
                                    }
                                );
                                return false;
                            }
                        ).fail(
                            function() {
                                alert('ERROR!');
                                myob.myTable.removeClass(myob.loadingClass);
                            }
                        );
                        return false;
                    }
                );

            },


            //===================================================================
            // FILTER FORM
            //===================================================================

            /**
             * create filter form
             *
             */
            createFilterForm: function()
            {
                //create html content and add to top of page

                if(myob.myFilterFormHolder.length > 0) {
                    //clear it so that we can rebuild it ...
                    myob.myFilterFormHolder.html("");
                    var cfincHTML = "";
                    var filterFormTitle = myob.myFilterFormHolder.attr("data-title");
                    if(typeof filterFormTitle === "undefined") {
                        filterFormTitle = myob.filterTitle;
                    }
                    if(myob.myTableHolder.find('.' + myob.currentSearchFilterClass).length === 0) {
                        var currentFilterHTML = '<div class="'+myob.currentSearchFilterClass+'"></div>';
                    }
                    var tabIndex = 1;
                    var awesompleteFields = [];
                    var content  = '<form>' +
                                     currentFilterHTML +
                                     '<a href="#" class="'+myob.openAndCloseFilterFormClass+' button closed top">'+filterFormTitle+'</a>' +
                                     '<div style="display: none;" class="'+myob.filterOptionsHolderClass+'">';
                    Object.keys(myob.dataDictionary).forEach(
                        function(category, categoryIndex) {
                            if(myob.dataDictionary[category]['CanFilter']) {
                                tabIndex++;
                                var cleanValue = '';
                                var cleanedValues = [];
                                var count = 0;
                                var optionCount = myob.dataDictionary[category]['Options'].length;
                                if(optionCount > 1 && optionCount <= myob.maximumNumberOfFilterOptions) {
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
                                else if(optionCount > myob.maximumNumberOfFilterOptions) {
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
                        if(myob.hasFavouritesSaving) {
                            content += myob.makeRetrieveButtons(true, true, 'favourites');
                        }
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

                    //add buttons
                    var closeAndApplyFilterText = myob.myFilterFormHolder.attr("data-title-close-and-apply");
                    if(typeof closeAndApplyFilterText === "undefined") {
                        closeAndApplyFilterText = myob.closeAndApplyFilterText;
                    }
                    content += '' +
                                     '<div class="'+myob.applyFilterClass+'">' +
                                     '<a href="#" class="'+myob.openAndCloseFilterFormClass+' button closed">'+closeAndApplyFilterText+'</a>' +
                                     '</div>' +
                                     '</div>' +
                                     '</form>';
                    myob.myFilterFormHolder.html(content);
                    var i = 0;
                    var input;
                    for(i = 0; i < awesompleteFields.length; i++) {
                        category = awesompleteFields[i];
                        //console.debug(category);
                        var jQueryInput = myob.myFilterFormHolder.find('input[name="'+category+'"].awesomplete').first();
                        var id = jQuery(jQueryInput).attr('id');
                        //console.debug(id);
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
                                    myob.makeCheckboxSection(this.input, text.value);
                                    this.input.value = '';
                                    Awesomplete.blackList.push(text.value);
                                    myob.applyFilter();
                                }
                            }
                        );
                        Awesomplete.blackList = [];
                    }
                }
            },


            makeSectionHeaderForForm: function(type, category)
            {
                var myClass = type + myob.sectionFilterClassAppendix;
                var cleanCategory = category.replace(/\W/g, '');
                return '<div class="' + myob.filterGroupClass + ' ' + myClass + '" field-type="'+type+'" data-to-filter="' + category.raw2attr() + '">' +
                        '<label class="'+myob.groupLabelClass+'">' + myob.replaceAll(category, '-', ' ') + '</label>' +
                        '<ul>';
            },

            makeFieldForForm: function(type, category, tabIndex, valueIndex)
            {
                var cleanCategory = category.replace(/\W/g, '');
                var cleanValue = valueIndex.toString().toLowerCase();
                var valueID = ('TFS_' + cleanCategory + '_' + cleanValue).replace(/[^a-zA-Z0-9]+/g, '_');
                if(myob.myFilterFormHolder.find('input#'+valueID).length === 0){
                    var startString = '<li class="' + type + 'Field">';
                    var endString = '</li>';
                    switch (type) {
                        case 'favourites':
                            var checked = '';
                            if(typeof myob.cfinc[category] !== 'undefined') {
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
                                if(typeof myob.cfinc[category] !== 'undefined') {
                                    if(typeof myob.cfinc[category][0] !== 'undefined') {
                                        for(var i = 0; i < myob.cfinc[category].length; i++) {
                                            currentValueForForm = myob.cfinc[category][i].vtm;
                                            currentValueForForm = currentValueForForm.raw2attr();
                                        }
                                    }
                                }
                            } else if(type === 'tag') {
                                if(typeof myob.cfinc[category] !== 'undefined') {
                                    for(var i = 0; i < myob.cfinc[category].length; i++) {
                                        valueIndex = myob.cfinc[category][i].vtm;
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
                            if(typeof myob.cfinc[category] !== 'undefined') {
                                for(var i = 0; i < myob.cfinc[category].length; i++) {
                                    if(cleanValue.trim() === myob.cfinc[category][i].vtm.trim()) {
                                        checked = 'checked="checked"';
                                        break;
                                    }
                                }
                            }
                            return startString +
                                    '<input class="checkbox" type="checkbox" name="' + valueID + '" id="' + valueID + '" value="' + valueIndex.raw2attr() + '" ' + checked + ' tabindex="'+tabIndex+'" />' +
                                    '<label for="' + valueID + '">' + valueIndex + '</label>' +
                                    endString;

                        case 'number':
                        case 'date':
                            var currentValueForForm = {gt: '', lt: ''};
                            if(typeof myob.cfinc[category] !== 'undefined') {
                                currentValueForForm = myob.cfinc[category][0];
                            }
                            var s = startString +
                                    '<span class="gt">' +
                                    ' <label for="' + valueID + '_gt">' + myob.greaterThanLabel + '</label>' +
                                    ' <input data-dir="gt" data-label="' + myob.greaterThanLabel.raw2attr() + '" class="number" step="any" type="number" name="' + cleanCategory + '[]" id="' + valueID + '" tabindex="'+tabIndex+'" value="'+currentValueForForm['gt'].raw2attr()+'" />' +
                                    ' </span><span class="lt">' +
                                    ' <label for="' + valueID + '_lt">' + myob.lowerThanLabel + '</label>' +
                                    ' <input data-dir="lt" data-label="' + myob.lowerThanLabel.raw2attr() + '"  class="number" step="any" type="number" name="' + cleanCategory + '[]" id="' + valueID + '_lt" tabindex="'+tabIndex+'" value="'+currentValueForForm['lt'].raw2attr()+'" />' +
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
                tabIndex = input.attr('tabindex');
                var html = myob.makeFieldForForm('checkbox', category, tabIndex, valueIndex);
                if(html.length > 5) {
                    html = html.replace('<input ', '<input checked="checked" ');
                    input.closest('ul').append(html);
                }

            },


            //===================================================================
            // MANIPULATIONS
            //===================================================================

            runCurrentSort: function()
            {
                var currentSortObject = myob.myTableHead.find(myob.sortLinkSelector+'['+myob.csort.scat+']').first();
                if(currentSortObject && currentSortObject.length > 0) {
                    currentSortObject.click();
                }
            },

            applyFilter: function()
            {
                myob.showFromRow = 0;
                myob.workOutCurrentFilter();
                myob.startRowManipulation();
                window.setTimeout(
                    function() {
                        if(myob.debug) {console.debug("==============");console.debug(myob.cfinc);}
                        myob.myRows.each(
                            function(i, el) {
                                var row = jQuery(el);
                                if(myob.debug) {console.log("===");}
                                //innocent until proven guilty
                                var rowMatches = true;

                                var stillLookingForCategory = true;

                                //check for each category
                                Object.keys(myob.cfinc).forEach(
                                    function(categoryToMatch, categoryToMatchIndex) {
                                        if(stillLookingForCategory) {
                                            //lets not assume there is anything
                                            var rowMatchesForFilterGroup = false;

                                            //values selected in category
                                            var stillLookingForValue = true;
                                            for(var j = 0; j < myob.cfinc[categoryToMatch].length; j++) {
                                                var searchObject = myob.cfinc[categoryToMatch][j];
                                                //what is the value .. if it matches, the row is OK and we can go to next category ...
                                                if(stillLookingForValue) {
                                                    if(categoryToMatch === myob.favouritesCategoryTitle) {
                                                        var rowID = row.attr('id');
                                                        if(typeof rowID !== 'undefined' && rowID.length > 0) {
                                                            if(myob.myfavs.indexOf(rowID) > -1) {
                                                                rowMatchesForFilterGroup = true;
                                                            }
                                                        }
                                                    } else if(categoryToMatch === myob.keywordsCategoryTitle) {
                                                        var vtm = searchObject['vtm'];
                                                        var rowText = row.text().toLowerCase();
                                                        var keywords = vtm.split(' ');
                                                        var matches = true;
                                                        for(var i = 0; i < keywords.length; i++) {
                                                            var keyword = keywords[i].trim();
                                                            if(rowText.indexOf(keyword) === -1) {
                                                                matches = false;
                                                                break;
                                                            }
                                                        }
                                                        if(matches === true) {
                                                            rowMatchesForFilterGroup = true;
                                                        }
                                                    } else {
                                                        row.find('span[data-filter="' + categoryToMatch + '"]').each(
                                                            function(innerI, innerEl) {
                                                                innerEl = jQuery(innerEl);
                                                                var rowValue = innerEl.text().toLowerCase().trim();
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
                                                                            rowValue = parseFloat(rowValue.replace(/[^0-9.]/g,''));
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
                                                                            break;
                                                                        }
                                                                    case 'string':
                                                                    default:
                                                                        var vtm = searchObject['vtm'];
                                                                        if(rowValue === vtm){
                                                                            rowMatchesForFilterGroup = true;
                                                                        }
                                                                }
                                                                if(rowMatchesForFilterGroup){
                                                                    if(myob.debug) {console.log("FILTER - MATCH: '"+vtm+"' in '"+categoryToMatch+"'");}
                                                                    //break out for each loop
                                                                    return false;
                                                                }
                                                                else {
                                                                    if(myob.debug) {console.log("FILTER - NO MATCH: '"+vtm+"' in '"+categoryToMatch+"'");}
                                                                }
                                                            }
                                                        );
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
                                    row.addClass(myob.matchClass).removeClass(myob.notMatchClass);
                                }
                                else {
                                    row.addClass(myob.notMatchClass).removeClass(myob.matchClass);
                                }
                            }
                        );
                        myob.endRowManipulation();
                        if(myob.debug) {console.debug(myob.cfinc);console.debug("==============");}
                    },
                    myob.millisecondsBetweenActions
                );
            },

            /**
             * switch to a different page
             * @param  {int} page [description]
             */
            gotoPage: function(page)
            {
                myob.showFromRow = page * myob.visibleRowCount;
                myob.startRowManipulation();
                myob.endRowManipulation();
            },


            //===================================================================
            // SCROLLING
            //===================================================================

            /**
             * show the form button when it table is in view OR when it is form is open
             * do this every second
             */


            fixTableHeader: function()
            {
                if(myob.myTableHolder.isOnScreen() || myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                    //show if it is in use / not in use ...
                    myob.myTableHolder.addClass(myob.filterInUseClass);
                    myob.myTableHolder.removeClass(myob.filterNotInUseClass);
                    if(myob.hasFixedTableHeader) {
                        var relativeMove = myob.myFilterFormHolder.outerHeight() + myob.myTableHead.outerHeight();
                        var pushDownDiv = myob.myTableHolder.find('#tfspushdowndiv');
                        pushDownDiv.height(relativeMove);
                        //get basic data about scroll situation...
                        var tableOffset = myob.myTableBody.offset().top;
                        var offset = jQuery(window).scrollTop();

                        var showFixedHeader = offset > tableOffset ? true: false;

                        //end reset
                        if(showFixedHeader === true) {
                            var tableHolderWidth = myob.myTableHolder.width();
                            myob.myFilterFormHolder.width(tableHolderWidth);
                            window.setTimeout(
                                function() {
                                    //set width of cells
                                    myob.myTableHolder.addClass('fixed-header');
                                    myob.myTableHead.css('top', myob.myFilterFormHolder.outerHeight());
                                },
                                myob.millisecondsBetweenActions
                            );
                        } else {
                            myob.myTableHolder.removeClass('fixed-header');
                        }
                    }
                } else {
                    myob.myTableHolder.addClass(myob.filterNotInUseClass);
                    myob.myTableHolder.removeClass(myob.filterInUseClass);
                }


            },

            //===================================================================
            // ROW MANIPULATION: START + END
            //===================================================================

            startRowManipulation: function()
            {
                if(typeof myob.startRowFX1 === 'function') {
                    myob.startRowFX1(myob);
                }
                myob.resetObjects();
                //show the table as loading
                myob.myTable.addClass(myob.loadingClass);

                myob.myTable.find(myob.moreRowEntriesSelector).hide();
                //hide the table
                myob.myTable.hide();
                //hide all the rows
                myob.myRows.each(
                    function(i, el) {
                        jQuery(el).addClass(myob.hideClass).removeClass(myob.showClass);
                    }
                );
                if(typeof myob.startRowFX2 === 'function') {
                    myob.startRowFX2(myob);
                }
            },

            endRowManipulation: function()
            {
                if(typeof myob.endRowFX1 === 'function') {
                    myob.endRowFX1(myob);
                }
                //crucial!
                myob.resetObjects();
                //get basic numbers
                var minRow = myob.showFromRow;
                var totalRowCount = 0;
                var matchCount = 0;
                var actualVisibleRowCount = 0;
                var noFilter = myob.myTableBody.find('tr.'+myob.notMatchClass).length === 0 ? true : false;
                var rowMatches = false;
                myob.myRows.each(
                    function(i, el) {
                        el = jQuery(el);
                        totalRowCount++;
                        rowMatches = false;
                        if(noFilter || el.hasClass(myob.matchClass)) {
                            rowMatches = true;
                            matchCount++;
                        }
                        if(rowMatches) {
                            if(matchCount > minRow && actualVisibleRowCount < myob.visibleRowCount) {
                                actualVisibleRowCount++;
                                el.removeClass(myob.hideClass).addClass(myob.showClass);
                            }
                        }
                    }
                );
                //calculate final stuff ...
                if(matchCount > 0){
                    jQuery('.'+myob.noMatchMessageClass).hide();
                }
                else {
                    jQuery('.'+myob.noMatchMessageClass).show();
                }            //
                var maxRow = minRow + actualVisibleRowCount;
                var pageCount = Math.ceil(matchCount / myob.visibleRowCount);
                var currentPage = Math.floor(myob.showFromRow / myob.visibleRowCount);
                //create html for pagination
                var pageHTML = '';
                if(pageCount > 1) {
                    var i = 0;
                    var dotCount = 0;
                    var startOfPaginator = currentPage - 2;
                    var endOfPaginator = currentPage + 2;
                      for(i = 0; i < pageCount; i++ ) {
                        if(currentPage === i) {
                            dotCount = 0;
                            pageHTML += '<span>['+(i+1)+']</span>';
                        } else {
                            test1 = (i > startOfPaginator && i < endOfPaginator);
                            test2 = (i >= (pageCount - 3));
                            test3 = (i < (0 + 3));
                            if(test1 || test2 || test3) {
                                dotCount = 0;
                                pageHTML += '<a href="#" data-page="'+i+'">'+(i+1)+'</a> ';
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
                } else {
                    myob.myTableHolder.find(myob.moreRowEntriesSelector).not('.alwaysShow').hide();
                }
                minRow++;
                myob.myTableHolder.find(myob.minRowSelector).text(minRow);
                myob.myTableHolder.find(myob.maxRowSelector).text(maxRow);
                myob.myTableHolder.find(myob.matchRowCountSelector).text(matchCount);
                myob.myTableHolder.find(myob.totalRowCountSelector).text(totalRowCount);
                myob.myTableHolder.find(myob.visibleRowCountSelector).text(actualVisibleRowCount);
                myob.myTableHolder.find(myob.paginationSelector).html(pageHTML);
                myob.myTable.show();

                myob.myTable.removeClass(myob.loadingClass);
                if( ! myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                    window.setTimeout(
                        function() {
                            jQuery('html, body').animate(
                                {
                                    scrollTop: myob.myTableHolder.position().top
                                },
                                200
                            );
                        },
                        myob.millisecondsBetweenActions
                    );
                }
                if(myob.useBackAndForwardButtons) {
                    history.pushState(null, null, myob.currentURL());
                }
                myob.resetObjects();
                if(typeof myob.endRowFX2 === 'function') {
                    myob.endRowFX2(myob);
                }
                //fix rows again ..
                myob.fixTableHeader();
            },

            currentURL: function ()
            {
                var urlObject = {};
                for(var i =0;i < myob.filterAndSortVariables.length; i++) {
                    var varName = myob.filterAndSortVariables[i];
                    if(Object.keys(myob[varName]).length > 0 ) {
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

            /**
             * makes the favourites or filters buttons
             * @param  {boolean} canSave can the data be saved?
             * @param  {string}  type    favourites | filters
             * @return {string}          html
             */
            makeRetrieveButtons: function(canSave, canLoad, type)
            {
                var buttons = [];
                var url = myob.serverConnectionURL;
                switch(type) {
                    case 'favourites':
                        var title = myob.favouritesCategoryTitle;
                        var parentPageID = myob.favouritesParentPageID;
                        var variables = 'myfavs';
                        break;
                    case 'filters':
                        var title = myob.filtersTitle;
                        var parentPageID = myob.filtersParentPageID;
                        var variables = myob.filterAndSortVariables.join(',');
                        break;
                }
                if(canSave) {
                    buttons.push(
                        '<li class="save '+type+' '+myob.saveAndLoadClass+'">' +
                        '<a href="#" data-url="'+url+'start/" data-parent-page-id="'+parentPageID+'" data-variables="'+variables+'">Save</a>'+
                        '</li>'
                    );
                }
                if(canLoad) {
                    buttons.push(
                        '<li class="load '+type+' '+myob.saveAndLoadClass+'">' +
                        '<a href="#" data-url="'+url+'index/" data-parent-page-id="'+parentPageID+'" data-variables="'+variables+'">Find</a>'+
                        '</li>'
                    );
                }
                if(buttons.length > 0) {
                    return buttons.join('');
                }
            },


            //===================================================================
            // CALCULATIONS
            //===================================================================

            workOutCurrentFilter: function(){
                var html = "";
                var categoryHolder;
                var category = '';
                var type = '';
                var ival = '';
                var vtm = '';
                var filterValueArray = [];
                //reset
                myob.cfinc = {};
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
                            var ivals = [];
                            categoryHolder.find('input').each(
                                function(i, input) {
                                    input = jQuery(input);
                                    var ival = input.val();
                                    var vtm = ival.toLowerCase().trim();
                                    switch(fieldType) {
                                        case 'keyword':
                                            if(vtm.length > 1) {
                                                if(typeof myob.cfinc[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.cfinc[category] = [];
                                                }
                                                if(type === 'keyword') {
                                                    myob.cfinc[category].push({vtm: vtm, ival: ival});
                                                    ivals.push(vtm);
                                                } else {
                                                    var filterValueArray = vtm.split(",");
                                                    var i = 0;
                                                    var len = filterValueArray.length;
                                                    var tempVal = '';
                                                    for(i = 0; i < len; i++) {
                                                        innerInputVal = filterValueArray[i].trim();
                                                        innerValueToMatch = innerInputVal;
                                                        if(innerValueToMatch.length > 1) {
                                                            myob.cfinc[category].push({vtm: innerValueToMatch, ival: innerInputVal});
                                                            ivals.push(innerValueToMatch);
                                                            if(myob.debug) {console.log("... adding '"+innerValueToMatch+"' to '"+category+"'");}
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 'tag':
                                        case 'checkbox':
                                            if(input.is(":checked")){
                                                if(typeof myob.cfinc[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.cfinc[category] = [];
                                                }
                                                ivals.push(vtm);
                                                myob.cfinc[category].push({vtm: vtm, ival: ival});
                                                if(myob.debug) {console.log("... adding '"+category+"' to '"+vtm+"'");}
                                            }
                                            break;
                                        case 'favourites':
                                            if(input.is(":checked")){
                                                if(typeof myob.cfinc[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.cfinc[category] = [];
                                                }
                                                myob.cfinc[category].push({vtm: vtm, ival: ival});
                                                ivals.push(vtm);
                                                if(myob.debug) {console.log("... adding '"+category+"' to '"+vtm+"'");}
                                            }
                                            break;
                                        case 'number':
                                            var val = parseFloat(input.val());
                                            if(jQuery.isNumeric(val) && val !== 0) {
                                                if(typeof myob.cfinc[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.cfinc[category] = [];
                                                }
                                                ivals.push(input.attr('data-label') + val + ' ');
                                                if(typeof myob.cfinc[category][0] === 'undefined') {
                                                    myob.cfinc[category][0] = {};
                                                }
                                                myob.cfinc[category][0][input.attr('data-dir')] = val;
                                            }
                                            break;
                                        case 'date':
                                            var val = input.val().trim();
                                            if(val !== '0' && val !== '') {
                                                if(typeof myob.cfinc[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.cfinc[category] = {};
                                                }
                                                ivals.push(input.attr('data-label') + val);
                                                myob.cfinc[category][0][input.attr('data-dir')] = val;
                                            }
                                            break;
                                    }
                                }
                            );
                            if(typeof myob.cfinc[category] !== "undefined") {
                                var leftLabel = categoryHolder.find('label.'+myob.groupLabelClass).text();
                                html += "<li class=\"category\"><strong>" + leftLabel + ":</strong> <span>" + ivals.join('</span><span>') + "</span></li>";
                            }
                        }
                    //funny indenting to stay ....
                );
                var hasFilter = Object.keys(myob.cfinc).length > 0 ? true : false;
                var buttons = [];
                if(hasFilter === true) {
                    buttons.push('<li class="clear"><a href="#">✖</a></li>');
                } else {
                    html = '<li class="noFilterSelected">'+myob.noFilterSelectedText+'</li>';
                }
                if(myob.hasFilterSaving) {
                    buttons.push(myob.makeRetrieveButtons(hasFilter, true, 'filters'))
                }

                if(buttons.length > 0) {
                    var buttonHTML = buttons.join('');
                    html =  buttonHTML + html;
                }
                if(html.length > 0) {
                    html = '<ul>' + html + '</ul>';
                }
                var targetDomElement = myob.myTableHolder.find('.'+myob.currentSearchFilterClass);
                var title = targetDomElement.attr('data-title');
                if(typeof title === 'undefined') {
                    title = myob.cfincText;
                }
                if(title.length) {
                    title = '<h3>' + title + '</h3>';
                }
                html = title + html;
                targetDomElement.html(html);

            },

            //===================================================================
            // SERVER, URL, AND COOKIE INTERACTIONS
            //===================================================================

            retrieveLocalCookie: function()
            {
                //get favourites data
                if(typeof Cookies !== 'undefined') {
                    myob.myfavs = Cookies.getJSON('myfavs');
                    if(typeof myob.myfavs === 'undefined') {
                        myob.myfavs = [];
                    } else {
                        myob.serverDataToApply['myfavs'] = true;
                    }
                }
            },

            /**
             * get data from the server and apply it to the current object ...
             * only 'load' works right now, but other variables can be applied
             * in the future...
             */
            retrieveDataFromURL: function()
            {
                var qd = {};
                if(typeof JSURL !== 'undefined') {
                    if(typeof location.hash !== 'undefined' && location.hash && location.hash.length > 0) {
                        var hash = window.location.hash.substr(1);
                        data = JSURL.tryParse(hash, {});
                        for (var property in data) {
                            if (data.hasOwnProperty(property)) {
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
            retrieveDataFromServer: function()
            {
                var qd = {};
                var hasServerConnection = false;
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
                    if(typeof qd.load !== 'undefined') {
                        hasServerConnection = true;
                        myob.myTable.addClass(myob.loadingClass);
                        var url = myob.serverConnectionURL + 'load/' + qd.load + '/';
                        jQuery.getJSON(
                            url,
                            function( response ) {
                                var data = response.Data;
                                data = JSON.parse(data);
                                for (var property in data) {
                                    if (data.hasOwnProperty(property)) {
                                        myob[property] = data[property];
                                        myob.serverDataToApply[property] = true;
                                    }
                                }
                                myob.processRetrievedData();
                                myob.myTable.removeClass(myob.loadingClass);
                            }
                        ).fail(
                            function(){
                                myob.processRetrievedData();
                                myob.myTable.removeClass(myob.loadingClass);
                            }
                        );
                    }
                }
                if( hasServerConnection === false) {
                    myob.processRetrievedData();
                }
            },

            processRetrievedData: function()
            {
                if(typeof myob.serverDataToApply['myfavs'] !== 'undefined' && myob.serverDataToApply['myfavs'] === true) {
                    //remove all favourites
                    myob.myTableBody.find('tr.'+myob.favouriteClass).removeClass(myob.favouriteClass);
                    //add all favourites
                    for (var fav in myob.myfavs) {
                        if (myob.myfavs.hasOwnProperty(fav)) {
                            var id = myob.myfavs[fav];
                            myob.myTableBody.find('#' + id).addClass(myob.favouriteClass);
                        }
                    }
                    delete myob.serverDataToApply['myfavs']
                }
                if(typeof myob.serverDataToApply['cfinc'] !== 'undefined' && myob.serverDataToApply['cfinc'] === true) {
                    myob.createFilterForm();
                    myob.applyFilter();
                    delete myob.serverDataToApply['cfinc'];
                }
                if(typeof myob.serverDataToApply['csort'] !== 'undefined' && myob.serverDataToApply['csort'] === true) {
                    var category = myob.csort.scat;
                    var direction = myob.csort.sdir;
                    myob.myTableHead.find(myob.sortLinkSelector)
                        .removeClass(myob.sortAscClass)
                        .removeClass(myob.sortDescClass);
                    myob.myTableHead.find(myob.sortLinkSelector+'[data-sort-field=\''+category+'\']')
                        .attr('data-sort-direction', direction)
                        .click();
                    delete myob.serverDataToApply['csort'];
                }
            },

            //===================================================================
            // HELPER FUNCTIONS
            //===================================================================


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
             * array sorter function ...
             */
            sortMultiDimensionalArray: function(a, b)
            {
                var testA = a[0];
                if(typeof testA === 'string'){
                    testA = testA.toLowerCase();
                }
                var testB = b[0];
                if(typeof testB === 'string'){
                    testB = testB.toLowerCase();
                }
                if (testA === testB) {
                    return 0;
                }
                else {
                    return (testA < testB) ? -1 : 1;
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
            gotoPage: function(pageNumber) {
                myob.gotoPage(pageNumber);
                return this;
            }
        };
    }
}( jQuery ));





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
 *
 * Copyright (c) 2013 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/07/26
**/
;(function ($) {
    var on = $.fn.on, timer;
    $.fn.on = function () {
        var args = Array.apply(null, arguments);
        var last = args[args.length - 1];

        if (isNaN(last) || (last === 1 && args.pop())) return on.apply(this, args);

        var delay = args.pop();
        var fn = args.pop();

        args.push(function () {
            var self = this, params = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(self, params);
            }, delay);
        });

        return on.apply(this, args);
    };
}(jQuery));
