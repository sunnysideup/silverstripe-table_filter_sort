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

});



(function( $ ) {


    $.fn.tableFilterSort = function(options){

        var holderNumber = 0;

        var myTableHolder = this;

        var TableFilterSort = {

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
            favouritesURL: '/tfs/favourites/',

            /**
             * url before the ?
             * @type {String}
             */
            filtersURL: '/tfs/filters/',

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
            useBackAndForwardButtons: false,

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
             * selector for the both the fake and real table header
             * @var jQuery Object
             */
            myTableHeaders: null,

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
             * "Colour" => [Red]
             * "Size" => []
             * show TRS where at least one of the values for EVERY category is matched
             * @var array
             */
            currentFilter: {},

            /**
             * has two variables:
             * "Direction" => 'ASC'
             * "Field" => 'MyField'
             * @var array
             */
            currentSorter: {},

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
            maximumNumberOfFilterOptions: 3,

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
            favouritesStore: [],



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
            currentFilterText: 'Current Filter',

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
             * class for an element that holds the pagination
             * @var string
             */
            saveAndLoadSelector: ".saveAndLoad",

            /**
             *
             *
             * Classes
             *
             *
             */

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
                var myob = TableFilterSort;

                //get the holders
                myob.holderNumber = holderNumber;
                myob.myTableHolder = myTableHolder;
                myob.myFilterFormHolder = myob.myTableHolder.find(myob.filterFormHolderSelector).first();
                myob.myTable = myob.myTableHolder.find(myob.tableSelector).first();
                myob.myTableHeaders = myob.myTableHolder.find("table thead");
                myob.myTableBody = myob.myTable.find(" > tbody");

                myob.favouritesParentPageID = myob.myFilterFormHolder.attr("data-favourites-page-id");
                if(typeof myob.favouritesParentPageID === 'string' && myob.favouritesParentPageID.length > 0) {
                    myob.hasFavourites = true;
                }
                myob.filtersParentPageID = myob.myFilterFormHolder.attr("data-filter-page-id");
                if(typeof myob.filtersParentPageID === 'string' && myob.filtersParentPageID.length > 0) {
                    myob.hasFilterSaving = true;
                }

                myob.baseURL = location.protocol + '//' + location.host + location.pathname;

                myob.resetObjects();
                if(myob.myRows.length > 1){
                    myob.myTableHolder.addClass(myob.loadingClass);
                    window.setTimeout(
                        function() {

                            //COLLECT ...
                            //collect filter items
                            if(myob.debug) { console.profileEnd();console.profile('filterItemCollector');}
                            myob.filterItemCollector();
                            //look for cols that are the same
                            if(myob.debug) { console.profileEnd();console.profile('tableHideColsWhichAreAllTheSame');}
                            myob.tableHideColsWhichAreAllTheSame();
                            //finalise data dictionary
                            if(myob.debug) { console.profileEnd();console.profile('dataDictionaryCollector');}
                            myob.dataDictionaryCollector();

                            //LISTENERS ...
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
                            if(myob.debug) { console.profile('toggleSlideSetup');}
                            myob.toggleSlideSetup();
                            //listen for forward and back buttons
                            if(myob.debug) { console.profile('addURLChangeListener');}
                            myob.addURLChangeListener();
                            //listen to favourite links, if any
                            if(myob.debug) { console.profileEnd();console.profile('retrieveServerDataListener');}
                            myob.retrieveServerDataListener();
                            //listen to favourite links, if any
                            if(myob.debug) { console.profileEnd();console.profile('favouriteLinkListener');}
                            myob.favouriteLinkListener();
                            //add direct filter listener, this can only be done afterwards
                            if(myob.debug) { console.profileEnd();console.profile('directFilterLinkListener');}
                            myob.directFilterLinkListener();

                            //FILTER FORM
                            //create filter form
                            if(myob.debug) { console.profileEnd();console.profile('createFilterForm');}
                            myob.createFilterForm();

                            if(myob.debug) { console.profileEnd();}

                            //we are now ready!
                            myob.myTableHolder.removeClass(myob.loadingClass);

                            //show defaults
                            if(myob.debug) { console.profile('runCurrentSort');}
                            myob.runCurrentSort();

                            //ADD SCROLL AND OTHER STUFF ...
                            //check for existing favourites
                            if(myob.debug) { console.profileEnd();console.profile('retrieveCookieData');}
                            myob.retrieveCookieData();
                            //form in and out of focus
                            if(myob.debug) { console.profileEnd();console.profile('showAndHideFilterForm');}
                            myob.showAndHideFilterForm();
                            //fix table header
                            if(myob.debug) { console.profileEnd(); console.profile('fixTableHeader');}
                            myob.fixTableHeader();
                            if(myob.debug) { console.profileEnd();}

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
                var myob = TableFilterSort;
                myob.myRows = myob.myTable.find(myob.rowSelector);
            },

            //===================================================================
            // COLLECTORS
            //===================================================================

            /**
             * find the filters ...
             */
            filterItemCollector: function()
            {
                var myob = TableFilterSort;
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
                var myob = TableFilterSort;
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
                                        if(el.html() !== ""){
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
                var myob = TableFilterSort;
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

            //===================================================================
            // LISTENERS
            //===================================================================



            /**
             * set up filter listeners ...
             */
            setupFilterFormListeners: function()
            {
                var myob = TableFilterSort;
                myob.myTableHolder.on(
                    'click',
                    '.' + myob.openAndCloseFilterFormClass,
                    function(event) {
                        event.preventDefault();
                        myob.myFilterFormHolder.find('.' + myob.filterOptionsHolderClass).toggleClass(myob.openedClass).slideToggle("fast");
                        myob.myTableHolder.toggleClass(myob.filterIsOpenClass);
                        if(myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                            //filter is now open
                        } else {
                            myob.applyFilter();
                        }
                        return false;
                    }
                );
            },


            /**
             * set up sorting mechanism
             */
            setupSortListeners: function()
            {
                var myob = TableFilterSort;
                myob.myTableHolder.on(
                    "click",
                    myob.sortLinkSelector,
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        myob.showFromRow = 0;
                        myob.startRowManipulation();
                        myob.myTableHeaders.find(myob.sortLinkSelector)
                            .removeClass(myob.sortAscClass)
                            .removeClass(myob.sortDescClass);
                        window.setTimeout(
                            function() {
                                myob.currentSorter.category = myEl.attr("data-sort-field");
                                myob.currentSorter.direction = myEl.attr("data-sort-direction");
                                myob.currentSorter.sortType = myEl.attr("data-sort-type");

                                if(typeof myob.currentSorter.sortType === 'undefined') {
                                    myob.currentSorter.sortType = myob.dataDictionary[myob.currentSorter.category]['DataType'];
                                }
                                var arr = [];
                                myob.myRows.each(
                                    function(i, el) {
                                        var row = jQuery(el);
                                        var dataValue = row.find('[data-filter="' + myob.currentSorter.category + '"]').text();
                                        if(myob.currentSorter.sortType === "number") {
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
                                var sortLinkSelection = myob.myTableHeaders
                                    .find(myob.sortLinkSelector + '[data-sort-field="'+myob.currentSorter.category+'"]');
                                if(myob.currentSorter.direction === "desc"){
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
                var myob = TableFilterSort;
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
            toggleSlideSetup: function()
            {
                var myob = TableFilterSort;
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

            addURLChangeListener: function()
            {
                var myob = TableFilterSort;
                if(myob.useBackAndForwardButtons) {
                    window.addEventListener(
                        "popstate",
                        function(e) {
                            myob.findAndApplyGetVariables();
                        }
                    );
                }
            },


            /**
             * basically runs the filter as per usual
             * after stuff has been selected.
             */
            directFilterLinkListener: function()
            {
                var myob = TableFilterSort;
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
                        myob.applyFilter();
                        return false;
                    }
                );
            },

            favouriteLinkListener: function(){
                var myob = TableFilterSort;
                if(myob.myTableBody.find(myob.favouriteLinkSelector).length > 0) {
                    myob.myTableHolder.on(
                        'click',
                        myob.favouriteLinkSelector,
                        function(event){
                            event.preventDefault();
                            var rowHolder = jQuery(this).closest('tr');
                            rowHolder.toggleClass(myob.favouriteClass);
                            var id = rowHolder.attr('id');
                            if(id && typeof id !== 'undefined' && id !== '') {
                                if(rowHolder.hasClass(myob.favouriteClass)) {
                                    myob.favouritesStore.push(id)
                                } else {
                                    var index = myob.favouritesStore.indexOf(id);
                                    if (index > -1) {
                                        myob.favouritesStore.splice(index, 1);
                                    }
                                }
                                Cookies.set('favouritesStore', myob.favouritesStore, {path: myob.baseURL, expires: 180});
                            }
                            return false;
                        }
                    );
                }
            },

            retrieveServerDataListener: function()
            {
                var myob = TableFilterSort;

                myob.myTableHolder.on(
                    'click',
                    myob.saveAndLoadSelector + ' a',
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var url = myEl.attr('href');
                        var isFilters = false;
                        var isSave = false;
                        var parentPageID = myob.favouritesParentPageID;
                        var data = {};
                        if(myEl.hasClass('save')) {
                            isSave = true;
                        }
                        if(myEl.hasClass('filters')) {
                            isFilters = true;
                            var parentPageID = myob.filtersParentPageID;
                        }
                        if(isSave) {
                            if(isFilters){
                                data = {f: myob.currentFilter, s: myob.currentSorter};
                            } else {
                                data = {f: myob.favouritesStore};
                            }
                        }
                        parentPageID = parentPageID.split('/').join('--');
                        dataAsString = JSON.stringify(data);
                        fullURL = url + encodeURI(parentPageID) + '/?data='+encodeURI(dataAsString);
                        jQuery.modal('<iframe src="' + fullURL + '" height="450" width="830" style="border:0">', {
                            closeHTML:"",
                            containerCss:{
                                backgroundColor:"#fff",
                                borderColor:"#fff",
                                height:450,
                                padding:0,
                                width:830
                            },
                            overlayClose:true
                        });
                        // myEl.attr('href', fullURL);
                        myEl.modal();
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
                var myob = TableFilterSort;

                if(myob.myFilterFormHolder.length > 0) {

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
                                     '<a href="#" class="'+myob.openAndCloseFilterFormClass+' button closed">'+filterFormTitle+'</a>' +
                                     '<div style="display: none;" class="'+myob.filterOptionsHolderClass+'">';
                    if(myob.hasKeywords) {
                        content += myob.makeSectionHeaderForForm(
                            'keyword',
                             myob.keywordsCategoryTitle
                        );
                        content += myob.makeFieldForForm('keyword', myob.keywordsCategoryTitle, tabIndex, 0);
                        content += myob.makeSectionFooterForForm();
                    }
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
                                    count = 0;
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
                        content += myob.makeSectionFooterForForm();
                        tabIndex++;
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
                                // filter: function(text, input) {
                                //     return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
                                // },
                                replace: function(text) {
                                    // var before = this.input.value.match(/^.+,\s*|/)[0];
                                    // this.input.value = before + text + ', ';
                                    myob.makeCheckboxSection(this.input, text.value);
                                    this.input.value = '';
                                    var index = this._list.indexOf(text.value);
                                    if (index > -1) {
                                        this._list.splice(index, 1);
                                    }
                                }
                            }
                        );
                        // jQueryInput.on(
                        //     'awesomplete-selectcomplete',
                        //     function() {
                        //         //myob.makeCheckboxSection(this, jQuery(this).val());
                        //     }
                        // )
                    }
                }
            },


            makeSectionHeaderForForm: function(type, category)
            {
                var myob = TableFilterSort;
                var myClass = type + myob.sectionFilterClassAppendix;
                var cleanCategory = category.replace(/\W/g, '');
                var myob = TableFilterSort;
                return '<div class="' + myob.filterGroupClass + ' ' + myClass + '" field-type="'+type+'" data-to-filter="' + category.raw2attr() + '">' +
                        '<label class="'+myob.groupLabelClass+'">' + myob.replaceAll(category, '-', ' ') + '</label>' +
                        '<ul>';
            },

            makeFieldForForm: function(type, category, tabIndex, valueIndex)
            {
                var myob = TableFilterSort;
                var cleanCategory = category.replace(/\W/g, '');
                var cleanValue = valueIndex.toString();
                var valueID = ('TFS_' + cleanCategory + '_' + cleanValue).replace(/[^a-zA-Z0-9]+/g, '_');
                if(myob.myFilterFormHolder.find('input#'+valueID).length === 0){
                    var startString = '<li class="' + type + 'Field">';
                    var endString = '</li>';
                    switch (type) {
                        case 'favourites':
                            return startString +
                                '<input class="favourites" type="checkbox" name="'+category.raw2attr()+'" id="'+valueID+'" tabindex="'+tabIndex+'" />' +
                                '<label for="' + valueID + '">♥ ♥ ♥</label>' +
                                endString;
                            break;
                        case 'keyword':
                        case 'tag':
                            var currentValueForForm = '';
                            if(typeof myob.currentFilter[category] !== 'undefined') {
                                if(typeof myob.currentFilter[category][0] !== 'undefined') {
                                    currentValueForForm = myob.currentFilter[category][0];
                                    currentValueForForm = currentValueForForm.raw2attr();
                                }
                            }
                            if(type === 'keyword') {
                                extraClass = 'keyword';
                            } else if(type === 'tag') {
                                extraClass = 'awesomplete';
                            }
                            return startString +
                                    '<input class="text ' + extraClass + '" type="text" name="'+category.raw2attr()+'" id="'+valueID+'" tabindex="'+tabIndex+'" />' +
                                    endString;
                        case 'checkbox':
                            var checked = '';
                            if(typeof myob.currentFilter[category] !== 'undefined') {
                                var arrayIndex = jQuery.inArray(valueIndex, myob.currentFilter[category]);
                                if(arrayIndex > -1) {
                                    checked = 'checked="checked"';
                                }
                            }
                            return startString +
                                    '<input class="checkbox" type="checkbox" name="' + valueID + '" id="' + valueID + '" value="' + valueIndex.raw2attr() + '" ' + checked + ' " tabindex="'+tabIndex+'" />' +
                                    '<label for="' + valueID + '">' + valueIndex + '</label>' +
                                    endString;

                        case 'number':
                        case 'date':
                            var currentValueForForm = ['', ''];
                            if(typeof myob.currentFilter[category] !== 'undefined') {
                                currentValueForForm = myob.currentFilter[category];
                            }
                            var s = startString +
                                    '<span class="gt">' +
                                    ' <label for="' + valueID + '_gt">' + myob.greaterThanLabel + '</label>' +
                                    ' <input data-dir="gt" data-label="' + myob.greaterThanLabel.raw2attr() + '" class="number" step="any" type="number" name="' + cleanCategory + '[]" id="' + valueID + '" tabindex="'+tabIndex+'" value="'+currentValueForForm[0].raw2attr()+'" />' +
                                    ' </span><span class="lt">' +
                                    ' <label for="' + valueID + '_lt">' + myob.lowerThanLabel + '</label>' +
                                    ' <input data-dir="lt" data-label="' + myob.lowerThanLabel.raw2attr() + '"  class="number" step="any" type="number" name="' + cleanCategory + '[]" id="' + valueID + '_lt" tabindex="'+tabIndex+'" value="'+currentValueForForm[1].raw2attr()+'" />' +
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
                var myob = TableFilterSort;
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
                var myob = TableFilterSort;
                var currentSortLinkSelector = '.'+myob.sortDescClass+', .'+myob.sortAscClass
                var currentSortObject = myob.myTableHolder.find(currentSortLinkSelector).first();
                if(currentSortObject && currentSortObject.length > 0) {
                    //an ascending or descending has been set ...
                } else {
                    currentSortObject = myob.myTableHolder.find(myob.sortLinkSelector+"[data-sort-default=true]").first();
                }
                if(currentSortObject && currentSortObject.length > 0) {
                } else {
                    currentSortObject = myob.myTableHolder.find(myob.sortLinkSelector).first();
                }
                if(currentSortObject && currentSortObject.length > 0) {
                    currentSortObject.click();
                }
            },

            applyFilter: function()
            {
                var myob = TableFilterSort;
                myob.showFromRow = 0;
                myob.workOutCurrentFilter();
                myob.startRowManipulation();
                window.setTimeout(
                    function() {
                        if(myob.debug) {console.debug("==============");console.debug(myob.currentFilter);}
                        myob.myRows.each(
                            function(i, el) {
                                var row = jQuery(el);
                                if(myob.debug) {console.log("===");}
                                //innocent until proven guilty
                                var rowMatches = true;

                                var stillLookingForCategory = true;

                                //check for each category
                                Object.keys(myob.currentFilter).forEach(
                                    function(categoryToMatch, categoryToMatchIndex) {
                                        if(stillLookingForCategory) {
                                            //lets not assume there is anything
                                            var rowMatchesForFilterGroup = false;

                                            //values selected in category
                                            var stillLookingForValue = true;
                                            for(var j = 0; j < myob.currentFilter[categoryToMatch].length; j++) {
                                                var searchObject = myob.currentFilter[categoryToMatch][j];
                                                //what is the value .. if it matches, the row is OK and we can go to next category ...
                                                if(stillLookingForValue) {
                                                    if(categoryToMatch === myob.favouritesCategoryTitle) {
                                                        var rowID = row.attr('id');
                                                        if(typeof rowID !== 'undefined' && rowID.length > 0) {
                                                            if(myob.favouritesStore.indexOf(rowID) > -1) {
                                                                rowMatchesForFilterGroup = true;
                                                            }
                                                        }
                                                    } else if(categoryToMatch === myob.keywordsCategoryTitle) {
                                                        var valueToMatch = searchObject['valueToMatch'];
                                                        var rowText = row.text().toLowerCase();
                                                        var keywords = valueToMatch.split(' ');
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
                                                                        if(typeof searchObject['valueToMatch'] !== 'undefined'){
                                                                            var valueToMatch = searchObject['valueToMatch'];
                                                                            if(rowValue == valueToMatch){
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
                                                                        var valueToMatch = searchObject['valueToMatch'];
                                                                        if(rowValue === valueToMatch){
                                                                            rowMatchesForFilterGroup = true;
                                                                        }
                                                                }
                                                                if(rowMatchesForFilterGroup){
                                                                    if(myob.debug) {console.log("FILTER - MATCH: '"+valueToMatch+"' in '"+categoryToMatch+"'");}
                                                                    //break out for each loop
                                                                    return false;
                                                                }
                                                                else {
                                                                    if(myob.debug) {console.log("FILTER - NO MATCH: '"+valueToMatch+"' in '"+categoryToMatch+"'");}
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
                        if(myob.debug) {console.debug(myob.currentFilter);console.debug("==============");}
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
                var myob = TableFilterSort;
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
            showAndHideFilterForm: function()
            {
                var myob = TableFilterSort;
                window.setInterval(
                    function() {
                        if(myob.myTableHolder.isOnScreen() || myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                            myob.myTableHolder.addClass(myob.filterInUseClass);
                            myob.myTableHolder.removeClass(myob.filterNotInUseClass);
                        } else {
                            myob.myTableHolder.addClass(myob.filterNotInUseClass);
                            myob.myTableHolder.removeClass(myob.filterInUseClass);
                        }
                    },
                    myob.intervalForFilterCheck
                );
            },

            fixTableHeader: function()
            {
                var myob = this;
                if(myob.hasFixedTableHeader) {
                    jQuery(window).unbind('scroll');
                    myob.myTableHolder.find('table.fixed-header').each(
                        function(i, el) {
                            jQuery(el).remove();
                        }
                    );
                    jQuery('<table class="fixed-header" style="position: fixed; top: 0px; display:none;"></table>').insertAfter(myob.tableSelector);
                    var header = myob.myTable.find("thead").clone();
                    var fixedHeader = myob.myTableHolder.find(".fixed-header").append(header);

                    jQuery(window).bind(
                        "scroll",
                        function() {
                            var tableOffset = myob.myTable.offset().top;
                            var offset = jQuery(this).scrollTop();
                            if (offset > tableOffset && fixedHeader.is(":hidden")) {
                                myob.myTable.addClass('fake-header');
                                fixedHeader.show();
                                fixedHeader.width(myob.myTable.outerWidth());
                                var fakeHeaders = fixedHeader.find('thead tr:first th, thead tr:first td');
                                myob.myTable.find('thead tr:first th, thead tr:first td').each(
                                    function(colNumber, cel) {
                                        var width = jQuery(cel).width();
                                        jQuery(fakeHeaders.eq(colNumber))
                                            .width(width);
                                    }
                                )
                            }
                            else if (offset <= tableOffset) {
                                myob.myTable.removeClass('fake-header');
                                fixedHeader.hide();
                            }
                        }
                    );
                    myob.myTableHeaders = myob.myTableHolder.find("table thead");
                }
            },

            //===================================================================
            // ROW MANIPULATION: START + END
            //===================================================================

            startRowManipulation: function()
            {
                var myob = TableFilterSort;
                if(typeof myob.startRowFX1 === 'function') {
                    myob.startRowFX1(myob);
                }
                myob.resetObjects();
                //show the table as loading
                myob.myTableHolder
                    .addClass(myob.loadingClass)
                    .find(myob.moreRowEntriesSelector).hide();
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
                var myob = TableFilterSort;
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
                myob.myTableHolder.find(myob.matchRowCountSelector).text(matchCount);
                myob.myTableHolder.find(myob.minRowSelector).text(minRow);
                myob.myTableHolder.find(myob.maxRowSelector).text(maxRow);
                myob.myTableHolder.find(myob.totalRowCountSelector).text(totalRowCount);
                myob.myTableHolder.find(myob.visibleRowCountSelector).text(actualVisibleRowCount);
                myob.myTableHolder.find(myob.paginationSelector).html(pageHTML);
                myob.myTable.show();
                var buttons = [];
                if(myob.hasFavourites) {
                    buttons.push(myob.makeRetrieveButtons(myob.favouritesStore.length > 0, 'favourites'))
                }
                if(myob.hasFilterSaving) {
                    buttons.push(myob.makeRetrieveButtons(myob.currentFilter.length > 0, 'filters'))
                }
                if(buttons.length > 0) {
                    var buttonHTML = '<ul>' + buttons.join('</li><li>') + '</ul>';
                    myob.myTableHolder.find(myob.saveAndLoadSelector).html(buttonHTML);
                }
                myob.myTableHolder.removeClass(myob.loadingClass);
                window.setTimeout(
                    function() {
                        jQuery('html, body').animate(
                            {
                                scrollTop: myob.myTableHolder.position().top
                            },
                            200
                        );
                    }, 100
                );
                if(myob.useBackAndForwardButtons) {
                    history.pushState(null, null, myob.currentURL());
                }
                myob.resetObjects();
                if(typeof myob.endRowFX2 === 'function') {
                    myob.endRowFX2(myob);
                }
            },

            currentURL: function ()
            {
                var myob = TableFilterSort;
                var urlObject = {};
                urlObject.f = myob.currentFilter;
                urlObject.s = myob.currentSorter;
                var urlpart = "tfs=" + encodeURI(JSON.stringify(urlObject));
                return myob.baseURL + '?' + urlpart
            },

            makeRetrieveButtons: function(canSave, type)
            {
                var myob = TableFilterSort;
                var buttons = [];
                switch(type) {
                    case 'favourites':
                        var url = myob.favouritesURL;
                        var title = myob.favouritesCategoryTitle;
                        break;
                    case 'filters':
                        var url = myob.filtersURL;
                        var title = myob.filtersTitle;
                        break;
                }
                if(canSave) {
                    buttons.push('<a href="'+url+'save/" class="save '+type+'">Save ' + title + '</a>');
                }
                buttons.push('<a href="'+url+'index/" class="load '+type+'">Load ' + title + '</a>');

                return buttonHTML = '<li>' + buttons.join(' | ') + '</li>';

            },


            //===================================================================
            // CALCULATIONS
            //===================================================================

            workOutCurrentFilter: function(){
                var myob = TableFilterSort;
                var html = "";
                var categoryHolder;
                var category = '';
                var type = '';
                var inputVal = '';
                var valueToMatch = '';
                var filterValueArray = [];
                //reset
                myob.currentFilter = {};
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
                            var inputVals = [];
                            categoryHolder.find('input').each(
                                function(i, input) {
                                    input = jQuery(input);
                                    var inputVal = input.val();
                                    var valueToMatch = inputVal.toLowerCase().trim();
                                    switch(fieldType) {
                                        case 'keyword':
                                            if(valueToMatch.length > 1) {
                                                if(typeof myob.currentFilter[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.currentFilter[category] = [];
                                                }
                                                if(type === 'keyword') {
                                                    myob.currentFilter[category].push({valueToMatch: valueToMatch, inputVal: inputVal});
                                                    inputVals.push(valueToMatch);
                                                } else {
                                                    var filterValueArray = valueToMatch.split(",");
                                                    var i = 0;
                                                    var len = filterValueArray.length;
                                                    var tempVal = '';
                                                    for(i = 0; i < len; i++) {
                                                        innerInputVal = filterValueArray[i].trim();
                                                        innerValueToMatch = innerInputVal;
                                                        if(innerValueToMatch.length > 1) {
                                                            myob.currentFilter[category].push({valueToMatch: innerValueToMatch, inputVal: innerInputVal});
                                                            inputVals.push(innerValueToMatch);
                                                            if(myob.debug) {console.log("... adding '"+innerValueToMatch+"' to '"+category+"'");}
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 'tag':
                                        case 'checkbox':
                                            if(input.is(":checked")){
                                                if(typeof myob.currentFilter[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.currentFilter[category] = [];
                                                }
                                                inputVals.push(valueToMatch);
                                                myob.currentFilter[category].push({valueToMatch: valueToMatch, inputVal: inputVal});
                                                if(myob.debug) {console.log("... adding '"+category+"' to '"+valueToMatch+"'");}
                                            }
                                            break;
                                        case 'favourites':
                                            if(input.is(":checked")){
                                                if(typeof myob.currentFilter[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.currentFilter[category] = [];
                                                }
                                                myob.currentFilter[category].push({valueToMatch: valueToMatch, inputVal: inputVal});
                                                inputVals.push(valueToMatch);
                                                if(myob.debug) {console.log("... adding '"+category+"' to '"+valueToMatch+"'");}
                                            }
                                            break;
                                        case 'number':
                                            var val = parseFloat(input.val());
                                            if(jQuery.isNumeric(val) && val !== 0) {
                                                if(typeof myob.currentFilter[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.currentFilter[category] = [];
                                                }
                                                inputVals.push(input.attr('data-label') + val + ' ');
                                                if(typeof myob.currentFilter[category][0] === 'undefined') {
                                                    myob.currentFilter[category][0] = {};
                                                }
                                                myob.currentFilter[category][0][input.attr('data-dir')] = val;
                                            }
                                            break;
                                        case 'date':
                                            var val = input.val().trim();
                                            if(val !== '0' && val !== '') {
                                                if(typeof myob.currentFilter[category] === "undefined") {
                                                    if(myob.debug) {console.log("adding "+category);}
                                                    myob.currentFilter[category] = {};
                                                }
                                                inputVals.push(input.attr('data-label') + val);
                                                myob.currentFilter[category][0][input.attr('data-dir')] = val;
                                            }
                                            break;
                                    }
                                }
                            );
                            if(typeof myob.currentFilter[category] !== "undefined") {
                                var leftLabel = categoryHolder.find('label.'+myob.groupLabelClass).text();
                                html += "<li><strong>" + leftLabel + ":</strong> <span>" + inputVals.join('</span><span>') + "</span></li>";
                            }
                        }
                    //funny indenting to stay ....
                );
                if(html.length === 0) {
                    html = myob.noFilterSelectedText;
                }
                var targetDomElement = myob.myTableHolder.find('.'+myob.currentSearchFilterClass);
                var title = targetDomElement.attr('data-title');
                if(typeof title === 'undefined') {
                    title = myob.currentFilterText;
                }
                html = "<div><h3>" + title + "</h3><ul>" + html + "</ul></div>";
                targetDomElement.html(html);
                if(myob.myTableHolder.hasClass(myob.filterIsOpenClass)){
                    targetDomElement.hide();
                }
                else {
                    targetDomElement.show();
                }

            },

            //===================================================================
            // SERVER, URL, AND COOKIE INTERACTIONS
            //===================================================================

            retrieveCookieData: function()
            {
                var myob = TableFilterSort;
                myob.favouritesStore = Cookies.getJSON('favouritesStore');
                if(typeof myob.favouritesStore === 'undefined') {
                    myob.favouritesStore = [];
                }
                for (var fav in myob.favouritesStore) {
                    if (myob.favouritesStore.hasOwnProperty(fav)) {
                        var id = myob.favouritesStore[fav];
                        myob.myTableBody.find('#' + id).toggleClass(myob.favouriteClass);
                    }
                }

            },

            findAndApplyGetVariables: function()
            {
                var myob = TableFilterSort;
                var qd = {};
                location.search.substr(1).split("&").forEach(
                    function(item) {
                        var s = item.split("="),
                            k = s[0],
                            v = s[1] && decodeURIComponent(s[1]);
                        //(k in qd) ? qd[k].push(v) : qd[k] = [v]
                        (qd[k] = qd[k] || []).push(v) //short-circuit
                    }
                );
                if(typeof qd.tfs !== 'undefined') {
                    var json = JSON.parse(qd['tfs']);
                    myob.currentFilter = json.f;
                    myob.currentSorter = json.s;
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

        TableFilterSort = jQuery.extend(
            TableFilterSort,
            options
        );

        this.each(
            function(i, el) {
                TableFilterSort.init(holderNumber);
                holderNumber++;
            }
        );

        // Expose public API
        return {
            getVar: function( variableName ) {
                if ( TableFilterSort.hasOwnProperty(variableName)) {
                    return TableFilterSort[variableName];
                }
            },
            setVar: function(variableName, value) {
                TableFilterSort[variableName] = value;
                return this;
            },
            gotoPage: function(pageNumber) {
                TableFilterSort.gotoPage(pageNumber);
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
