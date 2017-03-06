<?php



function create_test()
{
    $lipsum = new LoremIpsum();
    $type = 'Test Product';
    $producer = 'Sunny Side Up';
    $colours = array(
        'orange',
        'red',
        'blue',
        'indigo',
        'violet',
        'green',
        'yellow',
        'Crazy Dots'
    );
    $sizes = array(
        'Small',
        'Medium',
        'Large',
        'X-Large',
        'XX-Large'
    );
    $veg = array(
        'Artichoke',
        'Artichoke Large',
        'ArtichokeLarge',
        'ArtichokeTest',
        'Arugula',
        'Asparagus',
        'Aubergine (UK) = Eggplant (US)',
        'Amaranth',
        'Legumes',
        'Alfalfa sprouts',
        'Azuki beans (or adzuki)',
        'Bean sprouts',
        'Black beans',
        'Black-eyed peas',
        'Borlotti bean',
        'Broad beans',
        'Chickpeas, Garbanzos, or ceci beans',
        'Green beans',
        'Kidney beans',
        'Lentils',
        'Lima beans or Butter bean',
        'Mung beans',
        'Navy beans',
        'Pinto beans',
        'Runner beans',
        'Split peas',
        'Soy beans',
        'Peas',
        'Mangetout or Snap peas',
        'Beet greens (see also chard)',
        'Bok choy (known as Bok choy in UK and US)',
        'Broccoflower (a hybrid)',
        'Broccoli',
        'Brussels sprouts',
        'Cabbage',
        'Calabrese',
        'Carrots',
        'Cauliflower',
        'Celery',
        'Chard',
        'Collard greens',
        'Corn salad',
        'Endive',
        'Fiddleheads (young coiled fern leaves)',
        'Frisee',
        'Fennel',
        'Herbs and spices',
        'Anise',
        'Basil',
        'Caraway',
        'Cilantro seeds are Coriander',
        'Chamomile',
        'Dill',
        'Fennel',
        'Lavender',
        'Lemon Grass',
        'Marjoram',
        'Oregano',
        'Parsley',
        'Rosemary',
        'Sage',
        'Thyme',
        'Kale',
        'Kohlrabi',
        'Lettuce Lactuca sativa',
        'Maize (UK) = Corn (US) = Sweetcorn (actually a grain)',
        'Mushrooms (actually a fungus, not a plant)',
        'Mustard greens',
        'Nettles',
        'New Zealand spinach',
        'Okra',
        'Onion family',
        'Chives',
        'Garlic',
        'Leek Allium porrum',
        'Onion',
        'Shallot',
        'Spring onion (UK) == Green onion (US) == Scallion',
        'Parsley',
        'Peppers (biologically fruits, but taxed as vegetables)',
        'Green pepper and Red pepper == bell pepper == pimento',
        'Chili pepper == Capsicum',
        'Jalapeño',
        'Habanero',
        'Paprika',
        'Tabasco pepper',
        'Cayenne pepper',
        'Radicchio',
        'Rhubarb',
        'Root vegetables',
        'Beetroot (UK) == Beet (US)',
        'mangel-wurzel: a variety of beet used mostly as cattlefeed',
        'Carrot',
        'Celeriac',
        'Daikon',
        'Ginger',
        'Parsnip',
        'Rutabaga',
        'Turnip',
        'Radish',
        'Swede (UK) == Rutabaga (US)',
        'Turnip',
        'Wasabi',
        'Horseradish',
        'White radish',
        'Salsify (usually Purple Salsify or Oyster Plant)',
        'Skirret',
        'Spinach',
        'Topinambur',
        'Squashes (biologically fruits, but taxed as vegetables)',
        'Acorn squash',
        'Butternut squash',
        'Banana squash',
        'Courgette (UK) == Zucchini (US)',
        'Cucumber (biologically fruits, but taxed as vegetables)',
        'Delicata',
        'Gem squash',
        'Hubbard squash',
        'Marrow (UK) == Squash (US) Cucurbita maxima',
        'Patty pans',
        'Pumpkin',
        'Spaghetti squash',
        'Tat soi',
        'Tomato (biologically a fruit, but taxed as a vegetable)',
        'Tubers',
        'Jicama',
        'Jerusalem artichoke',
        'Potato',
        'Sunchokes',
        'Sweet potato',
        'Taro',
        'Yam (Yam and Sweet Potato are NOT the same)',
        'Turnip greens',
        'Water chestnut',
        'Watercress',
        'Zucchini'
    );
    $html = '';
    $limit = isset($_GET['i']) ? $_GET['i'] : 300;
    for($i = 0; $i < $limit; $i++) {
        $html .= '
        <tr class="tfstr hide" id="tfs'.$i.'">
            <td>
                <a href="#" class="more">+</a>
                <a href="#" class="adf" title="Add to Favourites">♥</a>
                <span data-filter="SKU">'.($i+1).'</span><br />
                <p style="display: none;" class="hidden">
                    Some more content goes here.
                </p>
            </td>
            <td><span data-filter="Type">'.$type.'</span></td>
            <td><span data-filter="Original Producer">'.$producer.'</span></td>
            <td><span data-filter="Colour" class="dl">'.$colours[rand(0, count($colours)-1)].'</span></td>
            <td><span data-filter="Size">'.$sizes[rand(0,count($sizes)-1)].'</span></td>
            <td><span data-filter="Weight">'.rand(1,100).'kg.</span></td>
            <td><span data-filter="Price">$'.(rand(0,99999)/100).'</span></td>
            <td><span data-filter="Rating">'.rand(1,5).' Stars</span></td>
            <td>
                <p>'.$lipsum->sentence().'</p>
                <div style="display: none;" class="hidden">
                    <ul>
                        <li><span data-filter="Tags" class="dl">'.$veg[rand(0, count($veg)-1)].'</span></li>
                        <li><span data-filter="Tags" class="dl">'.$veg[rand(0, count($veg)-1)].'</span></li>
                        <li><span data-filter="Tags" class="dl">'.$veg[rand(0, count($veg)-1)].'</span></li>
                    </ul>
                </div>
            </td>
        </tr>';
    }
    return $html;
}

