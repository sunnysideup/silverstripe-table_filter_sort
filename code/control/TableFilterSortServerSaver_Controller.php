<?php

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

    public function init()
    {
        parent::init();
        $this->parentPageID = Convert::raw2sql($this->request->param('ID'));
        Requirements::javascript(FRAMEWORK_DIR . '/thirdparty/jquery/jquery.js');
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
            Session::clear('TableFilterSortPostData');
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

        return $this->renderWith($this->class);
    }

    public function start($request)
    {
        $postData = $request->postVars();
        if ($postData) {
            Session::set('TableFilterSortPostData', $postData);
            return Director::absoluteURL($this->Link('save'));
        }
        return '404';
    }

    public function save($request)
    {
        if ($this->dataToSave()) {
            $this->myTitle = 'Save ' . $this->parentPageID . ' ... ';
            return $this->renderWith($this->class);
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
                $tags = array();
                foreach ($data['TagsTempField'] as $tag) {
                    $tag = trim($tag);
                    if ($tag) {
                        $tagObject = TableFilterSortTag::find_or_create($tag, $obj);
                    }
                }
                Session::clear('TableFilterSortPostData');
            } else {
                $form->setMessage('An Error Occurred', 'bad');
            }
        } else {
            $form->setMessage('Please provide title', 'bad');
        }

        return $this->renderWith($this->class);
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
