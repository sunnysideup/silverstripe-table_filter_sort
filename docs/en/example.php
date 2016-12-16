<?php



function create_test()
{
    $type = 'Test Product';
    $producer = 'Sunny Side Up';
    $colours = array(
        'orange',
        'red',
        'blue',
        'indigo',
        'violet',
        'green',
        'yellow'
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
    for($i = 0; $i < 1000; $i++) {
        $html .= '
        <tr class="tfsRow">
            <td><span data-filter="SKU">'.($i+1).'</span></td>
            <td><span data-filter="Type">'.$type.'</span></td>
            <td><span data-filter="Original Producer">'.$producer.'</span></td>
            <td><span data-filter="Colour">'.$colours[rand(0, 6)].'</span></td>
            <td><span data-filter="Size">'.$sizes[rand(0,4)].'</span></td>
            <td><span data-filter="Weight">'.rand(1,20).'kg.</span></td>
            <td><span data-filter="Price">$'.(rand(0,99999)/100).'</span></td>
            <td><span data-filter="Rating">'.rand(1,5).' Stars</span></td>
            <td>
                <a href="#" class="tableFilterSortMoreDetails" data-rel="Row_'.$i.'_Details">more</a>
                <div style="display: none;" id="Row_'.$i.'_Details">
                    <h6>Tags</h6>
                    <ul>
                        <li><span data-filter="Tags">'.$veg[rand(0, count($veg)-1)].'</span></li>
                        <li><span data-filter="Tags">'.$veg[rand(0, count($veg)-1)].'</span></li>
                    </ul>
                </div>
            </td>
        </tr>';
    }
    return $html;
}

$html = create_test();

?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Example Filter Table</title>
        <link rel="stylesheet" type="text/css" href="../../css/TableFilterSort.css">
    </head>
    <body>

        <h1>Example of a Filter and Sort Table ... </h1>

        <div class="tableFilterSortHolder">
            <div class="tableFilterSortFilterFormHolder"
                data-title="My Filter Title"
                data-title-clear-button="Clear"
                data-title-close-and-apply="Apply"
            ></div>
            <div class="tableFilterSortCurrentSearchHolder" data-title="Current Filter"></div>
            <div class="tableFilterSortCommonContentHolder" data-title="Common Info"></div>
            <table class="tableFilterSortTable">
                <thead>
                    <tr>
                        <th scope="col">
                            <a href="#" class="sortable" data-filter="SKU" data-sort-direction="asc" data-sort-type="number">SKU</a>
                        </th>
                        <th scope="col">Type</th>
                        <th scope="col">Producer</th>
                        <th scope="col">Colour</th>
                        <th scope="col">
                            <a href="#" class="sortable" data-filter="Size" data-sort-direction="asc" data-sort-type="text">Size</a>
                        </th>
                        <th scope="col">
                            <a href="#" class="sortable" data-filter="Weight" data-sort-direction="asc" data-sort-type="number">Weight</a>
                        </th>
                        <th scope="col">
                            <a href="#" class="sortable" data-filter="Price" data-sort-direction="asc" data-sort-type="number" data-sort-default="true">Price</a>
                        </th>
                        <th scope="col">
                            <a href="#" class="sortable" data-filter="Rating" data-sort-direction="desc" data-sort-type="number">Rating</a>
                        </th>
                        <th scope="col">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <?php echo $html ?>
                </tbody>
            </table>
            <p class="tableFilterSortMoreEntries">
                You have reached the limit of visble entries,
                there are more entries, but they can not be shown here as this will overload your browser.
                <br />
                Filter: <span class="match-row-number">0</span> /  <span class="total-row-number">0</span>.
                <br />
                Display: <span class="total-showing-row-number">0</span>
                (<span class="min-row-number">0</span>
                - <span class="max-row-number">0</span>).
                <br />
                Select Page: <span class="pagination"></p>
            </p>

        </div>



        <script src="https://code.jquery.com/jquery-git.min.js"></script>
        <script type="text/javascript">
            var TableFilterSortTableList = []
            TableFilterSortTableList.push('.tableFilterSortHolder');
        </script>
        <script src="../../javascript/TableFilterSort.js"></script>

</html>
