<?php

class TableFilterSortFavourite_Controller extends Controller {

    /**
     * Defines methods that can be called directly
     * @var array
     */
    private static $allowed_actions = array(
        'create' => true
    );

    function create($request)
    {
        $parentPageID = Convert::raw2sql($request->param('ID'));
        $data = Convert::raw2sql(json_decode($request->get('data')));
    }

    function AddForm()
    {
        $singleton = Injector::inst()->get('TableFilterSortFavourite');
        $fieldLabels = $singleton->FieldLabels();
        $fieldList = FieldList::create(
            TextField::create('Title', $fieldLabels['Title']),
            TextField::create('TagsTempField', $fieldLabels['Tags']),
        );
        if($isNew) {
            $acitonTitle = _t('TableFilterSortFavourite_Controller.CREATE','Create');
        } else {
            $acitonTitle = _t('TableFilterSortFavourite_Controller.UPDATE','Update');
        }
        $actionList = FieldList::create(
            FormAction::create('doAdd', $actionTitle)
        );
        $requireFields = RequiredFields::create(array('Title', 'TagsTempField'));
        return Form::create($this, 'AddForm', $fieldList, $actionList, $requireFields);
    }

    function save($data, $form)
    {

    }

    function retrieve($request)
    {
        $id = intval($request->param('ID'));
        $obj = TableFilterSortFavourite::get()->byID($id);
        if($obj) {
            return json_encode(
                array(
                    'Data' => $obj->Data
                )
            );
        }
    }

    /**
     * returns datalist of options for use in template
     * @param  [type] $request [description]
     * @return [type]          [description]
     */
    function list($request)
    {
        $className = $request->param('ID');
        if(class_exists($className)) {
            return $className::get_list();
        }
    }


}
