<?php

namespace Sunnysideup\TableFilterSort\Cms;


use Sunnysideup\TableFilterSort\Model\TableFilterSortServerSaver;
use SilverStripe\Admin\ModelAdmin;


/**
 *@ author nicolaas[at] sunny side up .co .nz
 *
 *
 *
 **/
class TableFilterSortModelAdmin extends ModelAdmin
{
    private static $managed_models = array(
        TableFilterSortServerSaver::class
    );

    private static $url_segment = 'table-filter-sort';

    private static $menu_title = 'Filters / Sorts';

    private static $menu_icon = 'table_filter_sort/images/treeicons/TableFilterSortModelAdmin.png';
}