$html = create_test();




?><!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Example Filter Table</title>
        <link rel="stylesheet" type="text/css" href="../../css/awesomplete.css?x=<?php echo rand(0,9999999999) ?>">
        <link rel="stylesheet" type="text/css" href="../../css/awesomplete.theme.css?x=<?php echo rand(0,9999999999) ?>">
        <link rel="stylesheet" type="text/css" href="../../css/TableFilterSort.css?x=<?php echo rand(0,9999999999) ?>">
        <link rel="stylesheet" type="text/css" href="../../css/TableFilterSort.theme.css?x=<?php echo rand(0,9999999999) ?>">
    </head>
    <body>

        <header>
            <h1>Example of a Filter and Sort Table ... </h1>
            <p style="text-align: center;">
                You can set the number of rows by adding a GET veriable <strong>i</strong> to the current URL. (e.g. ...example.php?i=500).
            </p>
            <p>Below the table is an examle of the <a href="#html">HTML</a> you need to use.</p>
        </header>

        <main
            class="tfs-holder loading"
            data-filters-parent-page-id="Test Filters"
            data-favourites-parent-page-id="Test Favourites"
        >
            <div class="loading-screen">
                <p class="loader">loading ...</p>
                <div class="load-bar">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
            </div>
            <div class="tfs-filter-form-holder">
                <div class="tfs-filter-form-holder-section top left">
                    <ul>
                        <li class="tfs-open-filter-form tfs-action open-filter">
                            <a href="#">Create Filter</a>
                        </li>
                        <li class="tfs-save-and-load load filters tfs-action">
                            <a href="#">Load Filter</a>
                        </li>
                        <li class="quick-keyword tfs-action">
                            <input name="QuickKeyword" placeholder="Quick Search ..." />
                        </li>
                    </ul>
                </div>
                <div class="tfs-filter-form-holder-section top right">
                    <ul>

                        <li class="tfs-save-and-load save filters tfs-action">
                            <a href="#">Save Filter</a>
                        </li>

                        <li class="tfs-current-search-holder" data-no-filter-text="No filter selected"></li>
                        <li class="tfs-match-count-holder">
                            <strong>Results:</strong>
                            <span class="match-row-number">0</span> /
                            <span class="total-row-number">0</span>
                        </li>
                        <li class="tfs-no-match-count-holder">
                            <strong>Total Rows:</strong>
                            <span class="total-row-number">0</span>
                        </li>
                    </ul>
                </div>

                <div class="tfs-filter-form-inner"></div>

                <div class="tfs-filter-form-holder-section bottom left">
                    <ul>
                        <li class="tfs-clear tfs-action">
                            <a href="#">Clear Filter</a>
                        </li>
                    </ul>
                </div>

                <div class="tfs-filter-form-holder-section bottom right">
                    <ul>
                        <li class="tfs-open-filter-form tfs-action">
                            <a href="#">Close and Apply</a>
                        </li>
                    </ul>
                </div>

            </div>

            <div class="tfs-more-entries pagination-top">
                <span class="line">
                    <span class="pagination"></span>
                </span>
            </div>

            <div class="tfs-common-content-holder" data-title="Common Info"></div>

            <div class="tfs-current-favourites">
                <ul>
                    <li class="filter-for-favourites tfs-action">
                        <a href="#">Show Favourites</a>
                    </li>
                    <li class="tfs-save-and-load load favourites tfs-action">
                        <a href="#">Load Favourites</a>
                    </li>
                    <li class="tfs-save-and-load save favourites tfs-action">
                        <a href="#">Save Favourites</a>
                    </li>
                </ul>
            </div>
            <table class="tfs-table">
                <thead>
                    <tr>
                        <th scope="col">
                            <a href="#"
                                class="sortable"
                                data-sort-field="SKU"
                                data-sort-direction="asc"
                                data-sort-type="number"
                            >SKU</a>
                        </th>
                        <th scope="col">Type</th>
                        <th scope="col">Producer</th>
                        <th scope="col">Colour</th>
                        <th scope="col">
                            <a href="#"
                                class="sortable"
                                data-sort-field="Size"
                                data-sort-direction="asc"
                                data-sort-type="string"
                            >Size</a>
                        </th>
                        <th scope="col">
                            <a href="#"
                                class="sortable"
                                data-sort-field="Weight"
                                data-sort-direction="asc"
                                data-sort-type="number"
                            >Weight</a>
                        </th>
                        <th scope="col">
                            <a href="#"
                                class="sortable"
                                data-sort-field="Price"
                                data-sort-direction="desc"
                                data-sort-type="number"
                                data-sort-default="true"
                            >Price</a>
                        </th>
                        <th scope="col">
                            <a href="#"
                                class="sortable"
                                data-sort-field="Rating"
                                data-sort-direction="desc"
                                data-sort-type="number"
                            >Rating</a>
                        </th>
                        <th scope="col">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <?php echo $html ?>
                </tbody>
            </table>

            <p class="message warning no-matches-message">No entries match your filter</p>

            <div class="tfs-more-entries pagination-bottom">
                <span class="line">
                    <span class="pagination"></span>
                </span>
            </div>

            <div class="tfs-more-entries-always-show">
                <span class="line">
                    <strong>Entries per Page:</strong>
                    <span class="total-showing-row-number">
                        <input type="number" min="1" max="10000" step="50" name="VisibleRowCount" class="visible-row-count" />
                    </span> -
                    <strong>Currently Shown Entries:</strong>
                    <span class="min-row-number">0</span> - <span class="max-row-number">0</span>
                </span>
            </div>

        </main>

        <script src="https://code.jquery.com/jquery-git.min.js"></script>
        <script src="../../javascript/jsurl.js?x=<?php echo rand(0,9999999999) ?>"></script>
        <script src="../../javascript/jquery.simplemodal-1.4.5?x=<?php echo rand(0,9999999999) ?>"></script>
        <script src="../../javascript/js.cookies.js?x=<?php echo rand(0,9999999999) ?>"></script>
        <script src="../../javascript/awesomplete.js?x=<?php echo rand(0,9999999999) ?>"></script>
        <script src="../../javascript/TableFilterSort.js?x=<?php echo rand(0,9999999999) ?>"></script>
        <script type="text/javascript">
            jQuery('.tfs-holder').tableFilterSort();
        </script>
        <script>
            var html = jQuery('.tfs-holder').first().clone();
            var firstRow = html.find('table tbody tr').get(0).outerHTML;
            html.find('table tbody').remove();
            html.find('table').append('\n\n<tbody>\n        ' + firstRow + '\n</tbody>'+'\n\n\n                ');
            html = html.html();
            html = html.split('<').join('&lt;')
            html = html.split('>').join('&gt;')
            document.write('<h2 id="html">Template Example</h2><pre style="white-space: pre-wrap; word-wrap: break-word;">&lt;main class="tfs-holder"&gt;' + html + '&lt;/main&gt;</pre>');
        </script>

