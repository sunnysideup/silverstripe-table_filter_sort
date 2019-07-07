2019-07-07 09:45

# running php upgrade upgrade see: https://github.com/silverstripe/silverstripe-upgrader
cd /var/www/upgrades/upgradeto4
php /var/www/upgrader/vendor/silverstripe/upgrader/bin/upgrade-code upgrade /var/www/upgrades/upgradeto4/table_filter_sort  --root-dir=/var/www/upgrades/upgradeto4 --write -vvv --prompt
Array
(
    [0] => Running upgrades on "/var/www/upgrades/upgradeto4/table_filter_sort"
    [1] => [2019-07-07 21:45:01] Applying RenameClasses to TableFilterSortTest.php...
    [2] => [2019-07-07 21:45:01] Applying ClassToTraitRule to TableFilterSortTest.php...
    [3] => [2019-07-07 21:45:01] Applying UpdateConfigClasses to routes.yml...
    [4] => [2019-07-07 21:45:01] Applying RenameClasses to example.php...
    [5] => [2019-07-07 21:45:01] Applying ClassToTraitRule to example.php...
    [6] => PHP Fatal error:  Uncaught TypeError: Argument 1 passed to SilverStripe\Upgrader\UpgradeRule\PHP\Visitor\ClassToTraitVisitor::getNodeName() must implement interface PhpParser\Node, null given, called in /var/www/upgrader/vendor/silverstripe/upgrader/src/UpgradeRule/PHP/Visitor/ClassToTraitVisitor.php on line 48 and defined in /var/www/upgrader/vendor/silverstripe/upgrader/src/UpgradeRule/PHP/Visitor/NodeMatchable.php:42
    [7] => Stack trace:
    [8] => #0 /var/www/upgrader/vendor/silverstripe/upgrader/src/UpgradeRule/PHP/Visitor/ClassToTraitVisitor.php(48): SilverStripe\Upgrader\UpgradeRule\PHP\Visitor\ClassToTraitVisitor->getNodeName(NULL)
    [9] => #1 /var/www/upgrader/vendor/nikic/php-parser/lib/PhpParser/NodeTraverser.php(159): SilverStripe\Upgrader\UpgradeRule\PHP\Visitor\ClassToTraitVisitor->enterNode(Object(PhpParser\Node\Stmt\Class_))
    [10] => #2 /var/www/upgrader/vendor/nikic/php-parser/lib/PhpParser/NodeTraverser.php(85): PhpParser\NodeTraverser->traverseArray(Array)
    [11] => #3 /var/www/upgrader/vendor/silverstripe/upgrader/src/UpgradeRule/PHP/PHPUpgradeRule.php( in /var/www/upgrader/vendor/silverstripe/upgrader/src/UpgradeRule/PHP/Visitor/NodeMatchable.php on line 42
)
