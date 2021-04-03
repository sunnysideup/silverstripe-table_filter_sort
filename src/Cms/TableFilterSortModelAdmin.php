<?php

namespace Sunnysideup\TableFilterSort\Cms;

use SilverStripe\Admin\ModelAdmin;
use Sunnysideup\TableFilterSort\Model\TableFilterSortServerSaver;

if (defined('SS_TABLE_FILTER_SORT_SHOW_MOODEL_ADMIN')) {
    /**
     *@ author nicolaas[at] sunny side up .co .nz
     */
    class TableFilterSortModelAdmin extends ModelAdmin
    {
        private static $managed_models = [
            TableFilterSortServerSaver::class,
        ];

        private static $url_segment = 'table-filter-sort';

        private static $menu_title = 'Filters / Sorts';

        private static $menu_icon = 'sunnysideup/table_filter_sort: client/images/treeicons/TableFilterSortModelAdmin.png';
    }
}
