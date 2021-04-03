<?php

namespace Sunnysideup\TableFilterSort\Model;

use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\DataObject;

class TableFilterSortServerSaver extends DataObject
{
    private static $singular_name = 'Server Data';

    private static $plural_name = 'Server Data';

    private static $table_name = 'TableFilterSortServerSaver';

    private static $db = [
        'URLSegment' => 'Varchar(50)',
        'Title' => 'Varchar(50)',
        'Author' => 'Varchar(50)',
        'Description' => 'Varchar(200)',
        'ParentPageID' => 'Varchar(200)',
        'Data' => 'Text',
    ];

    private static $many_many = [
        'Tags' => TableFilterSortTag::class,
    ];

    private static $default_sort = [
        'Created' => 'DESC',
    ];

    private static $required_fields = [
        'Title',
        'ParentPageID',
    ];

    private static $summary_fields = [
        'Created' => 'Created',
        'Title' => 'Title',
        'Author' => 'Title',
        'Description' => 'Description',
        'ParentPageID' => 'Show in',
    ];

    private static $field_labels = [
        'Title' => 'Title',
        'Author' => 'Author',
        'Description' => 'Description',
        'ParentPageID' => 'Show in',
        'Tags' => 'Tag',
    ];

    private static $indexes = [
        'Title_ParentPageIDUnique' => [
            'type' => 'unique',
            'columns' => [
                'ParentPageID',
                'Title',
            ],
        ],
        'Title' => true,
        'ParentPageID' => true,
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
     * @param string $parentPageID
     *
     * @return DataObject
     */
    public static function find_or_create($title, $parentPageID)
    {
        $title = trim($title);
        $titleToLower = strtolower($title);

        $className = static::class;
        if (! $title || ! $parentPageID) {
            return $className::create();
        }
        $obj = DataObject::get_one(
            $className,
            'LOWER("Title") =\'' . Convert::raw2sql($titleToLower) . '\' AND ParentPageID = \'' . Convert::raw2sql($parentPageID) . '\'',
            $cacheDataObjectGetOne = false
        );
        if (! $obj) {
            $obj = $className::create();
        }
        $obj->Title = $title;
        $obj->ParentPageID = $parentPageID;

        $obj->write();

        return $obj;
    }

    /**
     * Event handler called before writing to the database.
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();
        if (! $this->Title) {
            $this->Title = rand(0, 99999999999999999);
        }
        $iteration = 2;
        $originalName = $this->Title;
        while ($this->titleExists()) {
            $this->Title = $originalName . ' ' . $iteration;
            ++$iteration;
        }
        $this->URLSegment = urlencode(
            strtolower(
                str_replace(' ', '-', trim($this->Title))
            )
        );
    }

    protected function titleExists()
    {
        return self::get()
            ->filter(['Title' => $this->Title, 'ParentPageID' => $this->ParentPageID])
            ->exclude(['ID' => $this->ID])
            ->count() ? true : false;
    }
}
