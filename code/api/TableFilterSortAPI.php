<?php


class TableFilterSortAPI extends Object
{
    /**
     *
     * @param  string $tableSelector e.g. #MyTableHolder
     */
    public static function include_requirements(
        $tableSelector = '.tableFilterSortHolder'
    ) {
        //this must come first
        Requirements::customScript(
            '
                if(typeof TableFilterSortTableList === "undefined") {
                    var TableFilterSortTableList = [];
                }
                TableFilterSortTableList.push("'.$tableSelector.'")
            ',
            'table_filter_sort'
        );
        Requirements::javascript(THIRDPARTY_DIR . '/jquery/jquery.js');
        Requirements::javascript('table_filter_sort/javascript/TableFilterSort.js');
        Requirements::themedCSS('TableFilterSort', 'table_filter_sort');
    }

}
