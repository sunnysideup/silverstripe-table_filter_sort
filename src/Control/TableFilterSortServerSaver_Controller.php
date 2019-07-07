<?php

namespace Sunnysideup\TableFilterSort\Control;

use Controller;
use Director;
use Config;
use Convert;
use Requirements;
use TableFilterSortAPI;
use TableFilterSortServerSaver;
use TableFilterSortTag;
use DataObject;
use Injector;
use FieldList;
use TextField;
use TextareaField;
use FormAction;
use RequiredFields;
use Form;
use session;


class TableFilterSortServerSaver_Controller extends Controller
{

    /**
     * Default URL handlers - (Action)/(ID)/(OtherID).
     */
    private static $url_segment = 'tfs';

    /**
     * Default URL handlers - (Action)/(ID)/(OtherID).
     */
    private static $url_handlers = array(
        '$Action//$ID/$OtherID/$Version' => 'handleAction',
    );

    /**
     * Defines methods that can be called directly
     * @var array
     */
    private static $allowed_actions = array(
        'index' => true,
        'find' => true,
        'start' => true,
        'save' => true,
        'AddForm' => true,
        'dosave' => true,
        'load' => true
    );

    protected $parentPageID = null;

    /**
     * @param string $action
     *
     * @return string (Link)
     */
    public function Link($action = null)
    {
        return self::create_link($action);
    }



