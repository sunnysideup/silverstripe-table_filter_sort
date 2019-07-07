<?php

namespace Sunnysideup\TableFilterSort\Model;

use SilverStripe\Core\Config\Config;
use SilverStripe\ORM\DataObject;

class TableFilterSortTag extends DataObject
{
    private static $singular_name = 'Tag';

    private static $plural_name = 'Tags';

    /**
     * ### @@@@ START REPLACEMENT @@@@ ###
     * OLD: private static $db (case sensitive)
     * NEW:
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
    private static $db = [
        'Title' => 'Varchar(50)',
    ];

    private static $belongs_many_many = [
        'TableFilterSortServerSavers' => TableFilterSortServerSaver::class,
    ];

    private static $default_sort = [
        'Title' => 'ASC',
    ];

    private static $required_fields = [
        'Title',
    ];

    private static $summary_fields = [
        'Title' => 'Title',
    ];

    private static $field_labels = [
        'Title' => 'Title',
    ];

    private static $indexes = [
        'Title' => 'unique("Title")',
    ];

    public function i18n_singular_name()
    {
        return Config::inst()->get(self::class, 'singular_name');
    }

    public function i18n_plural_name()
    {
        return Config::inst()->get(self::class, 'plural_name');
    }

    /**
     * see README.md for usage ...
     *
     * @param string $title
     * @param bool $addToObject
     * @return DataObject
     */
    public static function find_or_create($title, $addToObject)
    {
        $title = strtolower(trim($title));
        if (! $title) {
            return self::create();
        }
        $filter = ['Title' => $title];
        $obj = DataObject::get_one(
            self::class,
            $filter,
            $cacheDataObjectGetOne = false
        );
        if ($obj) {
            $obj = self::create($filter);
        }
        $obj->Title = $title;
        $obj->write();

        $obj->TableFilterSortServerSavers()->add($addToObject->ID);

        return $obj;
    }
}
