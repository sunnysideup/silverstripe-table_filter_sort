2019-07-07 09:47

# running php upgrade inspect see: https://github.com/silverstripe/silverstripe-upgrader
cd /var/www/upgrades/upgradeto4
php /var/www/upgrader/vendor/silverstripe/upgrader/bin/upgrade-code inspect /var/www/upgrades/upgradeto4/table_filter_sort/src  --root-dir=/var/www/upgrades/upgradeto4 --write -vvv
Writing changes for 0 files
Running post-upgrade on "/var/www/upgrades/upgradeto4/table_filter_sort/src"
[2019-07-07 21:47:50] Applying ApiChangeWarningsRule to TableFilterSortServerSaverController.php...
[2019-07-07 21:47:51] Applying UpdateVisibilityRule to TableFilterSortServerSaverController.php...
[2019-07-07 21:47:51] Applying ApiChangeWarningsRule to TableFilterSortModelAdmin.php...
[2019-07-07 21:47:51] Applying UpdateVisibilityRule to TableFilterSortModelAdmin.php...
[2019-07-07 21:47:51] Applying ApiChangeWarningsRule to TableFilterSortAPI.php...
[2019-07-07 21:47:51] Applying UpdateVisibilityRule to TableFilterSortAPI.php...
[2019-07-07 21:47:51] Applying ApiChangeWarningsRule to TableFilterSortServerSaver.php...
[2019-07-07 21:47:51] Applying UpdateVisibilityRule to TableFilterSortServerSaver.php...
[2019-07-07 21:47:51] Applying ApiChangeWarningsRule to TableFilterSortTag.php...
[2019-07-07 21:47:51] Applying UpdateVisibilityRule to TableFilterSortTag.php...
unchanged:	Control/TableFilterSortServerSaverController.php
Warnings for Control/TableFilterSortServerSaverController.php:
 - Control/TableFilterSortServerSaverController.php:351 Session: Session is no longer statically accessible (https://docs.silverstripe.org/en/4/changelogs/4.0.0#session)
unchanged:	Api/TableFilterSortAPI.php
Warnings for Api/TableFilterSortAPI.php:
 - Api/TableFilterSortAPI.php:182 file_get_contents(): Use new asset abstraction (https://docs.silverstripe.org/en/4/changelogs/4.0.0#asset-storage)
 - Api/TableFilterSortAPI.php:202 file_get_contents(): Use new asset abstraction (https://docs.silverstripe.org/en/4/changelogs/4.0.0#asset-storage)
Writing changes for 0 files
✔✔✔
# running php upgrade inspect see: https://github.com/silverstripe/silverstripe-upgrader
cd /var/www/upgrades/upgradeto4
php /var/www/upgrader/vendor/silverstripe/upgrader/bin/upgrade-code inspect /var/www/upgrades/upgradeto4/table_filter_sort/src  --root-dir=/var/www/upgrades/upgradeto4 --write -vvv
Writing changes for 0 files
Running post-upgrade on "/var/www/upgrades/upgradeto4/table_filter_sort/src"
[2019-07-07 21:48:11] Applying ApiChangeWarningsRule to TableFilterSortServerSaverController.php...
[2019-07-07 21:48:11] Applying UpdateVisibilityRule to TableFilterSortServerSaverController.php...
[2019-07-07 21:48:11] Applying ApiChangeWarningsRule to TableFilterSortModelAdmin.php...
[2019-07-07 21:48:11] Applying UpdateVisibilityRule to TableFilterSortModelAdmin.php...
[2019-07-07 21:48:11] Applying ApiChangeWarningsRule to TableFilterSortAPI.php...
[2019-07-07 21:48:11] Applying UpdateVisibilityRule to TableFilterSortAPI.php...
[2019-07-07 21:48:11] Applying ApiChangeWarningsRule to TableFilterSortServerSaver.php...
[2019-07-07 21:48:11] Applying UpdateVisibilityRule to TableFilterSortServerSaver.php...
[2019-07-07 21:48:12] Applying ApiChangeWarningsRule to TableFilterSortTag.php...
[2019-07-07 21:48:12] Applying UpdateVisibilityRule to TableFilterSortTag.php...
unchanged:	Control/TableFilterSortServerSaverController.php
Warnings for Control/TableFilterSortServerSaverController.php:
 - Control/TableFilterSortServerSaverController.php:351 Session: Session is no longer statically accessible (https://docs.silverstripe.org/en/4/changelogs/4.0.0#session)
unchanged:	Api/TableFilterSortAPI.php
Warnings for Api/TableFilterSortAPI.php:
 - Api/TableFilterSortAPI.php:182 file_get_contents(): Use new asset abstraction (https://docs.silverstripe.org/en/4/changelogs/4.0.0#asset-storage)
 - Api/TableFilterSortAPI.php:202 file_get_contents(): Use new asset abstraction (https://docs.silverstripe.org/en/4/changelogs/4.0.0#asset-storage)
Writing changes for 0 files
✔✔✔