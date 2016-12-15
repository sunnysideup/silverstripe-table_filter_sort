/**
 * http://stackoverflow.com/questions/9132347/iterating-through-table-cells-using-jquery
 * http://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
 *
 *
 */
jQuery(document).ready(
    function() {
        if(typeof TableFilterSortTableList !== 'undefined') {
            var i = 0;
            for(i = 0; i < TableFilterSortTableList.length; i++) {
                new TableFilterSortFx(TableFilterSortTableList[i]);
            }
        }

});



function TableFilterSortFx(selector){


    var TableFilterSort = {


        /**
         * turn on to see what is going on in console
         * @var boolean
         */
        debug: true,

        /**
         * selector for holder
         * this is set at the bottom of the TableFilterSortFx method
         * @var jQuery Object
         */
        myTableHolder: null,

        /**
         * this is set at the bottom of the TableFilterSortFx method
         * @var jQuery Object
         */
        myTable: null,

        /**
         * this is set at the bottom of the TableFilterSortFx method
         * @var jQuery Object
         */
        myRows: null,

        /**
         * "Colour" => [Red, Blue, Green]
         * "Size" => [X]
         * @var array
         */
        optionsForFilter:[],

        /**
         * "Colour" => [Red]
         * "Size" => []
         * show TRS where at least one of the values for EVERY category is matched
         * @var array
         */
        currentFilter:[],

        /**
         * starting point for showing rows
         * @type Int
         */
        showFromRow: 0,

        /**
         * rows to show
         * @type Int
         */
        visibleRowCount: 3,

        /**
         * maximum number of checkboxes in the filter before it becomes a text filter
         * @type Int
         */
        maximumNumberOfFilterOptions: 25,

        /**
         * number of milliseconds to check if filter is in use ...
         * @type Int
         */
        intervalForFilterCheck: 200,


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
         * customise the title of the filter button
         * @var string
         */
        filterTitleClearButton: "Clear",

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
        * @var string
        */
        moreDetailsSelector: '.tableFilterSortMoreDetails',

        /**
        * @var string
        */
        filterInputSelector: 'input[data-to-filter]',

        /**
        * @var string
        */
        currentSearchFilterSelector: '.tableFilterSortCurrentSearchHolder',

        /**
        * @var string
        */
        filterFormHolderSelector: '.tableFilterSortFilterFormHolder',

        /**
        * @var string
        */
        sortLinkSelector: 'a.sortable',

        /**
         * @var string
         */
        moreRowEntriesSelector: ".tableFilterSortMoreEntries",

        /**
         * @var string
         */
        matchRowCountSelector: ".match-row-number",

        /**
         * @var string
         */
        minRowSelector: ".min-row-number",

        /**
         * @var string
         */
        maxRowSelector: ".max-row-number",

        /**
         * @var string
         */
        totalRowCountSelector: ".total-row-number",

        /**
         * @var string
         */
        visibleRowCountSelector: ".total-showing-row-number",

        /**
         *
         *
         * Classes
         *
         *
         */

        /**
         * class for rows that should show
         * @type string
         */
        showClass: 'topRow',

        /**
         * class for rows that should not show
         * @type string
         */
        hideClass: 'restRow',

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
        * @var string
        */
        openedClass: 'opened',

        /**
         * @var string
         */
        closedClass: 'closed',

        /**
         * @var string
         */
        filterIsOpenClass: 'filterIsOpen',

        /**
         * @var string
         */
        filterSelectedClass: 'filter-selected',

        /**
         * @var string
         */
        textFilterClass: 'textFilter',

        /**
         * @var string
         */
        checkboxFilterClass: 'checkboxFilter',

        /**
         * @var string
         */
        directFilterLinkClass: 'direct-filter-link',

        /**
         * @var string
         */
        commonContentHolderClass: 'tableFilterSortCommonContentHolder',

        /**
         * @var string
         */
        openFilterFormClass: 'tableFilterSortOpenFilterForm',

        /**
         * @var string
         */
        clearFilterClass: 'tableFilterSortClearFilterForm',

        /**
         * @var string
         */
        filterOptionsHolderClass: 'tableFilterSortFilterFormOptions',

        /**
         * @var string
         */
        filterGroupClass: 'filterColumn',

        /**
         * @var string
         */
        groupLabelClass: 'left',

        /**
         * @var string
         */
        applyFilterClass: 'applyFilter',

        /**
         * @var string
         */
        filterInUseClass: 'tableFilterSortFilterInUse',

        /**
         * @var string
         */
        filterNotInUseClass: 'tableFilterSortFilterNotInUse',

        /**
         * @var string
         */
        noMatchMessageClass: 'no-matches-message',

        /**
         * @var string
         */
        sortAscClass: 'sort-asc',

        /**
         * @var string
         */
        sortDescClass: 'sort-desc',

        /**
         * startup
         *
         */
        init: function(){
            var myObject = this;
            myObject.toggleSlideSetup();
            myObject.clearFilterListener();
            if(myObject.myTable.find(myObject.rowSelector).length > 1){
                myObject.tableFilterSetup();
                myObject.tableHideColsWhichAreAllTheSame();
                myObject.createFilterForm();
                myObject.setupFilterListeners();
                myObject.directFilterLinkListener();
                myObject.setupSortListeners();
                myObject.showAndHideForm();
            }
        },

        /**
         * set up toggle slides ...
         */
        toggleSlideSetup: function(){
            var myObject = this;
            //add toggle
            myObject.myTableHolder.on(
                'click',
                myObject.moreDetailsSelector,
                function(event) {
                    event.preventDefault();
                    var myEl = jQuery(this);
                    var id = myEl.attr("data-rel");
                    jQuery("#"+id).slideToggle("fast");
                    myEl.toggleClass(myObject.openedClass);
                }
            )
            .on(
                'click',
                '.'+myObject.openFilterFormClass,
                function(event) {
                    event.preventDefault();
                    var myEl = jQuery(this);
                    var id = myEl.attr("data-rel");
                    jQuery("#"+id).slideToggle("fast");
                    myEl.toggleClass(myObject.openedClass);
                    myObject.myTableHolder.toggleClass(myObject.filterIsOpenClass);
                    myObject.displayCurrentSearchParameters();
                }
            );
        },

        clearFilterListener: function(){
            var myObject = this;
            //add toggle
            myObject.myTableHolder.on(
                'click',
                '.'+myObject.clearFilterClass,
                function(event) {
                    event.preventDefault();
                    myObject.myTableHolder.find(myObject.filterInputSelector).each(
                        function(i, el){
                            el = jQuery(el);
                            if(el.is(":checkbox")){
                                el.prop('checked', false).trigger('change');
                            }
                            else {
                                el.val('').trigger('change');
                            }
                        }
                    );
                    //clear directly selected items
                    myObject.myTable.find('.' + myObject.directFilterLinkClass).parent().removeClass(myObject.filterSelectedClass);
                    jQuery(myObject.currentSearchFilterSelector).html('');
                    return false;
                }
            );
        },

        displayCurrentSearchParameters: function(){
            var html = "";
            var myObject = this;
            myObject.myTableHolder.find('.'+myObject.filterOptionsHolderClass+ ' .' + myObject.filterGroupClass).each(
                function(i, el){
                    el = jQuery(el);
                    var leftLabel = el.find('label.'+myObject.groupLabelClass).text();
                    if(el.hasClass(myObject.textFilterClass)){
                        var inputVal = el.find('input').val();
                        if(inputVal.length > 0){
                            html += "<strong>" + leftLabel + ":</strong> " + inputVal + "; ";
                        }
                    }
                    else if(el.hasClass(myObject.checkboxFilterClass)){
                        var inputsChecked = "";
                        var list = el.find("ul li");
                        list.each(
                            function(innerI, innerEl){
                                innerEl = jQuery(innerEl);
                                var input = innerEl.find('input');
                                if(input.is(":checked")){
                                    inputsChecked += '<span>' + input.val() + "</span> ";
                                }
                            }
                        );
                        if(inputsChecked.length > 0){
                            html += "<li><strong>" + leftLabel + ":</strong> " + inputsChecked + "</li>";
                        }
                    }
                }
            );
            if(html.length === 0) {
                html = myObject.noFilterSelectedText;
            }
            var title = myObject.myTableHolder.find(myObject.currentSearchFilterSelector).attr('data-title');
            html = "<div><p>" + title + "</p><ul>" + html + "</ul></div>";
            myObject.myTableHolder.find(myObject.currentSearchFilterSelector).html(html);
            if(myObject.myTableHolder.hasClass(myObject.filterIsOpenClass)){
                myObject.myTableHolder.find(myObject.currentSearchFilterSelector).hide();
            }
            else {
                myObject.myTableHolder.find(myObject.currentSearchFilterSelector).show();
            }

        },

        /**
         * find the filters ...
         */
        tableFilterSetup: function() {
            var myObject = this;
            //for each table with specific class ...
            myObject.myRows.find("span[data-filter]").each(
                function(i, el) {
                    el = jQuery(el);
                    var value = el.text();
                    el.addClass(myObject.directFilterLinkClass);
                    var category = el.attr("data-filter");
                    if(value.trim().length > 0) {
                        if(typeof myObject.optionsForFilter[category] === "undefined") {
                            myObject.optionsForFilter[category] = [];
                        }
                        if(myObject.debug) { console.debug("adding "+value+" to "+category);}
                        myObject.optionsForFilter[category][value] = value;
                    }
                }
            );
        },

        /**
         * hide the cells that are all the same
         * and add to common content holder
         */
        tableHideColsWhichAreAllTheSame: function(){
            var myObject = this;
            var title = myObject.myTableHolder.find('.'+ myObject.commonContentHolderClass).attr("data-title");
            if(typeof title !== "undefined") {
                title = "<h3>"+title+"</h3>";
            }
            else {
                title = "";
            }
            var commonContent = '<div class="'+myObject.commonContentHolderClass+'-inner">' + title + "<ul>";
            var commonContentExists = false;
            Object.keys(myObject.optionsForFilter).forEach(
                function(category, categoryIndex) {
                    if(myObject.objectSize(myObject.optionsForFilter, category) === 1) {
                        if(myObject.debug) {console.debug("tableHideColsWhichAreAllTheSame: checking category: "+category);}
                        commonContentExists = true;
                        var commonContentAdded = false;
                        //remove text from span
                        jQuery('span[data-filter="' + category + '"]').each(
                            function(i, el) {
                                el = jQuery(el);
                                if(!commonContentAdded) {
                                    if(el.html() !== ""){
                                        commonContent += "<li>"+category + ":<strong> " + el.html() + "</strong></li>";
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
                                            myObject.myTable.find('th').eq(colNumber).hide();
                                        }
                                        spanParent.hide();
                                    }
                                }
                            }
                        );
                    }
                }
            );
            commonContent += "</ul></div>";
            if(commonContentExists){
                myObject.myTableHolder.find('.' + myObject.commonContentHolderClass).html(commonContent);
            } else {
                myObject.myTableHolder.find('.' + myObject.commonContentHolderClass).remove();
            }
        },

        /**
         * create filter form
         *
         */
        createFilterForm: function() {
            //create html content and add to top of page
            var myObject = this;
            var formHolder = myObject.myTableHolder.find(myObject.filterFormHolderSelector).first();
            var id = myObject.makeID();
            var formType = formHolder.attr("data-form");
            var filterFormTitle = formHolder.attr("data-title");
            if(typeof filterFormTitle === "undefined") {
                filterFormTitle = myObject.filterTitle;
            }
            var clearButtonTitle = formHolder.attr("data-title-clear-button");
            if(typeof clearButtonTitle === "undefined") {
                clearButtonTitle = myObject.filterTitleClearButton;
            }
            var content = '<form>' +
                          '<h3><a href="#'+id+'" class="'+myObject.openFilterFormClass+' button closed" data-rel="'+id+'">'+filterFormTitle+'</a></h3>' +
                          '<h4><a href="#'+id+'" class="'+myObject.clearFilterClass+' button" data-rel="'+id+'">' + clearButtonTitle + '</a></h4>' +
                          '<div id="'+id+'" style="display: none;" class="'+myObject.filterOptionsHolderClass+'">';
            Object.keys(myObject.optionsForFilter).forEach(
                function(category, categoryIndex) {
                    var formTypeFieldSet = jQuery('[data-filter="'+ category +'"]').first().attr('data-form-fieldset');
                    if(formType === formTypeFieldSet){
                        var cleanCategory = '';
                        var categoryID = '';
                        var cleanValue = '';
                        var valueID = '';
                        var count = 0;
                        var optionCount = myObject.objectSize(myObject.optionsForFilter, category);
                        if(optionCount > 1 && optionCount <= myObject.maximumNumberOfFilterOptions) {
                            cleanCategory = category.replace(/\W/g, '');
                            categoryID = cleanCategory+"_IDandNameForLabelInFilterForm";
                            content += '<div id="' + categoryID + '" class="'+myObject.filterGroupClass+' '+myObject.checkboxFilterClass+'">' +
                                       '<label class="'+myObject.groupLabelClass+'">' + category.split('-').join(' ') + '</label>' +
                                       '<ul>';
                            var sortedObject = myObject.objectSort(myObject.optionsForFilter[category]);
                            count = 0;

                            for(var value in sortedObject) {
                                if(sortedObject.hasOwnProperty(value)) {
                                    count++;
                                    cleanValue = category.replace(/\W/g, '');
                                    valueID = cleanValue + "_IDandNameForvalueInFilterForm" + count;
                                    content += '<li class="checkbox">' +
                                               '<input type="checkbox" name="' + valueID + '" id="' + valueID + '" value="' + value.raw2attr() + '" data-to-filter="' + category.raw2attr() + '" />' +
                                               '<label for="' + valueID + '">' + value + '</label>' +
                                               '</li>';
                                }
                            }
                            content += '</ul>' +
                                       '</div>';
                        }
                        else if (optionCount > myObject.maximumNumberOfFilterOptions) {
                            cleanCategory = category.replace(/\W/g, '');
                            categoryID = cleanCategory+"_IDandNameForLabelInFilterForm";
                            content += '<div id="' + categoryID + '"  class="'+myObject.filterGroupClass+' '+myObject.textFilterClass+'">' +
                                       '<label class="left">' + category.split('-').join(' ') + '</label>' +
                                       '<ul>';
                            cleanValue = category.replace(/\W/g, '');
                            valueID = cleanValue + "_IDandNameForvalueInFilterForm" + count;
                            content += '<li>' +
                                       '<input type="text" name="' + valueID + '" id="' + valueID + '" data-to-filter="' + category.raw2attr() + '" />' +
                                       '</li>' +
                                       '</ul>' +
                                       '</div>';
                        }
                    }
                }
            );
            var closeAndApplyFilterText = formHolder.attr("data-title-close-and-apply");
            if(typeof closeAndApplyFilterText === "undefined") {
                closeAndApplyFilterText = myObject.closeAndApplyFilterText;
            }

            content += '<h4 class="'+myObject.applyFilterClass+'">' +
                       '<a href="#'+id+'" class="'+myObject.openFilterFormClass+' button" data-rel="'+id+'">'+closeAndApplyFilterText+'</a></h4>' +
                       '</div>' +
                       '</form>';
            formHolder.html(content);
        },

        showAndHideForm: function()
        {
            var myObject = this;
            window.setInterval(
                function() {
                    if(myObject.myTableHolder.isOnScreen() || myObject.myTableHolder.hasClass(myObject.filterIsOpenClass)) {
                        myObject.myTableHolder.addClass(myObject.filterInUseClass);
                        myObject.myTableHolder.removeClass(myObject.filterNotInUseClass);
                    } else {
                        myObject.myTableHolder.addClass(myObject.filterNotInUseClass);
                        myObject.myTableHolder.removeClass(myObject.filterInUseClass);
                    }
                },
                myObject.intervalForFilterCheck
            );
        },

        /**
         * set up filter listeners ...
         */
        setupFilterListeners: function() {
            var myObject = this;
            var formHolder = myObject.myTableHolder.find(myObject.filterFormHolderSelector);
            formHolder.find('.' + myObject.filterGroupClass + " input").on(
                'keyup',
                function(){
                    var myEl = jQuery(this);
                    myEl.trigger("change");
                }
            )
            .change(
                function(event){
                    if(myObject.debug) {console.debug("==============");console.debug(myObject.currentFilter);}
                    var myElInputChanged = jQuery(this);
                    var categoryToMatch = myElInputChanged.attr("data-to-filter");
                    var valueToMatch = myElInputChanged.val().toLowerCase().trim();
                    var noCheckboxesSelectedAtAll = jQuery(myObject.filterFormHolderSelector + ' input').is(":checked").length === 0;
                    if(myElInputChanged.attr('type') === 'text') {
                        delete myObject.currentFilter[categoryToMatch];
                        if(valueToMatch.length > 1) {
                            if(typeof myObject.currentFilter[categoryToMatch] === "undefined") {
                                if(myObject.debug) {console.log("adding "+categoryToMatch);}
                                myObject.currentFilter[categoryToMatch] = [];
                            }
                            var filterValueArray = valueToMatch.split(" ");
                            for(var i = 0, len = filterValueArray.length; i < len; i++) {
                                var tempVal = filterValueArray[i].trim();
                                if(tempVal.length > 1) {
                                    myObject.currentFilter[categoryToMatch][tempVal] = tempVal;
                                    if(myObject.debug) {console.log("... adding '"+categoryToMatch+"' to '"+valueToMatch+"'");}
                                }
                            }
                        }
                    }
                    else {
                        if(myElInputChanged.is(":checked")){
                            if(typeof myObject.currentFilter[categoryToMatch] === "undefined") {
                                if(myObject.debug) {console.log("adding "+categoryToMatch);}
                                myObject.currentFilter[categoryToMatch] = [];
                            }
                            myObject.currentFilter[categoryToMatch][valueToMatch] = valueToMatch;
                            if(myObject.debug) {console.log("... adding '"+categoryToMatch+"' to '"+valueToMatch+"'");}
                        }
                        else {
                            if(typeof myObject.currentFilter[categoryToMatch] !== "undefined") {
                                if(typeof myObject.currentFilter[categoryToMatch][valueToMatch] !== "undefined") {
                                    if(myObject.debug) {console.log("remove "+valueToMatch+" from "+categoryToMatch);}
                                    delete myObject.currentFilter[categoryToMatch][valueToMatch];
                                }
                                if(myObject.objectSize(myObject.currentFilter, categoryToMatch) === 0) {
                                    if(myObject.debug) {console.log("removing category: "+categoryToMatch);}
                                    delete myObject.currentFilter[categoryToMatch];
                                }
                            }
                        }
                        //no check boxes selected
                        if(noCheckboxesSelectedAtAll) {
                            if(typeof myObject.currentFilter[categoryToMatch] !== "undefined") {
                                if(myObject.debug) {console.log("removing altogether"+categoryToMatch);}
                                delete myObject.currentFilter[categoryToMatch];
                            }
                        }
                    }
                    var matchCount = 0;
                    var totalRowCount = 0;
                    var visibleRowCount = 0;
                    var minRow = myObject.showFromRow;
                    var maxRow = minRow + myObject.visibleRowCount;
                    var noFilter = myObject.myTable.find('tr.'+myObject.notMatchClass).length === 0 ? true : false;
                    myObject.myRows.each(
                        function(i, el) {
                            el = jQuery(el);
                            if(myObject.debug) {console.log("===");}
                            //innocent until proven guilty
                            var rowMatches = true;

                            var stillLookingForCategory = true;

                            //check for each category
                            Object.keys(myObject.currentFilter).forEach(
                                function(categoryToMatch, categoryToMatchIndex) {
                                    if(stillLookingForCategory) {
                                        //lets not assume there is anything
                                        var rowMatchesForFilterGroup = false;

                                        //values selected in category
                                        var stillLookingForValue = true;
                                        Object.keys(myObject.currentFilter[categoryToMatch]).forEach(
                                            function(valueToMatch, valueToMatchIndex) {
                                                if(myObject.debug) {console.log("FILTER - CHECKING: '"+valueToMatch+"' in '"+categoryToMatch+"'");}
                                                //what is the value .. if it matches, the row is OK and we can go to next category ...

                                                if(stillLookingForValue) {
                                                    el.find('span[data-filter="' + categoryToMatch + '"]').each(
                                                        function(innerI, innerEl) {
                                                            innerEl = jQuery(innerEl);
                                                            var value = innerEl.text().toLowerCase();
                                                            if(value.indexOf(valueToMatch) !== -1){
                                                                if(myObject.debug) {console.log("FILTER - MATCH: '"+valueToMatch+"' in '"+categoryToMatch+"'");}
                                                                rowMatchesForFilterGroup = true;
                                                                //break out of each loop
                                                                return false;
                                                            }
                                                            else {
                                                                if(myObject.debug) {console.log("FILTER - NO MATCH: '"+valueToMatch+"' in '"+categoryToMatch+"'");}
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
                            totalRowCount++;
                            //hide or show
                            if(rowMatches){
                                el.addClass(myObject.matchClass).removeClass(myObject.notMatchClass);
                                matchCount++;
                            }
                            else {
                                el.addClass(myObject.notMatchClass).removeClass(myObject.matchClass);
                            }
                            if(matchCount > minRow && matchCount <= maxRow ) {
                                visibleRowCount++;
                                el.addClass(myObject.showClass).removeClass(myObject.hideClass);
                            }
                            else {
                                el.addClass(myObject.hideClass).removeClass(myObject.showClass);

                            }
                        }
                    );
                    if(myObject.myRows.hasClass(myObject.showClass).length){
                        jQuery('.'+myObject.noMatchMessageClass).hide();
                    }
                    else {
                        jQuery('.'+myObject.noMatchMessageClass).show();
                    }
                    myObject.renderPagination(matchCount, minRow, maxRow, totalRowCount, visibleRowCount);
                    if(myObject.debug) {console.debug(myObject.currentFilter);console.debug("==============");}
                }
            );
        },

        directFilterLinkListener: function() {
            var myObject = this;
            myObject.myTable.on(
                'click',
                '.' + myObject.directFilterLinkClass,
                function(event){
                    event.preventDefault();
                    var myEl = jQuery(this);
                    var dataFilter = myEl.attr('data-filter');
                    var filterValue = jQuery.trim(myEl.text());
                    var filterToTriger = myObject.myTableHolder.find('input[data-to-filter="'+ dataFilter + '"][value="'+ filterValue + '"]').first();
                    if(filterToTriger && filterToTriger.is(':checkbox')){
                        if(filterToTriger.prop('checked') === true){
                            filterToTriger.prop('checked', false).trigger('change');
                            myObject.myTableHolder.find('.' + myObject.directFilterLinkClass + '[data-filter="' + dataFilter + '"]')
                                .filter(
                                    function(){
                                        return myEl.text() === filterValue;
                                    }
                                )
                                .parent()
                                .removeClass(myObject.filterSelectedClass);
                        }
                        else {
                            filterToTriger.prop('checked', true).trigger('change');
                            jQuery('.' + myObject.directFilterLinkClass + '[data-filter="' + dataFilter + '"]')
                                .filter(
                                    function(){
                                        return myEl.text() === filterValue;
                                    }
                                )
                                .parent()
                                .addClass(myObject.filterSelectedClass);
                        }
                        myObject.displayCurrentSearchParameters();
                    }
                    else {
                        filterToTriger = myObject.myTableHolder.find('input[data-to-filter="'+ dataFilter + '"]').first();
                        var holder = myObject.myTable
                            .find('.' + myObject.directFilterLinkClass + '[data-filter="' + dataFilter + '"]')
                            .parent();
                        var isFiltered = holder.hasClass(myObject.filterSelectedClass);
                        if(isFiltered){
                            filterToTriger.val('').trigger('change');
                            holder.removeClass(myObject.filterSelectedClass);
                        }
                        else {
                            filterToTriger.val(filterValue).trigger('change');
                            holder.addClass(myObject.filterSelectedClass);
                        }
                    }
                    return false;
                }
            );
        },

        /**
         * set up sorting mechanism
         */
        setupSortListeners: function() {
            var myObject = this;
            var table = myObject.myTable.find(" > tbody");
            myObject.myTableHolder.on(
                "click",
                myObject.sortLinkSelector,
                function(event){
                    event.preventDefault();
                    var myEl = jQuery(this);
                    myObject.myTableHolder.find(myObject.sortLinkSelector)
                        .removeClass(myObject.sortAscClass)
                        .removeClass(myObject.sortDescClass);
                    var dataFilter = myEl.attr("data-filter");
                    var sortOrder = myEl.attr("data-sort-direction");
                    var sortType = myEl.attr("data-sort-type");
                    var arr = [];
                    myObject.myRows.each(
                        function(i, el) {
                            el = jQuery(el);
                            var dataValue = el.find('[data-filter="' + dataFilter + '"]').text();
                            if(sortType === "number") {
                                dataValue = dataValue.replace(/[^\d.-]/g, '');
                                dataValue = parseFloat(dataValue);
                            }
                            else {
                                //do nothing ...
                            }
                            var row = new Array(dataValue, i);
                            arr.push(row);
                        }
                    );
                    arr.sort(myObject.sortMultiDimensionalArray);

                    if(sortOrder === "desc"){
                        arr.reverse();
                        myEl.attr("data-sort-direction", "asc").addClass(myObject.sortDescClass);
                    }
                    else{
                        myEl.attr("data-sort-direction", "desc").addClass(myObject.sortAscClass);
                    }
                    table.empty();
                    var html = '';
                    var matchCount = 0;
                    var totalRowCount = 0;
                    var visibleRowCount = 0;
                    var minRow = myObject.showFromRow;
                    var maxRow = minRow + myObject.visibleRowCount;
                    var noFilter = table.find('tr.'+myObject.notMatchClass).length === 0 ? true : false;
                    var rows = myObject.myRows;
                    arr.forEach(
                        function(entry) {
                            totalRowCount++;
                            html = rows[entry[1]];
                            if(noFilter || jQuery(html).hasClass(myObject.matchClass)) {
                                matchCount++;
                            }
                            if(matchCount > minRow && matchCount <= maxRow) {
                                visibleRowCount++;
                                jQuery(html).addClass(myObject.showClass).removeClass(myObject.hideClass);
                            }
                            else {
                                jQuery(html).addClass(myObject.hideClass).removeClass(myObject.showClass);
                            }
                            table.append(html);
                        }
                    );
                    myObject.renderPagination(matchCount, minRow, maxRow, totalRowCount, visibleRowCount);
                }
            );
            //do this last
            myObject.myTable.find("a.sortable[data-sort-default=true]").click();
        },

        renderPagination: function(matchCount, minRow, maxRow, totalRowCount, visibleRowCount)
        {
            var myObject = this;
            if(totalRowCount > maxRow || minRow > 0) {
                myObject.myTableHolder.find(myObject.moreRowEntriesSelector).show();
            } else {
                myObject.myTableHolder.find(myObject.moreRowEntriesSelector).hide();
            }
            if(matchCount < visibleRowCount) {
                visibleRowCount = matchCount;
                maxRow = minRow + visibleRowCount;
            }
            minRow++;
            myObject.myTableHolder.find(myObject.matchRowCountSelector).text(matchCount);
            myObject.myTableHolder.find(myObject.minRowSelector).text(minRow);
            myObject.myTableHolder.find(myObject.maxRowSelector).text(maxRow);
            myObject.myTableHolder.find(myObject.totalRowCountSelector).text(totalRowCount);
            myObject.myTableHolder.find(myObject.visibleRowCountSelector).text(visibleRowCount);
            jQuery('html, body').animate({
                scrollTop: (myObject.myTableHolder.offset().top - 550)
            }, 200);
        },

        /**
         *
         * @param object object
         * @param string category
         * @return int
         */
        objectSize: function(object, category) {
            var size = 0, key;
            if(typeof object[category] === "undefined") {
                return 0;
            }
            var obj = object[category];
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
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
            for(var i =0; i < sortedObject.length; i++) {
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



    if(jQuery(selector).length > 0) {
        TableFilterSort.myTableHolder = jQuery(selector);
        TableFilterSort.myTable = TableFilterSort.myTableHolder.find(TableFilterSort.tableSelector).first();
        TableFilterSort.myRows = TableFilterSort.myTable.find(TableFilterSort.rowSelector);
        TableFilterSort.init();
    }


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
        }
    };


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
