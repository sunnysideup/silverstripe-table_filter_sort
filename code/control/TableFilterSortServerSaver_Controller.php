<?php

abstract class TableFilterSortServerSaver_Controller extends Controller
{

    /**
     * Default URL handlers - (Action)/(ID)/(OtherID).
     */
    private static $url_segment = 'test';

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
        'save' => true,
        'AddForm' => true,
        'dosave' => true,
        'retrieve' => true
    );


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
            'tfs',
            Config::inst()->get(get_called_class(), 'url_segment'),
            $actionAndOtherLinkVariables
        );
    }

    function index()
    {
        return $this->renderWith($this->class);
    }

    function save($request)
    {
        Session::set('ParentPageID', Convert::raw2sql($request->param('ID')));
        Session::set('RequestData', Convert::raw2sql($request->getVar('data')));

        return $this->renderWith($this->class);
    }

    function dosave($data, $form)
    {
        $title = Convert::raw2sql($data['Title']);
        $ParentPageID = Session::get('ParentPageID');
        if($title && $ParentPageID && $data) {
            $dataToSave = Session::get('RequestData');
            $obj = TableFilterSortServerSaver::find_or_create($title, $ParentPageID);
            $obj->Data = $dataToSave;
            $tags = array();
            foreach($data['TagsTempField'] as $tag) {
                $tag = trim($tag);
                if($tag) {
                    $tagObject = TableFilterSortTag::find_or_create($tag, $obj);
                }
            }
            Session::clear('ParentPageID');
            Session::clear('RequestData');
            $form->setMessage('Saved successfully', 'good');
        } else {
            $form->setMessage('An Error Occurred', 'bad');
        }

        return $this->renderWith($this->class);

    }

    function retrieve($request)
    {
        $this->addHeader('Content-Type', 'application/json');
        $id = intval($request->param('ID'));
        $obj = TableFilterSortServerSaver::get()->byID($id);
        if($obj) {
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
    function MyList()
    {
        $parentPageID = intval($this->request->param('ID'));
        if(! $parentPageID) {
            $parentPageID = Session::get('ParentPageID');
        }

        return TableFilterSortServerSaver::get()->filter(array('ParentPageID' => $parentPageID));
    }


    function AddForm()
    {
        if(
            Session::get('ParentPageID') && Session::get('RequestData')
        ) {
            $singleton = Injector::inst()->get('TableFilterSortServerSaver');
            $fieldLabels = $singleton->FieldLabels();
            $fieldList = FieldList::create(
                TextField::create('Title', $fieldLabels['Title'])
            );
            for($i = 1; $i < 8; $i++) {
                $fieldList->push(TextField::create('TagsTempField['.$i.']', $fieldLabels['Tags']. ' #'.$i));
            }
            $actionTitle = _t('TableFilterSortServerSaver_Controller.SAVE','Save');
            $actionList = FieldList::create(
                FormAction::create('dosave', $actionTitle)
            );
            $requireFields = RequiredFields::create(array('Title', 'TagsTempField'));
            return Form::create($this, 'AddForm', $fieldList, $actionList, $requireFields);
        }
    }



}
