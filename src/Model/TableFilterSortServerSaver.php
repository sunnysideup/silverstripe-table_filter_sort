<?php

namespace Sunnysideup\TableFilterSort\Model;




use SilverStripe\Core\Config\Config;
use Sunnysideup\TableFilterSort\Model\TableFilterSortServerSaver;
use Sunnysideup\TableFilterSort\Model\TableFilterSortTag;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\DataObject;




class TableFilterSortServerSaver extends DataObject
{
    private static $singular_name = 'Server Data';

    public function i18n_singular_name()
    {
        return Config::inst()->get(TableFilterSortServerSaver::class, 'singular_name');
    }

    private static $plural_name = 'Server Data';

    public function i18n_plural_name()
    {
        return Config::inst()->get(TableFilterSortServerSaver::class, 'plural_name');
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
    
    private static $table_name = 'TableFilterSortServerSaver';


/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: private static $db = (case sensitive)
  * NEW: private static $db = (COMPLEX)
  * EXP: Make sure to add a private static $table_name!
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
    private static $db = array(
        'URLSegment' => 'Varchar(50)',
        'Title' => 'Varchar(50)',
        'Author' => 'Varchar(50)',
        'Description' => 'Varchar(200)',
        'ParentPageID' => 'Varchar(200)',
        'Data' => 'Text'
    );

    private static $many_many = array(
        'Tags' => TableFilterSortTag::class
    );

    private static $default_sort = array(
        'Created' => 'DESC'
    );

    private static $required_fields = array(
        'Title',
        'ParentPageID'
    );

    private static $summary_fields = array(
        'Created' => 'Created',
        'Title' => 'Title',
        'Author' => 'Title',
        'Description' => 'Description',
        'ParentPageID' => 'Show in'
    );

    private static $field_labels = array(
        'Title' => 'Title',
        'Author' => 'Author',
        'Description' => 'Description',
        'ParentPageID' => 'Show in',
        'Tags' => 'Tag'
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

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: $className (case sensitive)
  * NEW: $className (COMPLEX)
  * EXP: Check if the class name can still be used as such
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
        $className = get_called_class();
        if (! $title || ! $parentPageID) {

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: $className (case sensitive)
  * NEW: $className (COMPLEX)
  * EXP: Check if the class name can still be used as such
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
            return $className::create();
        }
        $obj = DataObject::get_one(

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: $className (case sensitive)
  * NEW: $className (COMPLEX)
  * EXP: Check if the class name can still be used as such
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
            $className,
            'LOWER("Title") =\''.Convert::raw2sql($titleToLower).'\' AND ParentPageID = \''.Convert::raw2sql($parentPageID).'\'',
            $cacheDataObjectGetOne = false
        );
        if (! $obj) {

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: $className (case sensitive)
  * NEW: $className (COMPLEX)
  * EXP: Check if the class name can still be used as such
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
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
        if (!$this->Title) {
            $this->Title = rand(0, 99999999999999999);
        }
        $iteration = 2;
        $originalName = $this->Title;
        while ($this->titleExists()) {
            $this->Title = $originalName . ' '.$iteration;
            $iteration++;
        }
        $this->URLSegment = urlencode(
            strtolower(
                str_replace(' ', "-", trim($this->Title))
            )
        );
    }

    protected function titleExists()
    {
        return TableFilterSortServerSaver::get()
            ->filter(array('Title' => $this->Title, 'ParentPageID' => $this->ParentPageID))
            ->exclude(array('ID' => $this->ID))
            ->count() ? true : false;
    }
}
