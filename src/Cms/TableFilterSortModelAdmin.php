<?php

namespace Sunnysideup\TableFilterSort\Cms;

use SilverStripe\Admin\ModelAdmin;
use Sunnysideup\TableFilterSort\Model\TableFilterSortServerSaver;

/**
 *@ author nicolaas[at] sunny side up .co .nz
 *
 *
 *
 **/
class TableFilterSortModelAdmin extends ModelAdmin
{
    private static $managed_models = [
        TableFilterSortServerSaver::class,
    ];

    private static $url_segment = 'table-filter-sort';

    private static $menu_title = 'Filters / Sorts';

    private static $menu_icon = 'table_filter_sort/images/treeicons/TableFilterSortModelAdmin.png';
}
