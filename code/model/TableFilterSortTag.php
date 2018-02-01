<?php


class TableFilterSortTag extends DataObject
{
    private static $singular_name = 'Tag';

    public function i18n_singular_name()
    {
        return Config::inst()->get('TableFilterSortTag', 'singular_name');
    }

    private static $plural_name = 'Tags';

    public function i18n_plural_name()
    {
        return Config::inst()->get('TableFilterSortTag', 'plural_name');
    }

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
        $obj = DataObject::get_one(
            'TableFilterSortTag',
            $filter,
            $cacheDataObjectGetOne = false
        );
        if ($obj) {
            $obj = TableFilterSortTag::create($filter);
        }
        $obj->Title = $title;
        $obj->write();

        $obj->TableFilterSortServerSavers()->add($addToObject->ID);

        return $obj;
    }
}
