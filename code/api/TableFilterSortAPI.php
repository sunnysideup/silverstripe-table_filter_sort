<?php


class TableFilterSortAPI extends Object
{
    private static $js = array(
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

    /**
     *
     * @param  string $tableSelector e.g. #MyTableHolder
     * @param  array $blockArray files not to include (both CSS and JS)
     * @param  string $jqueryLocation if you like to include jQuery then add link here...
     */
    public static function include_requirements(
        $tableSelector = '.tableFilterSortHolder',
        $blockArray = array(),
        $jqueryLocation = ''
    ) {
        //this must come first
        if($tableSelector) {
            //this must come first
            Requirements::customScript(
                '
                    if(typeof TableFilterSortTableList === "undefined") {
                        var TableFilterSortTableList = [];
                    }
                    TableFilterSortTableList.push("'.$tableSelector.'")
                ',
                'table_filter_sort'
            );
        }
        $js = Config::inst()->get('TableFilterSortAPI', 'js');
        $css = Config::inst()->get('TableFilterSortAPI', 'css');
        if($jqueryLocation) {
            array_unshift($js, $jqueryLocation);
        }
        $js = array_diff($js, $blockArray);
        $css = array_diff($css, $blockArray);
        if(Director::isDev() && 11 == 22) {
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
                foreach($testFiles as $testFile) {
                    $testFile = $base . $testFile.'.css';
                    if(file_exists($testFile)) {
                        $allCss .= file_get_contents($testFile);
                        break;
                    }
                }
                if( ! $hasBeenIncluded) {
                    Requirements::themedCSS($link);
                }
            }
            Requirements::customCSS($allCss, 'table_filter_sort_css');
            //js
            $allJS = '';
            foreach($js as $link) {
                $link = str_replace('.js', '.min.js', $link);
                $testFile = $base . $link;
                if(file_exists($testFile)) {
                    $allJS .= file_get_contents($testFile);
                } else {
                    Requirements::javascript($link);
                }
            }
            Requirements::customScript($allJS, 'table_filter_sort_js');
        }

    }
}
