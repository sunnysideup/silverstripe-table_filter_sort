/**
 * http://stackoverflow.com/questions/9132347/iterating-through-table-cells-using-jquery
 * http://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
 *
 *
 */



function TableFilterSortFx(selector){


    var TableFilterSort = {


        /**
         * turn on to see what is going on in console
         * @var boolean
         */
        debug: false,

        /**
         * selector for holder
         * @var jQuery Object
         */
        myTableHolder: null,

        /**
         *
         * @var jQuery Object
         */
        myTable: null,

        /**
         * turn on to see what is going on in console
         * @var string
         */
        filterTitle: "Filter Table",

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
         * startup
         *
         */
        init: function(){
            this.toggleSlideSetup();
            if(jQuery(this.myTable).find("tr.tableFilterSortFilterRow").length > 1){
                this.tableFilterSetup();
                this.tableHideColsWhichAreAllTheSame();
                this.createFilterForm();
                this.setupFilterListeners();
                this.setupSortListeners();
            }
        },

        /**
         * set up toggle slides ...
         * we do this last
         */
        toggleSlideSetup: function(){
            //add toggle
            jQuery(this.myTableHolder).on(
                'click',
                'a.tableFilterSortMoreDetails',
                function(event) {
                    event.preventDefault();
                    id = jQuery(this).attr("data-rel");
                    jQuery('#' + id).slideToggle("fast");
                    jQuery(this).toggleClass("opened");
                    jQuery(TableFilterSort.myTableHolder).toggleClass("filterIsOpen");
                }
            );
        },


        /**
         * find the filters ...
         */
        tableFilterSetup: function() {
            var myObject = this;
            //for each table with specific class ...
            jQuery(this.myTable).find("span[data-filter]").each(
                function(i, el) {
                    var value = jQuery(el).text();
                    var category = jQuery(el).attr("data-filter");
                    if(value.trim().length > 0 && category.trim().length) {
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
            var title = jQuery(this.myTableHolder).find(".tableFilterSortCommonContentHolder").attr("data-title");
            if(typeof title !== "undefined") {
                title = "<h3>"+title+"</h3>";
            }
            else {
                title = "";
            }
            var commonContent = "<div class=\"tablefilterSortCommonContentHolder\">"+title+"<ul>";
            var commonContentExists = false;
            Object.keys(myObject.optionsForFilter).forEach(
                function(category, categoryIndex) {
                    if(myObject.objectSize(myObject.optionsForFilter, category) == 1) {
                        if(myObject.debug) {console.debug("tableHideColsWhichAreAllTheSame: checking category: "+category);}
                        commonContentExists = true;
                        //remove text from span
                        jQuery('span[data-filter="' + category + '"]').each(
                            function(i, el) {
                                if(i == 0) {
                                    commonContent += "<li>"+category + ":<strong> " + jQuery(el).html() + "</strong></li>";
                                }
                                var spanParent = jQuery(el).parent();
                                jQuery(el).remove();

                                if(spanParent.is("li")){
                                    jQuery(spanParent).hide();
                                }
                                //if td is empty then remove td and correspoding th
                                else if(jQuery(spanParent).is("td")){
                                    if(jQuery(spanParent).children().length == 0) {
                                        //get column number of td
                                        //get related table header
                                        if(i == 0) {
                                            var colNumber = jQuery(spanParent).parent("tr").children("td").index(spanParent);
                                            jQuery(spanParent).closest('table.tableFilterSortTable').find('th').eq(colNumber).hide();
                                        }
                                        jQuery(spanParent).hide();
                                    }
                                }
                            }
                        );
                    }
                }
            );
            commonContent += "</ul></div>";
            if(commonContentExists){
                jQuery(this.myTableHolder).find(".tableFilterSortCommonContentHolder").html(commonContent);
            }
        },

        /**
         * create filter form
         *
         */
        createFilterForm: function() {
            //create html content and add to top of page
            var myObject = this;
            var id = this.makeID();
            var filterFormTitle = jQuery(this.myTableHolder).find(".tableFilterSortFilterFormHolder").attr("data-title");
            if(typeof filterFormTitle == "undefined") {
                filterFormTitle = this.filterTitle;
            }
            var content = '<form class="tableFilterSortFilterFormInner">'
                                    + '<h3><a href="#'+id+'" class="tableFilterSortMoreDetails" data-rel="'+id+'" class="closed">'+filterFormTitle+'</a></h3>'
                                    + '<div id="'+id+'" style="display: none;" class="tableFilterSortFilterFormOptions">';
            var numberOfRows = jQuery('tr.tableFilterSortFilterRow').length;
            Object.keys(myObject.optionsForFilter).forEach(
                function(category, categoryIndex) {
                    var optionCount = myObject.objectSize(myObject.optionsForFilter, category);
                    if(optionCount > 1 && optionCount < (0.8 * numberOfRows)) {
                        var cleanCategory = category.replace(/\W/g, '');
                        var categoryID = cleanCategory+"_IDandNameForLabelInFilterForm";
                        content += '<div id="' + categoryID + '" class="filterColumn">'
                                        +  '<label class="left">' + category + '</label>'
                                        +  '<ul>';
                        var sortedObject = myObject.objectSort(myObject.optionsForFilter[category]);
                        var count = 0;

                        for(value in sortedObject) {
                                count++;
                                var cleanValue = category.replace(/\W/g, '');
                                var valueID = cleanValue + "_IDandNameForvalueInFilterForm" + count;
                                content += '<li>'
                                                + '<input type="checkbox" name="' + valueID + '" id="' + valueID + '" value="' + value.raw2attr() + '" data-to-filter="' + category.raw2attr() + '" />'
                                                + '<label for="' + valueID + '">' + value + '</label>'
                                                + '</li>';
                        }
                        content += '</ul>'
                                        +  '</div>';
                    }
                    else {
                        //remove it, it is useless now ...
                    }
                }
            );
            content += '</div>'
                            +  '</form>';
            jQuery(this.myTableHolder)
                .find(".tableFilterSortFilterFormHolder")
                .html(content);
            window.setInterval(
                function() {
                    if(jQuery(TableFilterSort.myTableHolder).isOnScreen() || jQuery(TableFilterSort.myTableHolder).hasClass('filterIsOpen')) {
                        jQuery(TableFilterSort.myTableHolder).addClass('tableFilterSortFilterInUse');
                        jQuery(TableFilterSort.myTableHolder).removeClass('tableFilterSortFilterNotInUse');
                    } else {
                        jQuery(TableFilterSort.myTableHolder).addClass('tableFilterSortFilterNotInUse');
                        jQuery(TableFilterSort.myTableHolder).removeClass('tableFilterSortFilterInUse');
                    }
                },
                200
            );
        },


        /**
         * set up filter listeners ...
         */
        setupFilterListeners: function() {
            //add listeners to any change in the checkboxes
            var myObject = this;
            jQuery(this.myTableHolder).find(".tableFilterSortFilterFormInner input").change(
                function(event){
                    if(myObject.debug) {console.debug("==============");console.debug(myObject.currentFilter);}
                    var inputChanged = jQuery(this);
                    var categoryToMatch = inputChanged.attr("data-to-filter");
                    var valueToMatch = inputChanged.val();
                    if(inputChanged.is(":checked")){
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
                            if(myObject.objectSize(myObject.currentFilter, categoryToMatch) == 0) {
                                if(myObject.debug) {console.log("removing category: "+categoryToMatch);}
                                delete myObject.currentFilter[categoryToMatch];
                            }
                        }
                    }
                    //no check boxes selected
                    if(jQuery(".tableFilterSortFilterFormInner input").is(":checked").length == 0) {
                        if(typeof myObject.currentFilter[categoryToMatch] !== "undefined") {
                            if(myObject.debug) {console.log("removing altogether"+categoryToMatch);}
                            delete myObject.currentFilter[categoryToMatch];
                        }
                    }
                    jQuery('tr.tableFilterSortFilterRow').each(
                        function(i, el) {
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
                                                    jQuery(el).find('span[data-filter="' + categoryToMatch + '"]').each(
                                                        function(i, el) {
                                                            var value = jQuery(el).text();
                                                            if(value == valueToMatch){
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
                            //hide or show
                            if(rowMatches){
                                jQuery(el).show();
                            }
                            else {
                                jQuery(el).hide();
                            }
                        }
                    );
                    if(myObject.debug) {console.debug(myObject.currentFilter);console.debug("==============");}
                    jQuery('html, body').animate({
                        scrollTop: jQuery(myObject.myTableHolder).offset().top
                    }, 200);
                }
            );
        },

        /**
         * set up sorting mechanism
         */
        setupSortListeners: function() {
            var myObject = this;
            var table = jQuery(this.myTable).find(" > tbody");
            jQuery(this.myTableHolder).on(
                "click",
                "a.sortable",
                function(event){
                    event.preventDefault();
                    jQuery(myObject.myTableHolder).find("a.sortable")
                        .removeClass("sort-asc")
                        .removeClass("sort-desc");
                    var dataFilter = jQuery(this).attr("data-filter");
                    var sortOrder = jQuery(this).attr("data-sort-direction");
                    var sortType = jQuery(this).attr("data-sort-type");
                    var arr = [];
                    var rows = jQuery(table).find('tr.tableFilterSortFilterRow');
                    rows.each(
                        function(i, el) {
                            var dataValue = jQuery(el).find('[data-filter="' + dataFilter + '"]').text();
                            if(sortType == "number") {
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
                    if(sortOrder == "desc"){
                        arr.reverse();
                        jQuery(this)
                            .attr("data-sort-direction", "asc")
                            .addClass("sort-desc");
                    }
                    else{
                        jQuery(this)
                        .attr("data-sort-direction", "desc")
                        .addClass("sort-asc");
                    }
                    table.empty();
                    arr.forEach(
                        function(entry) {
                            table.append(rows[entry[1]]);
                        }
                    );
                }
            );
            jQuery(this.myTable).find("a.sortable[data-sort-default=true]").click();
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
                if (obj.hasOwnProperty(key)) size++;
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
                sortedObject.push([valueEntry, object[valueEntry]])
            }
            sortedObject.sort(function(a, b) {
                a = a[1];
                b = b[1];
                return a < b ? -1 : (a > b ? 1 : 0);
            });
            var newObject = {};
            for(var i =0; i < sortedObject.length; i++) {
                newObject[sortedObject[i][0]] = sortedObject[i][1];
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
            if (a[0] === b[0]) {
                return 0;
            }
            else {
                return (a[0] < b[0]) ? -1 : 1;
            }
        }

    }

    if(jQuery(selector).length > 0) {
        TableFilterSort.myTableHolder = jQuery(selector);
        TableFilterSort.myTable = jQuery(TableFilterSort.myTableHolder).find("table.tableFilterSortTable").first();
        TableFilterSort.init();
    }
    // Expose public API
    return {
        getVar: function( variableName ) {
            if ( TableFilterSort.hasOwnProperty( variableName ) ) {
                return TableFilterSort[ variableName ];
            }
        },
        setVar: function(variableName, value) {
            TableFilterSort[variableName] = value;
            return this;
        }
    }


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
            ;
};

String.prototype.attr2raw = function(){
/*
    Note: this can be implemented more efficiently by a loop searching for
    ampersands, from start to end of ssource string, and parsing the
    character(s) found immediately after after the ampersand.
    */
    s = ('' + this); /* Forces the conversion to string type. */
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
    */
    /* Decode by reversing the initial order of replacements. */
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
    */
    /* Required check for security! */
    var found = /&[^;]*;?/.match(s);
    if (found.length >0 && found[0] != '&amp;')
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
