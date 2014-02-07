/**
 * angular-strap-datepicker
 * @version v1.0.0 - 2014-02-07
 * @link https://github.com/dpellier/angular-strap-datepicker
 * @author Damien Pellier ()
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, document, undefined) {
'use strict';
// Source: dist/modules/datepicker.tpl.js
angular.module('mgcrea.ngStrap.datepicker').run(['$templateCache', function($templateCache) {
$templateCache.put('datepicker/datepicker.tpl.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\" style=\"max-width: 320px\"><table style=\"table-layout: fixed; height: 100%; width: 100%\"><thead><tr class=\"text-center\"><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-left\" ng-click=\"$selectPane(-1)\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th><th colspan=\"{{ rows[0].length - 2 }}\"><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default btn-block text-strong\" ng-click=\"$toggleMode()\"><strong style=\"text-transform: capitalize\" ng-bind=\"title\"></strong></button></th><th><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default pull-right\" ng-click=\"$selectPane(+1)\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th></tr><tr ng-show=\"labels\" ng-bind-html=\"labels\"></tr></thead><tbody><tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\"><td class=\"text-center\" ng-repeat=\"(j, el) in row\"><button tabindex=\"-1\" type=\"button\" class=\"btn btn-default\" style=\"width: 100%\" ng-class=\"{'btn-primary': el.selected}\" ng-click=\"$select(el.date)\" ng-disabled=\"el.disabled\"><span ng-class=\"{'text-muted': el.muted}\" ng-bind=\"el.label\"></span></button></td></tr></tbody></table></div>"
  );

}]);

// Source: dist/modules/tooltip.tpl.js
angular.module('mgcrea.ngStrap.tooltip').run(['$templateCache', function($templateCache) {
$templateCache.put('tooltip/tooltip.tpl.html',
    "<div class=\"tooltip\" ng-show=\"title\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\" ng-bind=\"title\"></div></div>"
  );

}]);

})(window, document);