    /**
     * returns ABSOLUTE link to the shopping cart controller.
     * @param null | array | string $actionAndOtherLinkVariables
     * @return string
     */
    protected static function create_link($actionAndOtherLinkVariables = null)
    {
        return Controller::join_links(
            Director::baseURL(),
            Config::inst()->get(get_called_class(), 'url_segment'),
            $actionAndOtherLinkVariables
        );
    }


/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * OLD:     public function init() (ignore case)
  * NEW:     protected function init() (COMPLEX)
  * EXP: Controller init functions are now protected  please check that is a controller.
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
    protected function init()
    {
        parent::init();
        $this->parentPageID = Convert::raw2sql($this->request->param('ID'));

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: FRAMEWORK_DIR (ignore case)
  * NEW: SilverStripe\Core\Manifest\ModuleLoader::getModule('silverstripe/framework')->getResource('UPGRADE-FIX-REQUIRED.php')->getRelativePath() (COMPLEX)
  * EXP: Please review update and fix as required
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
        Requirements::javascript(SilverStripe\Core\Manifest\ModuleLoader::getModule('silverstripe/framework')->getResource('UPGRADE-FIX-REQUIRED.php')->getRelativePath() . '/thirdparty/jquery/jquery.js');
        TableFilterSortAPI::include_requirements();
        Requirements::customScript('
            jQuery(document).ready(
                function() {
                    jQuery(\'body\').on(
                        \'click\',
                        \'a.load\',
                        function(event) {
                            event.preventDefault();
                            var url = jQuery(this).attr("href");
                            window.top.history.pushState(null, null, url);
                            window.top.jQuery.modal.close();
                            return false;
                        }
                    );
                    jQuery(\'a.load\').each(
                        function(i, el) {
                            var myEl = jQuery(el);
                            var baseURL = window.top.location.protocol + "//" + window.top.location.host + window.top.location.pathname;
                            var url = baseURL + "?load=" + jQuery(myEl).attr("href");
                            jQuery(myEl).attr("href", url);
                        }
                    );
                }
            )
        ');
    }

    public function Title()
    {
        if ($this->myTitle) {
            return $this->myTitle;
        } else {
            return $this->request->param('Action');
        }
    }

    public function index($request)
    {
        $postData = $request->postVars();
        if ($postData) {
            //just in case ...

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: Session:: (case sensitive)
  * NEW: SilverStripe\Control\Controller::curr()->getRequest()->getSession()-> (COMPLEX)
  * EXP: If THIS is a controller than you can write: $this->getRequest(). You can also try to access the HTTPRequest directly. 
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
            SilverStripe\Control\Controller::curr()->getRequest()->getSession()->clear('TableFilterSortPostData');
            if (isset($postData['ParentPageID'])) {
                $this->parentPageID = $postData['ParentPageID'];
                return Director::absoluteURL($this->Link('find/'.$this->parentPageID));
            }
        }
        return '404';
    }

    public function find($request)
    {
        $this->myTitle = 'Find ' . $this->parentPageID . ' ... ';


/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: ->RenderWith( (ignore case)
  * NEW: ->RenderWith( (COMPLEX)
  * EXP: Check that the template location is still valid!
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
        return $this->RenderWith(get_class($this));
    }

    public function start($request)
    {
        $postData = $request->postVars();
        if ($postData) {

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: Session:: (case sensitive)
  * NEW: SilverStripe\Control\Controller::curr()->getRequest()->getSession()-> (COMPLEX)
  * EXP: If THIS is a controller than you can write: $this->getRequest(). You can also try to access the HTTPRequest directly. 
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
            SilverStripe\Control\Controller::curr()->getRequest()->getSession()->set('TableFilterSortPostData', $postData);
            return Director::absoluteURL($this->Link('save'));
        }
        return '404';
    }

    public function save($request)
    {
        if ($this->dataToSave()) {
            $this->myTitle = 'Save ' . $this->parentPageID . ' ... ';

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: ->RenderWith( (ignore case)
  * NEW: ->RenderWith( (COMPLEX)
  * EXP: Check that the template location is still valid!
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
            return $this->RenderWith(get_class($this));
        }
        return 'NO DATA TO BE SAVED ...';
    }

    public function dosave($data, $form)
    {
        $title = Convert::raw2sql($data['Title']);
        if ($title) {
            $dataToSave = $this->dataToSave();
            if ($dataToSave) {
                $obj = TableFilterSortServerSaver::find_or_create($title, $this->parentPageID);
                $obj->Data = json_encode($dataToSave);
                $obj->Description = Convert::raw2sql($data["Description"]);
                $obj->Author = Convert::raw2sql($data["Author"]);
                $obj->write();
                $tags = [];
                foreach ($data['TagsTempField'] as $tag) {
                    $tag = trim($tag);
                    if ($tag) {
                        $tagObject = TableFilterSortTag::find_or_create($tag, $obj);
                    }
                }

/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: Session:: (case sensitive)
  * NEW: SilverStripe\Control\Controller::curr()->getRequest()->getSession()-> (COMPLEX)
  * EXP: If THIS is a controller than you can write: $this->getRequest(). You can also try to access the HTTPRequest directly. 
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
                SilverStripe\Control\Controller::curr()->getRequest()->getSession()->clear('TableFilterSortPostData');
            } else {
                $form->setMessage('An Error Occurred', 'bad');
            }
        } else {
            $form->setMessage('Please provide title', 'bad');
        }


/**
  * ### @@@@ START REPLACEMENT @@@@ ###
  * WHY: upgrade to SS4
  * OLD: ->RenderWith( (ignore case)
  * NEW: ->RenderWith( (COMPLEX)
  * EXP: Check that the template location is still valid!
  * ### @@@@ STOP REPLACEMENT @@@@ ###
  */
        return $this->RenderWith(get_class($this));
    }

    public function load($request)
    {
        $this->getResponse()->addHeader('Content-Type', 'application/json');
        $urlSegment = Convert::raw2sql($request->param('ID'));
        $obj = DataObject::get_one(
            'TableFilterSortServerSaver',
            array('URLSegment' => $urlSegment)
        );
        if ($obj) {
            return json_encode(
                array(
                    'Data' => $obj->Data
                )
            );
        }
        return '{}';
    }

    /**
     * returns datalist of options for use in template
     * @param  [type] $request [description]
     * @return [type]          [description]
     */
    public function MyList()
    {
        return TableFilterSortServerSaver::get()->filter(array('ParentPageID' => $this->parentPageID));
    }


    public function AddForm()
    {
        if (
            $this->dataToSave()
        ) {
            $singleton = Injector::inst()->get('TableFilterSortServerSaver');
            $fieldLabels = $singleton->FieldLabels();
            $fieldList = FieldList::create(
                TextField::create('Title', $fieldLabels['Title'])
                    ->setMaxLength(50)
                    ->setAttribute('placeholder', $fieldLabels['Title']),
                TextField::create('Author', $fieldLabels['Author'])
                    ->setMaxLength(50)
                    ->setAttribute('placeholder', $fieldLabels['Author']),
                TextareaField::create('Description', $fieldLabels['Description'])
                    ->setAttribute('placeholder', $fieldLabels['Description'])
            );
            for ($i = 1; $i < 8; $i++) {
                $title = $fieldLabels['Tags']. ' #'.$i;
                $fieldList->push(
                    TextField::create('TagsTempField['.$i.']', $title)
                        ->setAttribute('placeholder', $title)
                );
            }
            $actionTitle = _t('TableFilterSortServerSaver_Controller.SAVE', 'Save');
            $actionList = FieldList::create(
                FormAction::create('dosave', $actionTitle)
            );
            $requireFields = RequiredFields::create(array('Title'));
            return Form::create($this, 'AddForm', $fieldList, $actionList, $requireFields);
        }
    }

    /**
     * returns an array with three values:
     * ParentPageID
     * Data
     *
     * @return null | array
     */
    protected function dataToSave()
    {
        $data = session::get('TableFilterSortPostData');
        if ($data) {
            if (isset($data["ParentPageID"])) {
                $this->parentPageID = $data["ParentPageID"];
                return $data;
            }
        }
    }
}
