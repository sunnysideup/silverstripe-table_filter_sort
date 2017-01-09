<?php


class TableFilterSortTag extends DataObject {


    private static $singular_name = 'Tag';

    function i18n_singular_name()
    {
        return Config::inst()->get('TableFilterSortTag', 'singular_name');
    }

    private static $plural_name = 'Tags';

    function i18n_plural_name()
    {
        return Config::inst()->get('TableFilterSortTag', 'plural_name');
    }

    /**
     * returns list of fields as they are exported
     * @return array
     * Field => Label
     */
    // public function getExportFields();



    private static $db = array(
        'Title' => 'Varchar(50)'
    );

    private static $belongs_many_many = array(
        'TableFilterSortServerSavers' => 'TableFilterSortServerSaver'
    );

    private static $default_sort = array(
        'Title' => 'ASC'
    );

    private static $required_fields = array(
        'Title'
    );

    private static $summary_fields = array(
        'Title' => 'Title'
    );

    private static $field_labels = array(
        'Title' => 'Title'
    );

    private static $indexes = array(
        'Title' => 'unique("Title")'
    );

    /**
     * see README.md for usage ...
     *
     * @param string $title
     * @param bool $showDBAlterationMessage
     * @return DataObject
     */
    public static function find_or_create($title, $addToObject)
    {
        $title = strtolower(trim($title));
        if (! $title) {
            return TableFilterSortTag::create();
        }
        $filter = array('Title' => $title);
        $obj = TableFilterSortTag::get()->filter($filter);
        if ($obj->count() == 0) {
            $obj = TableFilterSortTag::create($filter);
        } else {
            $obj = $obj->first();
        }
        $obj->Title = $title;
        $obj->write();

        $obj->TableFilterSortServerSavers()->add($addToObject->ID);

        return $obj;
    }


}
