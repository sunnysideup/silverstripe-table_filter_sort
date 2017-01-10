<?php


class TableFilterSortServerSaver extends DataObject {


    private static $singular_name = 'Server Data';

    function i18n_singular_name()
    {
        return Config::inst()->get('TableFilterSortServerSaver', 'singular_name');
    }

    private static $plural_name = 'Server Data';

    function i18n_plural_name()
    {
        return Config::inst()->get('TableFilterSortServerSaver', 'plural_name');
    }

    /**
     * returns list of fields as they are exported
     * @return array
     * Field => Label
     */
    // public function getExportFields();



    private static $db = array(
        'Title' => 'Varchar(50)',
        'ParentPageID' => 'Varchar(200)',
        'Data' => 'Text'
    );

    private static $many_many = array(
        'Tags' => 'TableFilterSortTag'
    );

    private static $default_sort = array(
        'Created' => 'DESC'
    );

    private static $required_fields = array(
        'Title',
        'ParentPageID'
    );

    private static $summary_fields = array(
        'Title' => 'Title',
        'ParentPageID' => 'Show in'
    );

    private static $field_labels = array(
        'Title' => 'Title',
        'ParentPageID' => 'Show in',
        'Tags' => 'Tags'
    );

    private static $indexes = array(
        'Title_ParentPageID' => array('type' => 'unique', 'value' => '"ParentPageID", "Title"'),
        'Title' => true,
        'ParentPageID' => true
    );

    /**
     * see README.md for usage ...
     *
     * @param string $title
     * @param string $parentPageID
     * @return DataObject
     */
    public static function find_or_create($title, $parentPageID)
    {
        $title = trim($title);
        $titleToLower = strtolower(($title));
        $className = get_called_class();
        if (! $title || ! $parentPageID) {
            return $className::create();
        }
        $obj = $className::get()
            ->where('LOWER("Title") =\''.Convert::raw2sql($titleToLower).'\' AND ParentPageID = \''.Convert::raw2sql($parentPageID).'\'');
        if ($obj->count() == 0) {
            $obj = $className::create();
        } else {
            $obj = $obj->first();
        }
        $obj->Title = $title;
        $obj->ParentPageID = $parentPageID;

        $obj->write();

        return $obj;
    }


}
