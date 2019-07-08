<?php

namespace Sunnysideup\TableFilterSort\Api;

use SilverStripe\Control\Director;
use SilverStripe\Core\Config\Config;
use SilverStripe\View\Requirements;
use SilverStripe\View\ThemeResourceLoader;
use SilverStripe\View\ViewableData;

class TableFilterSortAPI extends ViewableData
{
    protected static $js_settings = [];

    private static $js = [
        'jsurl',
        'jquery.simplemodal-1.4.5',
        'js.cookies.js',
        'awesomplete',
        'doT',
        'TableFilterSort',
    ];

    private static $css = [
        'awesomplete',
        'awesomplete.theme',
        'TableFilterSort',
        'TableFilterSort.theme',
    ];

    public static function add_setting($key, $value)
    {
        self::$js_settings[$key] = $value;
    }

    public static function add_settings($array)
    {
        self::$js_settings += $array;
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
     * @param  string $tableSelector              e.g. #MyTableHolder
     * @param  array $blockArray                  files not to include (both CSS and JS)
     * @param  string $jqueryLocation             if you like to include jQuery then add link here...
     * @param  boolean $includeInPage             would you like to include the css / js on the page itself?
     * @param  string | array $jsSettings         add JS snippet for settings ...
     */
    public static function include_requirements(
        $tableSelector = '.tfs-holder',
        $blockArray = [],
        $jqueryLocation = '',
        $includeInPage = false,
        $jsSettings = null
    ) {
        if ($jsSettings === null) {
            $jsSettings = self::$js_settings;
        }
        if (isset($jsSettings['rowRawData'])) {
            $jsSettings = self::workOutJSSettings($jsSettings);
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
                    TableFilterSortVars.push(' . $jsSettings . ');
                    TableFilterSortVars[TableFilterSortVars.length - 1].mySelector = "' . $mySelector . '";
                ',
                'table_filter_sort'
            );
        }
        $js = Config::inst()->get(self::class, 'js');
        $css = Config::inst()->get(self::class, 'css');

        //remove jQuery
        if ($jqueryLocation) {
            array_unshift($js, $jqueryLocation);
        }

        //block
        if (is_array($blockArray) && count($blockArray)) {
            $js = array_diff($js, $blockArray);
            $css = array_diff($css, $blockArray);
        }

        if (Director::isDev() || ! $includeInPage) {
            //simple inclusion
            foreach ($css as $link) {
                Requirements::themedCSS('client/css/' . $link, 'table_filter_sort');
            }
            foreach ($js as $link) {
                Requirements::themedJavascript('client/javascript/' . $link, 'table_filter_sort');
            }
        } else {
            //inline inclusion
            $base = Director::baseFolder() . '/';
            $themes = HTMLEditorConfig::getThemes() ?: SSViewer::get_themes();

            //css
            $allCss = '';
            foreach ($css as $link) {
                if (Director::isDev() === false) {
                    $link .= '.min';
                }
                $testFiles = [
                    ThemeResourceLoader::inst()->findThemedCSS($link, $themes),
                    'vendor/sunnysideup/table_filter_sort/client/css/' . $link . '.css',
                ];
                $hasBeenIncluded = false;
                foreach ($testFiles as $testFile) {
                    $testFile = $base . '/' . $testFile;
                    if (file_exists($testFile)) {
                        $hasBeenIncluded = true;
                        $allCss .= "\n\n" . file_get_contents($testFile);
                        break;
                    }
                }
                if (! $hasBeenIncluded) {
                    Requirements::themedCSS($link, 'table_filter_sort');
                }
            }
            if ($allCss) {
                Requirements::customCSS($allCss, 'table_filter_sort_css');
            }

            //js
            $allJS = '';
            foreach ($js as $link) {
                if (Director::isDev() === false) {
                    $link .= '.min';
                }
                $testFile = $base . $link;
                $testFiles = [
                    ThemeResourceLoader::inst()->findThemedJavascript($link . 'js', $themes),
                    'vendor/sunnysideup/table_filter_sort/client/javascript/' . $link . '.js',
                ];
                $hasBeenIncluded = false;
                foreach ($testFiles as $testFile) {
                    $testFile = $base . '/' . $testFile;
                    if (file_exists($testFile)) {
                        $hasBeenIncluded = true;
                        $allJS .= "\n\n" . file_get_contents($testFile);
                        break;
                    }
                }
                if (! $hasBeenIncluded) {
                    Requirements::themedJavascript('sunnysideup/table_filter_sort: client/javascript/' . $link . '.js');
                }
            }
            if ($allJS) {
                Requirements::customScript($allJS, 'table_filter_sort_js');
            }
        }
    }

    protected static function workOutJSSettings($jsSettings)
    {
        $rawDataFieldKey = [];
        $firstRow = true;
        $categoryIndex = 0;
        foreach ($jsSettings['rowRawData'] as $rowID => $categories) {
            if ($firstRow) {
                $rowCount = count($categories);
            } else {
                if ($rowCount !== count($categories)) {
                    user_error('Bad number of entries in ' . $rowID);
                }
            }
            foreach ($categories as $category => $values) {
                if ($firstRow) {
                    $shortKey = self::num_2_alpha($categoryIndex);
                    $categoryIndex++;
                    if (array_key_exists($shortKey, $jsSettings['rowRawData'][$rowID])) {
                        user_error('You are using an illegal key in the raw data, namely: ' . $shortKey);
                    }
                    $rawDataFieldKey[$category] = $shortKey;
                } else {
                    if (isset($category, $jsSettings['rowRawData'][$rowID])) {
                        $shortKey = $rawDataFieldKey[$category];
                    } else {
                        user_error('Your rows are not identical: ' . $rowID . ' has an unknown category: ' . $category);
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

        return $jsSettings;
    }

    protected static function num_2_alpha($n)
    {
        for ($r = ''; $n >= 0; $n = intval($n / 26) - 1) {
            $r = chr($n % 26 + 0x41) . $r;
        }
        return $r;
    }
}
