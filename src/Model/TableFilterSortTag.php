<?php

namespace Sunnysideup\TableFilterSort\Model;



use SilverStripe\Core\Config\Config;
use Sunnysideup\TableFilterSort\Model\TableFilterSortTag;
use Sunnysideup\TableFilterSort\Model\TableFilterSortServerSaver;
use SilverStripe\ORM\DataObject;




class TableFilterSortTag extends DataObject
{
    private static $singular_name = 'Tag';

    public function i18n_singular_name()
    {
        return Config::inst()->get(TableFilterSortTag::class, 'singular_name');
    }

    private static $plural_name = 'Tags';

    public function i18n_plural_name()
    {
        return Config::inst()->get(TableFilterSortTag::class, 'plural_name');
    }


/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * OLD: private static $db (case sensitive)
  * NEW: 
    private static $table_name = '[SEARCH_REPLACE_CLASS_NAME_GOES_HERE]';

    private static $db (COMPLEX)
  * EXP: Check that is class indeed extends DataObject and that it is not a data-extension!
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
    
    private static $table_name = 'TableFilterSortTag';


/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: private static $db = (case sensitive)
  * NEW: private static $db = (COMPLEX)
  * EXP: Make sure to add a private static $table_name!
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
    private static $db = array(
        'Title' => 'Varchar(50)'
    );

    private static $belongs_many_many = array(
        'TableFilterSortServerSavers' => TableFilterSortServerSaver::class
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
            TableFilterSortTag::class,
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
