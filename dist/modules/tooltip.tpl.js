/**
 * angular-strap-datepicker
 * @version v1.0.0 - 2014-02-07
 * @link https://github.com/dpellier/angular-strap-datepicker
 * @author Damien Pellier ()
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('mgcrea.ngStrap.tooltip').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('tooltip/tooltip.tpl.html',
    "<div class=\"tooltip\" ng-show=\"title\"><div class=\"tooltip-arrow\"></div><div class=\"tooltip-inner\" ng-bind=\"title\"></div></div>"
  );

}]);
