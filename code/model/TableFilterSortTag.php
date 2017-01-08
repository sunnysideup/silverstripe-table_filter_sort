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
        'TableFilterSortTagFavourites' => 'TableFilterSortTagFavourite'
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
        'Title' => 'unique("Title, ClassName")'
    );

    /**
     * to prevent racing conditions ...
     *
     * @var array
     */
    private static $_cache = array();
    
    /**
     * see README.md for usage ...
     *
     * @param string $title
     * @param bool $showDBAlterationMessage
     * @return DataObject
     */
    public static function find_or_create($title, $addToObject)
    {
        $title = trim($title);
        $titleToLower = strtolower(($title));
        $className = get_called_class();
        $key = $className.'_'.$titleToLower;
        if (isset(self::$_cache[$key])) {
            if ($showDBAlterationMessage) {
                DB::alteration_message('Found '.$className.' with Title = <strong>'.$title.'</strong>');
            }
            return self::$_cache[$key];
        }
        if (! $title) {
            return $className::create();
        }
        $obj = $className::get()
            ->where('LOWER("Title") =\''.Convert::raw2sql($titleToLower).'\'');
        if ($obj->count() == 0) {
            $obj = $className::create();
        } else {
            $obj = $obj->first();
        }
        $obj->Title = $title;

        $obj->write();
        $this->TableFilterSortFavourites()->add($addToObject->ID);

        self::$_cache[$key] = $obj;
        return $obj;
    }


}
