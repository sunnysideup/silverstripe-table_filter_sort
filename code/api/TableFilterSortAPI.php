<?php


class TableFilterSortAPI extends Object
{
    private static $js = array(
        'table_filter_sort/javascript/jsurl.js',
        'table_filter_sort/javascript/js.cookies.js',
        'table_filter_sort/javascript/jquery.simplemodal-1.4.5.js',
        'table_filter_sort/javascript/awesomplete.js',
        'table_filter_sort/javascript/doT.js',
        'table_filter_sort/javascript/TableFilterSort.js'
    );

    private static $css = array(
        'awesomplete',
        'awesomplete.theme',
        'TableFilterSort',
        'TableFilterSort.theme'
    );

    private static $js_settings = [];


    public static function add_setting($key, $value)
    {
        self::$js_settings[$key] = $value;
    }

    public static function add_settings($array)
    {
        self::$js_settings = self::$js_settings + $array;
    }

    public static function remove_setting($key)
    {
        unset(self::$js_settings[$key]);
    }

    public static function reset_settings()
    {
        self::$js_settings = null;
    }

    /**
     *
     * @param  string $tableSelector              e.g. #MyTableHolder
     * @param  array $blockArray                  files not to include (both CSS and JS)
     * @param  string $jqueryLocation             if you like to include jQuery then add link here...
     * @param  boolean $includeInPage             would you like to include the css / js on the page itself?
     * @param  string | array $jsSettings         add JS snippet for settings ...
     */
    public static function include_requirements(
        $tableSelector = '.tfs-holder',
        $blockArray = array(),
        $jqueryLocation = '',
        $includeInPage = false,
        $jsSettings = null
    ) {
        if($jsSettings === null) {
            $jsSettings = self::$js_settings;
        }
        if (is_array($jsSettings)) {
            if(isset($jsSettings['rowRawData'])) {

                $rawDataFieldKey = [];
                $firstRow = true;
                $categoryIndex = 0;
                foreach($jsSettings['rowRawData'] as $rowID => $categories) {
                    if($firstRow) {
                        $rowCount = count($categories);
                    } else {
                        if($rowCount !== count($categories)) {
                            user_error('Bad number of entries in '.$rowID);
                        }
                    }
                    foreach($categories as $category => $values) {
                        if($firstRow) {
                            $shortKey = self::num_2_alpha($categoryIndex);
                            $categoryIndex++;
                            if(array_key_exists($shortKey, $jsSettings['rowRawData'][$rowID])) {
                                user_error('You are using an illegal key in the raw data, namely: '.$shortKey);
                            }
                            $rawDataFieldKey[$category] = $shortKey;
                        } else {
                            if(isset($category, $jsSettings['rowRawData'][$rowID])) {
                                $shortKey = $rawDataFieldKey[$category];
                            } else {
                                user_error('Your rows are not identical: '.$rowID.' has an unknown category: '.$category);
                                print_r($rowID);
                                print_r($values);
                                print_r($jsSettings['rowRawData'][$rowID]);
                            }
                        }
                        $jsSettings['rowRawData'][$rowID][$shortKey] = $values;
                        unset($jsSettings['rowRawData'][$rowID][$category]);
                    }
                    //this needs to be here - after the category loop
                    $firstRow = false;
                }
                $jsSettings['rawDataFieldKey'] = array_flip($rawDataFieldKey);
            }
        }
        $jsSettings = json_encode($jsSettings);
        //this must come first
        if ($tableSelector) {
            $mySelector = str_replace('"', '\\"', $tableSelector);
            //this must come first
            Requirements::customScript(
                '
                    if(Array.isArray(TableFilterSortVars) === false) {
                        var TableFilterSortVars = [];
                    }
                    TableFilterSortVars.push('.$jsSettings.');
                    TableFilterSortVars[TableFilterSortVars.length - 1].mySelector = "'.$mySelector.'";
                ',
                'table_filter_sort'
            );
        }
        $js = Config::inst()->get('TableFilterSortAPI', 'js');
        $css = Config::inst()->get('TableFilterSortAPI', 'css');
        if ($jqueryLocation) {
            array_unshift($js, $jqueryLocation);
        }
        if (is_array($blockArray) && count($blockArray)) {
            $js = array_diff($js, $blockArray);
            $css = array_diff($css, $blockArray);
        }
        if (Director::isDev() && ! $includeInPage) {
            foreach ($css as $link) {
                Requirements::themedCSS($link, 'table_filter_sort');
            }
            foreach ($js as $link) {
                Requirements::javascript($link);
            }
        } else {
            $base = Director::baseFolder().'/';
            //css
            $allCss = '';
            foreach ($css as $link) {
                $link .= '.min';
                $testFiles = array(
                    SSViewer::get_theme_folder().'_table_filter_sort/css/'.$link,
                    'table_filter_sort/css/'.$link
                );
                $hasBeenIncluded = false;
                if ($includeInPage) {
                    foreach ($testFiles as $testFile) {
                        $testFile = $base . $testFile.'.css';
                        if (file_exists($testFile)) {
                            $hasBeenIncluded = true;
                            $allCss .= file_get_contents($testFile);
                            break;
                        }
                    }
                }
                if (! $hasBeenIncluded) {
                    Requirements::themedCSS($link, 'table_filter_sort');
                }
            }
            Requirements::customCSS($allCss, 'table_filter_sort_css');
            //js
            $allJS = '';
            foreach ($js as $link) {
                $link = str_replace('.js', '.min.js', $link);
                $testFile = $base . $link;
                if ($includeInPage && file_exists($testFile)) {
                    $allJS .= file_get_contents($testFile);
                } else {
                    Requirements::javascript($link);
                }
            }
            Requirements::customScript($allJS, 'table_filter_sort_js');
        }
    }

    protected static function num_2_alpha($n)
    {
        for($r = ""; $n >= 0; $n = intval($n / 26) - 1) {
            $r = chr($n%26 + 0x41) . $r;
        }
        return $r;
    }

}
