<?php

namespace Sunnysideup\TableFilterSort\Model;

use SilverStripe\Core\Config\Config;
use SilverStripe\ORM\DataObject;

class TableFilterSortTag extends DataObject
{
    private static $singular_name = 'Tag';

    private static $plural_name = 'Tags';

    private static $table_name = 'TableFilterSortTag';

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
     * @param  int|DataObject $addToObjectOrId
     * @return DataObject
     */
    public static function find_or_create(string $title, $addToObjectOrId)
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

        // add to many many relation
        $obj->TableFilterSortServerSavers()->add($addToObjectOrId);

        return $obj;
    }
}