</html>

<?php


/**
 * Lorem Ipsum Generator
 *
 * PHP version 5.3+
 *
 * Licensed under The MIT License.
 * Redistribution of these files must retain the above copyright notice.
 *
 * @author    Josh Sherman <josh@gravityblvd.com>
 * @copyright Copyright 2014, 2015, 2016 Josh Sherman
 * @license   http://www.opensource.org/licenses/mit-license.html
 * @link      https://github.com/joshtronic/php-loremipsum
 */
class LoremIpsum
{
    /**
     * First
     *
     * Whether or not we should be starting the string with "Lorem ipsum..."
     *
     * @access private
     * @var    boolean
     */
    private $first = true;
    /**
     * Words
     *
     * A lorem ipsum vocabulary of sorts. Not a complete list as I'm unsure if
     * a complete list exists and if so, where to get it.
     *
     * @access private
     * @var    array
     */
    public $words = array(
        // Lorem ipsum...
        'lorem',        'ipsum',       'dolor',        'sit',
        'amet',         'consectetur', 'adipiscing',   'elit',
        // The rest of the vocabulary
        'a',            'ac',          'accumsan',     'ad',
        'aenean',       'aliquam',     'aliquet',      'ante',
        'aptent',       'arcu',        'at',           'auctor',
        'augue',        'bibendum',    'blandit',      'class',
        'commodo',      'condimentum', 'congue',       'consequat',
        'conubia',      'convallis',   'cras',         'cubilia',
        'cum',          'curabitur',   'curae',        'cursus',
        'dapibus',      'diam',        'dictum',       'dictumst',
        'dignissim',    'dis',         'donec',        'dui',
        'duis',         'egestas',     'eget',         'eleifend',
        'elementum',    'enim',        'erat',         'eros',
        'est',          'et',          'etiam',        'eu',
        'euismod',      'facilisi',    'facilisis',    'fames',
        'faucibus',     'felis',       'fermentum',    'feugiat',
        'fringilla',    'fusce',       'gravida',      'habitant',
        'habitasse',    'hac',         'hendrerit',    'himenaeos',
        'iaculis',      'id',          'imperdiet',    'in',
        'inceptos',     'integer',     'interdum',     'justo',
        'lacinia',      'lacus',       'laoreet',      'lectus',
        'leo',          'libero',      'ligula',       'litora',
        'lobortis',     'luctus',      'maecenas',     'magna',
        'magnis',       'malesuada',   'massa',        'mattis',
        'mauris',       'metus',       'mi',           'molestie',
        'mollis',       'montes',      'morbi',        'mus',
        'nam',          'nascetur',    'natoque',      'nec',
        'neque',        'netus',       'nibh',         'nisi',
        'nisl',         'non',         'nostra',       'nulla',
        'nullam',       'nunc',        'odio',         'orci',
        'ornare',       'parturient',  'pellentesque', 'penatibus',
        'per',          'pharetra',    'phasellus',    'placerat',
        'platea',       'porta',       'porttitor',    'posuere',
        'potenti',      'praesent',    'pretium',      'primis',
        'proin',        'pulvinar',    'purus',        'quam',
        'quis',         'quisque',     'rhoncus',      'ridiculus',
        'risus',        'rutrum',      'sagittis',     'sapien',
        'scelerisque',  'sed',         'sem',          'semper',
        'senectus',     'sociis',      'sociosqu',     'sodales',
        'sollicitudin', 'suscipit',    'suspendisse',  'taciti',
        'tellus',       'tempor',      'tempus',       'tincidunt',
        'torquent',     'tortor',      'tristique',    'turpis',
        'ullamcorper',  'ultrices',    'ultricies',    'urna',
        'ut',           'varius',      'vehicula',     'vel',
        'velit',        'venenatis',   'vestibulum',   'vitae',
        'vivamus',      'viverra',     'volutpat',     'vulputate',
    );
    /**
     * Word
     *
     * Generates a single word of lorem ipsum.
     *
     * @access public
     * @param  mixed  $tags string or array of HTML tags to wrap output with
     * @return string generated lorem ipsum word
     */
    public function word($tags = false)
    {
        return $this->words(1, $tags);
    }
    /**
     * Words Array
     *
     * Generates an array of lorem ipsum words.
     *
     * @access public
     * @param  integer $count how many words to generate
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @return array   generated lorem ipsum words
     */
    public function wordsArray($count = 1, $tags = false)
    {
        return $this->words($count, $tags, true);
    }
    /**
     * Words
     *
     * Generates words of lorem ipsum.
     *
     * @access public
     * @param  integer $count how many words to generate
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @param  boolean $array whether an array or a string should be returned
     * @return mixed   string or array of generated lorem ipsum words
     */
    public function words($count = 1, $tags = false, $array = false)
    {
        $words      = array();
        $word_count = 0;
        // Shuffles and appends the word list to compensate for count
        // arguments that exceed the size of our vocabulary list
        while ($word_count < $count) {
            $shuffle = true;
            while ($shuffle) {
                $this->shuffle();
                // Checks that the last word of the list and the first word of
                // the list that's about to be appended are not the same
                if (!$word_count || $words[$word_count - 1] != $this->words[0]) {
                    $words      = array_merge($words, $this->words);
                    $word_count = count($words);
                    $shuffle    = false;
                }
            }
        }
        $words = array_slice($words, 0, $count);
        return $this->output($words, $tags, $array);
    }
    /**
     * Sentence
     *
     * Generates a full sentence of lorem ipsum.
     *
     * @access public
     * @param  mixed  $tags string or array of HTML tags to wrap output with
     * @return string generated lorem ipsum sentence
     */
    public function sentence($tags = false)
    {
        return $this->sentences(1, $tags);
    }
    /**
     * Sentences Array
     *
     * Generates an array of lorem ipsum sentences.
     *
     * @access public
     * @param  integer $count how many sentences to generate
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @return array   generated lorem ipsum sentences
     */
    public function sentencesArray($count = 1, $tags = false)
    {
        return $this->sentences($count, $tags, true);
    }
    /**
     * Sentences
     *
     * Generates sentences of lorem ipsum.
     *
     * @access public
     * @param  integer $count how many sentences to generate
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @param  boolean $array whether an array or a string should be returned
     * @return mixed   string or array of generated lorem ipsum sentences
     */
    public function sentences($count = 1, $tags = false, $array = false)
    {
        $sentences = array();
        for ($i = 0; $i < $count; $i++) {
            $sentences[] = $this->wordsArray($this->gauss(24.46, 5.08));
        }
        $this->punctuate($sentences);
        return $this->output($sentences, $tags, $array);
    }
    /**
     * Paragraph
     *
     * Generates a full paragraph of lorem ipsum.
     *
     * @access public
     * @param  mixed  $tags string or array of HTML tags to wrap output with
     * @return string generated lorem ipsum paragraph
     */
    public function paragraph($tags = false)
    {
        return $this->paragraphs(1, $tags);
    }
    /**
     * Paragraph Array
     *
     * Generates an array of lorem ipsum paragraphs.
     *
     * @access public
     * @param  integer $count how many paragraphs to generate
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @return array   generated lorem ipsum paragraphs
     */
    public function paragraphsArray($count = 1, $tags = false)
    {
        return $this->paragraphs($count, $tags, true);
    }
    /**
     * Paragraphss
     *
     * Generates paragraphs of lorem ipsum.
     *
     * @access public
     * @param  integer $count how many paragraphs to generate
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @param  boolean $array whether an array or a string should be returned
     * @return mixed   string or array of generated lorem ipsum paragraphs
     */
    public function paragraphs($count = 1, $tags = false, $array = false)
    {
        $paragraphs = array();
        for ($i = 0; $i < $count; $i++) {
            $paragraphs[] = $this->sentences($this->gauss(5.8, 1.93));
        }
        return $this->output($paragraphs, $tags, $array, "\n\n");
    }
    /**
     * Gaussian Distribution
     *
     * This is some smart kid stuff. I went ahead and combined the N(0,1) logic
     * with the N(m,s) logic into this single function. Used to calculate the
     * number of words in a sentence, the number of sentences in a paragraph
     * and the distribution of commas in a sentence.
     *
     * @access private
     * @param  double  $mean average value
     * @param  double  $std_dev stadnard deviation
     * @return double  calculated distribution
     */
    private function gauss($mean, $std_dev)
    {
        $x = mt_rand() / mt_getrandmax();
        $y = mt_rand() / mt_getrandmax();
        $z = sqrt(-2 * log($x)) * cos(2 * pi() * $y);
        return $z * $std_dev + $mean;
    }
    /**
     * Shuffle
     *
     * Shuffles the words, forcing "Lorem ipsum..." at the beginning if it is
     * the first time we are generating the text.
     *
     * @access private
     */
    private function shuffle()
    {
        if ($this->first) {
            $this->first = array_slice($this->words, 0, 8);
            $this->words = array_slice($this->words, 8);
            shuffle($this->words);
            $this->words = $this->first + $this->words;
            $this->first = false;
        } else {
            shuffle($this->words);
        }
    }
    /**
     * Punctuate
     *
     * Applies punctuation to a sentence. This includes a period at the end,
     * the injection of commas as well as capitalizing the first letter of the
     * first word of the sentence.
     *
     * @access private
     * @param  array   $sentences the sentences we would like to punctuate
     */
    private function punctuate(&$sentences)
    {
        foreach ($sentences as $key => $sentence) {
            $words = count($sentence);
            // Only worry about commas on sentences longer than 4 words
            if ($words > 4) {
                $mean    = log($words, 6);
                $std_dev = $mean / 6;
                $commas  = round($this->gauss($mean, $std_dev));
                for ($i = 1; $i <= $commas; $i++) {
                    $word = round($i * $words / ($commas + 1));
                    if ($word < ($words - 1) && $word > 0) {
                        $sentence[$word] .= ',';
                    }
                }
            }
            $sentences[$key] = ucfirst(implode(' ', $sentence) . '.');
        }
    }
    /**
     * Output
     *
     * Does the rest of the processing of the strings. This includes wrapping
     * the strings in HTML tags, handling transformations with the ability of
     * back referencing and determining if the passed array should be converted
     * into a string or not.
     *
     * @access private
     * @param  array   $strings an array of generated strings
     * @param  mixed   $tags string or array of HTML tags to wrap output with
     * @param  boolean $array whether an array or a string should be returned
     * @param  string  $delimiter the string to use when calling implode()
     * @return mixed   string or array of generated lorem ipsum text
     */
    private function output($strings, $tags, $array, $delimiter = ' ')
    {
        if ($tags) {
            if (!is_array($tags)) {
                $tags = array($tags);
            } else {
                // Flips the array so we can work from the inside out
                $tags = array_reverse($tags);
            }
            foreach ($strings as $key => $string) {
                foreach ($tags as $tag) {
                    // Detects / applies back reference
                    if ($tag[0] == '<') {
                        $string = str_replace('$1', $string, $tag);
                    } else {
                        $string = sprintf('<%1$s>%2$s</%1$s>', $tag, $string);
                    }
                    $strings[$key] = $string;
                }
            }
        }
        if (!$array) {
            $strings = implode($delimiter, $strings);
        }
        return $strings;
    }
}
