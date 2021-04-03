<?php

namespace Sunnysideup\TableFilterSort\Control;

use SilverStripe\Control\Controller;
use SilverStripe\Control\Director;
use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Convert;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataList;
use SilverStripe\ORM\DataObject;
use SilverStripe\View\Requirements;
use Sunnysideup\TableFilterSort\Api\TableFilterSortAPI;
use Sunnysideup\TableFilterSort\Model\TableFilterSortServerSaver;
use Sunnysideup\TableFilterSort\Model\TableFilterSortTag;

class TableFilterSortServerSaverController extends Controller
{
    protected $parentPageID;

    /**
     * Default URL handlers - (Action)/(ID)/(OtherID).
     */
    private static $url_segment = 'tfs';

    /**
     * Default URL handlers - (Action)/(ID)/(OtherID).
     */
    private static $url_handlers = [
        '$Action//$ID/$OtherID/$Version' => 'handleAction',
    ];

    /**
     * Defines methods that can be called directly.
     *
     * @var array
     */
    private static $allowed_actions = [
        'index' => true,
        'find' => true,
        'start' => true,
        'save' => true,
        'AddForm' => true,
        'dosave' => true,
        'load' => true,
    ];

    /**
     * @param string $action
     *
     * @return string (Link)
     */
    public function Link($action = null)
    {
        return self::create_link($action);
    }

    public function Title()
    {
        if ($this->myTitle) {
            return $this->myTitle;
        }

        return $this->request->param('Action');
    }

    public function index($request)
    {
        $postData = $request->postVars();
        if ($postData) {
            //just in case ...
            $this->getRequest()->getSession()->clear('TableFilterSortPostData');
            if (isset($postData['ParentPageID'])) {
                $this->parentPageID = $postData['ParentPageID'];

                return Director::absoluteURL($this->Link('find/' . $this->parentPageID));
            }
        }

        return '404';
    }

    public function find($request)
    {
        $this->myTitle = 'Find ' . $this->parentPageID . ' ... ';

        return $this->renderWith('TableFilterSortServerSaverController');
    }

    public function start($request)
    {
        $postData = $request->postVars();
        if ($postData) {
            $this->getRequest()->getSession()->set('TableFilterSortPostData', $postData);

            return Director::absoluteURL($this->Link('save'));
        }

        return '404';
    }

    public function save($request)
    {
        if ($this->dataToSave()) {
            $this->myTitle = 'Save ' . $this->parentPageID . ' ... ';

            return $this->renderWith('TableFilterSortServerSaverController ');
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
                $obj->Description = Convert::raw2sql($data['Description']);
                $obj->Author = Convert::raw2sql($data['Author']);
                $obj->write();
                foreach ($data['TagsTempField'] as $tag) {
                    $tag = trim($tag);
                    if ($tag) {
                        TableFilterSortTag::find_or_create($tag, $obj);
                    }
                }

                $this->getRequest()->getSession()->clear('TableFilterSortPostData');
            } else {
                $form->setMessage('An Error Occurred', 'bad');
            }
        } else {
            $form->setMessage('Please provide title', 'bad');
        }

        return $this->RenderWith('TableFilterSortServerSaverController ');
    }

    public function load($request)
    {
        $this->getResponse()->addHeader('Content-Type', 'application/json');
        $urlSegment = Convert::raw2sql($request->param('ID'));
        $obj = DataObject::get_one(
            TableFilterSortServerSaver::class,
            ['URLSegment' => $urlSegment]
        );
        if ($obj) {
            return json_encode(
                [
                    'Data' => $obj->Data,
                ]
            );
        }

        return '{}';
    }

    /**
     * returns datalist of options for use in template.
     *
     * @return DataList
     */
    public function MyList()
    {
        return TableFilterSortServerSaver::get()->filter(['ParentPageID' => $this->parentPageID]);
    }

    public function AddForm()
    {
        if ($this->dataToSave()) {
            $singleton = Injector::inst()->get(TableFilterSortServerSaver::class);
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
            for ($i = 1; $i < 8; ++$i) {
                $title = $fieldLabels['Tags'] . ' #' . $i;
                $fieldList->push(
                    TextField::create('TagsTempField[' . $i . ']', $title)
                        ->setAttribute('placeholder', $title)
                );
            }
            $actionTitle = _t('TableFilterSortServerSaverController.SAVE', 'Save');
            $actionList = FieldList::create(
                FormAction::create('dosave', $actionTitle)
            );
            $requireFields = RequiredFields::create(['Title']);

            return Form::create($this, 'AddForm', $fieldList, $actionList, $requireFields);
        }
    }

    /**
     * returns ABSOLUTE link to the shopping cart controller.
     *
     * @param null|array|string $actionAndOtherLinkVariables
     *
     * @return string
     */
    protected static function create_link($actionAndOtherLinkVariables = null)
    {
        return Controller::join_links(
            Director::baseURL(),
            Config::inst()->get(static::class, 'url_segment'),
            $actionAndOtherLinkVariables
        );
    }

    protected function init()
    {
        parent::init();
        $this->parentPageID = Convert::raw2sql($this->request->param('ID'));

        Requirements::javascript('silverstripe/admin: thirdparty/jquery/jquery.js');
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

    /**
     * returns an array with three values:
     * ParentPageID
     * Data.
     *
     * @return null|array
     */
    protected function dataToSave()
    {
        $data = $this->getRequest()->getSession()->get('TableFilterSortPostData');
        if ($data) {
            if (isset($data['ParentPageID'])) {
                $this->parentPageID = $data['ParentPageID'];

                return $data;
            }
        }

        return null;
    }
}
