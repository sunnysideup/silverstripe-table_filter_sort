<?php
/**
 *@ author nicolaas[at] sunny side up .co .nz
 *
 *
 *
 **/
class TableFilterSortModelAdmin extends ModelAdmin
{
    private static $managed_models = array(
        'TableFilterSortServerSaver'
    );

    private static $url_segment = 'table-filter-sort';

    private static $menu_title = 'Filters / Sorts';
}
