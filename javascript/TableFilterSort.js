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
             * selector for the table
             * @var jQuery Object
             */
            myTable: null,

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
            maximumNumberOfFilterOptions: 25,

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
            millisecondsBetweenActions: 10,

            /**
             * @type array
             */
            validDataTypes: ['number', 'string'], // 'date', 'boolean' to add!


            /**
             * when trying to establish the data-type
             * max
             * @type int
             */
            maxNumberOfValuesToCheck: 500,

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
            sortLinkSelector: 'thead a.sortable',

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
            tagFilterClass: 'textFilter',

            /**
             * @var string
             */
            dateFilterClass: 'dateFilter',

            /**
             * @var string
             */
            numberFilterClass: 'numberFilter',

            /**
             * @var string
             */
            checkboxFilterClass: 'checkboxFilter',

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
             * startup
             *
             */
            init: function(holderNumber){
                var myob = TableFilterSort;

                myob.holderNumber = holderNumber;
                myob.myTableHolder = myTableHolder;
                myob.myTable = myob.myTableHolder.find(myob.tableSelector).first();
                myob.myTableBody = myob.myTable.find(" > tbody");
                myob.resetObjects();
                if(myob.myRows.length > 1){
                    myob.myTableHolder.addClass(myob.loadingClass);
                    window.setTimeout(
                        function() {

                            //collect filter items
                            if(myob.debug) { console.profileEnd();console.profile('filterItemCollector');}
                            myob.filterItemCollector();
                            //look for cols that are the same
                            if(myob.debug) { console.profileEnd();console.profile('tableHideColsWhichAreAllTheSame');}
                            myob.tableHideColsWhichAreAllTheSame();
                            //finalise data dictionary
                            if(myob.debug) { console.profileEnd();console.profile('dataDictionaryCollector');}
                            myob.dataDictionaryCollector();

                            //set up filter listener
                            if(myob.debug) { console.profileEnd();console.profile('setupFilterListeners');}
                            myob.setupFilterListeners();
                            //set up sort listener
                            if(myob.debug) { console.profileEnd();console.profile('setupSortListeners');}
                            myob.setupSortListeners();
                            //add pagination listener
                            if(myob.debug) { console.profileEnd();console.profile('paginationListeners');}
                            myob.paginationListeners();
                            //allow things to slide up and down
                            if(myob.debug) { console.profile('toggleSlideSetup');}
                            myob.toggleSlideSetup();
                            //allow form to be hidden and shown
                            if(myob.debug) { console.profileEnd();console.profile('showAndHideFilterForm');}
                            myob.showAndHideFilterForm();

                            //create filter form
                            if(myob.debug) { console.profileEnd();console.profile('createFilterForm');}
                            myob.createFilterForm();
                            //add direct filter listener
                            if(myob.debug) { console.profileEnd();console.profile('directFilterLinkListener');}
                            myob.directFilterLinkListener();
                            if(myob.debug) { console.profileEnd();}

                            //we are now ready!
                            myob.myTableHolder.removeClass(myob.loadingClass);

                            //show defaults
                            if(myob.debug) { console.profile('runCurrentSort');}
                            myob.runCurrentSort();
                            if(myob.debug) { console.profileEnd(); console.profile('fixTableHeader');}

                            //fix table header
                            myob.fixTableHeader();
                            if(myob.debug) { console.profileEnd();}
                        },
                        myob.millisecondsBetweenActions
                    );
                }
            },

            resetObjects: function()
            {
                var myob = TableFilterSort;
                myob.myRows = myob.myTable.find(myob.rowSelector);
            },

            /**
             * set up toggle slides ...
             */
            toggleSlideSetup: function(){
                var myob = TableFilterSort;
                //add toggle
                myob.myTableHolder.on(
                    'click',
                    myob.showMoreDetailsSelector,
                    function(event) {
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var myRow = myEl.closest('tr');
                        myRow.find(myob.moreDetailsSelector).each(
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
             * find the filters ...
             */
            filterItemCollector: function() {
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

                        //can it be filtered?
                        if(typeof myob.dataDictionary[category]['CanFilter'] === "undefined") {
                            myob.dataDictionary[category]['CanFilter'] =
                                myob.dataDictionary[category]['Options'].length > 1 &&
                                myob.dataDictionary[category]['Options'].length < myob.myRows.length;
                        }

                        //can it be sorted?
                        var sortLink = myob.myTable.find(myob.sortLinkSelector+'[data-sort-field="'+category+'"]').first();
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
                                        a = parseFloat(a.replace(/\D/g,''));
                                        b = parseFloat(b.replace(/\D/g,''));
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

            /**
             * hide the cells that are all the same
             * and add to common content holder
             */
            tableHideColsWhichAreAllTheSame: function(){
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
             * create filter form
             *
             */
            createFilterForm: function() {
                //create html content and add to top of page
                var myob = TableFilterSort;
                var formHolder = myob.myTableHolder.find(myob.filterFormHolderSelector).first();
                var id = myob.makeID();
                var filterFormTitle = formHolder.attr("data-title");
                if(typeof filterFormTitle === "undefined") {
                    filterFormTitle = myob.filterTitle;
                }
                var currentFilterHTML = '';
                if(myob.myTableHolder.find('.' + myob.currentSearchFilterClass).length === 0) {
                    currentFilterHTML = '<div class="'+myob.currentSearchFilterClass+'"></div>';
                }
                var tabIndex = 1;
                var content = '<form>' +
                              currentFilterHTML +
                              '<a href="#'+id+'" class="'+myob.openAndCloseFilterFormClass+' button closed" data-rel="'+id+'">'+filterFormTitle+'</a>' +
                              '<div id="'+id+'" style="display: none;" class="'+myob.filterOptionsHolderClass+'">';
                              '<input class="keyword text" name="Keyword" placeholder="keyword(s)" tabindex="'+tabIndex+'" data-to-filter="*" />';
                var awesompleteFields = [];
                Object.keys(myob.dataDictionary).forEach(
                    function(category, categoryIndex) {
                        tabIndex++;
                        var cleanValue = '';
                        var cleanedValues = [];
                        var valueID = '';
                        var count = 0;
                        var optionCount = myob.dataDictionary[category]['Options'].length;
                        var cleanCategory = category.replace(/\W/g, '');
                        var categoryID = cleanCategory+"_TFC";
                        if(optionCount > 1 && optionCount <= myob.maximumNumberOfFilterOptions) {
                            content += '<div id="' + categoryID + '" class="'+myob.filterGroupClass+' '+myob.checkboxFilterClass+'" data-to-filter="'+category.raw2attr()+'">' +
                                       '<label class="'+myob.groupLabelClass+'">' + category.split('-').join(' ') + '</label>' +
                                       '<ul>';
                            count = 0;
                            for(count = 0; count < optionCount; count++) {
                                var value = myob.dataDictionary[category]['Options'][count];
                                valueID = cleanCategory + "_TFS_" + count;
                                content += '<li class="checkbox">' +
                                           '<input class="checkbox" type="checkbox" name="' + valueID + '" id="' + valueID + '" value="' + value.raw2attr() + '" tabindex="'+tabIndex+'" />' +
                                           '<label for="' + valueID + '">' + value + '</label>' +
                                           '</li>';
                            }
                            content += '</ul>' +
                                       '</div>';
                        }
                        else if (
                            optionCount > myob.maximumNumberOfFilterOptions &&
                            myob.dataDictionary[category]['DataType'] === 'string'
                        ) {
                            valueID = cleanCategory+"_TFC_0";
                            content += '<div id="' + categoryID + '"  class="'+myob.filterGroupClass+' '+myob.tagFilterClass+'"  data-to-filter="'+category.raw2attr()+'">' +
                                       '<label class="'+myob.groupLabelClass+'">' + category.split('-').join(' ') + '</label>' +
                                       '<ul>';
                            content += '<li>' +
                                       '<input class="text" type="text" name="' + valueID + '" id="' + valueID + '" class="awesomplete" />' +
                                       '</li>' +
                                       '</ul>' +
                                       '</div>';
                            awesompleteFields.push([category, valueID]);
                        }
                        else if (
                            optionCount > myob.maximumNumberOfFilterOptions &&
                            myob.dataDictionary[category]['DataType'] === 'number'
                        ) {
                            //to be completed
                        }
                    }
                );
                var closeAndApplyFilterText = formHolder.attr("data-title-close-and-apply");
                if(typeof closeAndApplyFilterText === "undefined") {
                    closeAndApplyFilterText = myob.closeAndApplyFilterText;
                }
                content += '' +
                           '<div class="'+myob.applyFilterClass+'">' +
                           '<a href="#'+id+'" class="'+myob.openAndCloseFilterFormClass+' button" data-rel="'+id+'">'+closeAndApplyFilterText+'</a>' +
                           '</div>' +
                           '</div>' +
                           '</form>';
                formHolder.html(content);
                var i = 0;
                var input;
                for(i = 0; i < awesompleteFields.length; i++) {
                    category = awesompleteFields[i][0];
                    valueID = awesompleteFields[i][1];
                    input = document.getElementById(valueID);
                    new Awesomplete(
                        input,
                        {
                            list: myob.dataDictionary[category]['Options'],
                            autoFirst: true,
                            filter: function(text, input) {
                                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
                            },

                            replace: function(text) {
                                var before = this.input.value.match(/^.+,\s*|/)[0];
                                this.input.value = before + text + ', ';
                            }
                        }
                    );
                }
            },

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
                    }
                );
            },

            startRowManipulation: function()
            {
                var myob = TableFilterSort;
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
            },

            endRowManipulation: function()
            {
                var myob = TableFilterSort;
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
                var i = 0;
                if(pageCount > 1) {
                      for(i = 0; i < pageCount; i++ ) {
                        if(currentPage === i) {
                            pageHTML += '<span>['+(i+1)+']</span>';
                        } else {
                            pageHTML += '<a href="#" data-page="'+i+'">'+(i+1)+'</a> ';
                         }
                         pageHTML += ' ';
                     }
                     myob.myTableHolder.find(myob.moreRowEntriesSelector).show();
                } else {
                    myob.myTableHolder.find(myob.moreRowEntriesSelector).hide();
                }
                minRow++;
                myob.myTableHolder.find(myob.matchRowCountSelector).text(matchCount);
                myob.myTableHolder.find(myob.minRowSelector).text(minRow);
                myob.myTableHolder.find(myob.maxRowSelector).text(maxRow);
                myob.myTableHolder.find(myob.totalRowCountSelector).text(totalRowCount);
                myob.myTableHolder.find(myob.visibleRowCountSelector).text(actualVisibleRowCount);
                myob.myTableHolder.find(myob.paginationSelector).html(pageHTML);
                myob.myTable.show();
                myob.myTableHolder.removeClass(myob.loadingClass);
                jQuery('html, body').animate({
                    scrollTop: (myob.myTableHolder.offset().top - 550)
                }, 200);
                myob.resetObjects();
            },

            /**
             * set up filter listeners ...
             */
            setupFilterListeners: function() {
                var myob = TableFilterSort;
                var formHolder = myob.myTableHolder.find(myob.filterFormHolderSelector);
                myob.myTableHolder.on(
                    'click',
                    '.' + myob.openAndCloseFilterFormClass,
                    function(event) {
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var id = myEl.attr("data-rel");
                        jQuery("#"+id).slideToggle("fast");
                        myob.myTableHolder.toggleClass(myob.filterIsOpenClass);
                        if(myob.myTableHolder.hasClass(myob.filterIsOpenClass)) {
                            //filter is now open
                        } else {
                            myob.applyFilter();
                        }
                    }
                );
            },

            /**
             * set up sorting mechanism
             */
            setupSortListeners: function() {
                var myob = TableFilterSort;
                myob.myTable.on(
                    "click",
                    myob.sortLinkSelector,
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        myob.showFromRow = 0;
                        myob.startRowManipulation();
                        myob.myTable.find(myob.sortLinkSelector)
                        .removeClass(myob.sortAscClass)
                        .removeClass(myob.sortDescClass);
                        window.setTimeout(
                            function() {
                                var category = myEl.attr("data-sort-field");
                                var sortOrder = myEl.attr("data-sort-direction");
                                var sortType = myEl.attr("data-sort-type");
                                if(typeof sortType === 'undefined') {
                                    sortType = myob.dataDictionary[category]['DataType'];
                                }
                                var arr = [];
                                myob.myRows.each(
                                    function(i, el) {
                                        var row = jQuery(el);
                                        var dataValue = row.find('[data-filter="' + category + '"]').text();
                                        if(sortType === "number") {
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
                                if(sortOrder === "desc"){
                                    arr.reverse();
                                    myEl.attr("data-sort-direction", "asc").addClass(myob.sortDescClass);
                                }
                                else{
                                    myEl.attr("data-sort-direction", "desc").addClass(myob.sortAscClass);
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
                                            Object.keys(myob.currentFilter[categoryToMatch]).forEach(
                                                function(valueToMatch, valueToMatchIndex) {
                                                    if(myob.debug) {console.log("FILTER - CHECKING: '"+valueToMatch+"' in '"+categoryToMatch+"'");}
                                                    //what is the value .. if it matches, the row is OK and we can go to next category ...
                                                    if(stillLookingForValue) {
                                                        row.find('span[data-filter="' + categoryToMatch + '"]').each(
                                                            function(innerI, innerEl) {
                                                                innerEl = jQuery(innerEl);
                                                                var value = innerEl.text().toLowerCase();
                                                                switch(myob.dataDictionary[categoryToMatch]['DataType']) {
                                                                    case 'keyword':
                                                                        if(value.indexOf(valueToMatch) !== -1){
                                                                            rowMatchesForFilterGroup = true;
                                                                        }
                                                                        break;
                                                                    case 'string':
                                                                    case 'number':
                                                                    default:
                                                                        if(value == valueToMatch){
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
                                            );
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


            runCurrentSort: function() {
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


            /**
             * basically runs the filter as per usual
             * after stuff has been selected.
             */
            directFilterLinkListener: function() {
                var myob = TableFilterSort;
                myob.myTableBody.on(
                    'click',
                    'span[data-filter]',
                    function(event){
                        event.preventDefault();
                        var myEl = jQuery(this);
                        var category = myEl.attr('data-filter');
                        var filterValue = jQuery.trim(myEl.text());
                        var filterToTriger = myob.myTableHolder
                            .find(myob.filterFormHolderSelector)
                            .find('div[data-to-filter="'+ category + '"] input[value="'+ filterValue + '"]')
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
                        } else  {
                            filterToTriger = myob.myTableHolder
                                .find(myob.filterFormHolderSelector)
                                .find('div[data-to-filter="'+ category + '"] input')
                                .first();
                            filterToTriger.val(filterValue);
                        }
                        myob.applyFilter();
                        return false;
                    }
                );
            },

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
                myob.myTableHolder
                    .find('.'+myob.filterOptionsHolderClass+ ' .' + myob.filterGroupClass)
                    .each(
                        function(i, el){
                            categoryHolder = jQuery(el);
                            category = categoryHolder.attr('data-to-filter');
                            type = myob.dataDictionary[category]['DataType'];
                            var inputVals = [];
                            categoryHolder.find('input').each(
                                function(i, input) {
                                    input = jQuery(input);
                                    var inputVal = input.val();
                                    var valueToMatch = inputVal.toLowerCase();
                                    if(categoryHolder.hasClass(myob.tagFilterClass)) {
                                        if(valueToMatch.length > 1) {
                                            if(typeof myob.currentFilter[category] === "undefined") {
                                                if(myob.debug) {console.log("adding "+category);}
                                                myob.currentFilter[category] = {};
                                            }
                                            var filterValueArray = valueToMatch.split(",");
                                            var i = 0;
                                            var len = filterValueArray.length;
                                            var tempVal = '';
                                            for(i = 0; i < len; i++) {
                                                innerInputVal = filterValueArray[i].trim();
                                                innerValueToMatch = innerInputVal;
                                                if(innerValueToMatch.length > 1) {
                                                    myob.currentFilter[category][innerValueToMatch] = innerInputVal;
                                                    inputVals.push(innerInputVal);
                                                    if(myob.debug) {console.log("... adding '"+innerValueToMatch+"' to '"+category+"'");}
                                                }
                                            }
                                        }
                                    }
                                    else if(categoryHolder.hasClass(myob.checkboxFilterClass)) {
                                        if(input.is(":checked")){
                                            if(typeof myob.currentFilter[category] === "undefined") {
                                                if(myob.debug) {console.log("adding "+category);}
                                                myob.currentFilter[category] = {};
                                            }
                                            myob.currentFilter[category][valueToMatch] = inputVal;
                                            inputVals.push(inputVal);
                                            if(myob.debug) {console.log("... adding '"+category+"' to '"+valueToMatch+"'");}
                                        }
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

            fixTableHeader: function()
            {
                var myob = this;
                if(myob.hasFixedTableHeader) {
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

                }
            },

            /**
             *
             * @param object object
             * @return int
             */
            objectSize: function(object) {
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
             * @param object object
             * @return object
             */
            objectSort: function(object){
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
             * returns random string
             * @return string
             */
            makeID:function() {
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
            sortMultiDimensionalArray: function(a, b) {
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
