<?php


class TableFilterSortAPI extends Object
{
    private static $js = array(
        'table_filter_sort/javascript/jsurl.js',
        'table_filter_sort/javascript/js.cookies.js',
        'table_filter_sort/javascript/jquery.simplemodal-1.4.5.js',
        'table_filter_sort/javascript/awesomplete.js',
        'table_filter_sort/javascript/TableFilterSort.js'
    );

    private static $css = array(
        'awesomplete',
        'awesomplete.theme',
        'TableFilterSort',
        'TableFilterSort.theme'
    );

    private static $_jsSettingArray = [];


    public static function add_setting($key, $value)
    {
        self::$_jsSettingArray[$key] = $value;
    }

    public static function add_settings($array)
    {
        foreach ($array as $key => $value) {
            self::$_jsSettingArray[$key] = $value;
        }
    }

    public static function remove_setting($key)
    {
        unset(self::$_jsSettingArray[$key]);
    }

    public static function reset_settings()
    {
        self::$_jsSettingArray = null;
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
        if(! $jsSettings) {
            $jsSettings = json_encode(self::$_jsSettingArray);
        } elseif(is_array($jsSettings)) {
            $jsSettings = json_encode($jsSettings);
        }
        //this must come first
        if($tableSelector) {
            $mySelector = str_replace('"', '\\"', $tableSelector);
            //this must come first
            Requirements::customScript(
                '
                    if(!Array.isArray(TableFilterSortVars)) {
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
        if($jqueryLocation) {
            array_unshift($js, $jqueryLocation);
        }
        if(is_array($blockArray) && count($blockArray)) {
            $js = array_diff($js, $blockArray);
            $css = array_diff($css, $blockArray);
        }
        if(Director::isDev() && ! $includeInPage) {
            foreach($css as $link) {
                Requirements::themedCSS($link, 'table_filter_sort');
            }
            foreach($js as $link) {
                Requirements::javascript($link);
            }
        } else {
            $base = Director::baseFolder().'/';
            //css
            $allCss = '';
            foreach($css as $link) {
                $link .= '.min';
                $testFiles = array(
                    SSViewer::get_theme_folder().'_table_filter_sort/css/'.$link,
                    'table_filter_sort/css/'.$link
                );
                $hasBeenIncluded = false;
                if($includeInPage) {
                    foreach($testFiles as $testFile) {
                        $testFile = $base . $testFile.'.css';
                        if(file_exists($testFile)) {
                            $hasBeenIncluded = true;
                            $allCss .= file_get_contents($testFile);
                            break;
                        }
                    }
                }
                if( ! $hasBeenIncluded) {
                    Requirements::themedCSS($link, 'table_filter_sort');
                }
            }
            Requirements::customCSS($allCss, 'table_filter_sort_css');
            //js
            $allJS = '';
            foreach($js as $link) {
                $link = str_replace('.js', '.min.js', $link);
                $testFile = $base . $link;
                if($includeInPage && file_exists($testFile)) {
                    $allJS .= file_get_contents($testFile);
                } else {
                    Requirements::javascript($link);
                }
            }
            Requirements::customScript($allJS, 'table_filter_sort_js');
        }
    }
}
