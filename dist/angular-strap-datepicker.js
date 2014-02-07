/**
 * angular-strap-datepicker
 * @version v1.0.0 - 2014-02-07
 * @link https://github.com/dpellier/angular-strap-datepicker
 * @author Damien Pellier ()
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (window, document, undefined) {
  'use strict';
  angular.module('mgcrea.ngStrap', [
    'mgcrea.ngStrap.datepicker',
    'mgcrea.ngStrap.tooltip'
  ]);
  angular.module('mgcrea.ngStrap.datepicker', [
    'mgcrea.ngStrap.helpers.dateParser',
    'mgcrea.ngStrap.tooltip'
  ]).provider('$datepicker', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'datepicker',
        placement: 'bottom-left',
        template: 'datepicker/datepicker.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        useNative: false,
        dateType: 'date',
        dateFormat: 'shortDate',
        autoclose: false,
        minDate: -Infinity,
        maxDate: +Infinity,
        startView: 0,
        minView: 0,
        weekStart: 0
      };
    this.$get = [
      '$window',
      '$document',
      '$rootScope',
      '$sce',
      '$locale',
      'dateFilter',
      'datepickerViews',
      '$tooltip',
      function ($window, $document, $rootScope, $sce, $locale, dateFilter, datepickerViews, $tooltip) {
        var bodyEl = angular.element($window.document.body);
        var isTouch = 'createTouch' in $window.document;
        var isAppleTouch = /(iP(a|o)d|iPhone)/g.test($window.navigator.userAgent);
        if (!defaults.lang) {
          defaults.lang = $locale.id;
        }
        function DatepickerFactory(element, controller, config) {
          var $datepicker = $tooltip(element, angular.extend({}, defaults, config));
          var parentScope = config.scope;
          var options = $datepicker.$options;
          var scope = $datepicker.$scope;
          var pickerViews = datepickerViews($datepicker);
          $datepicker.$views = pickerViews.views;
          var viewDate = pickerViews.viewDate;
          scope.$mode = options.startView;
          var $picker = $datepicker.$views[scope.$mode];
          scope.$select = function (date) {
            $datepicker.select(date);
          };
          scope.$selectPane = function (value) {
            $datepicker.$selectPane(value);
          };
          scope.$toggleMode = function () {
            $datepicker.setMode((scope.$mode + 1) % $datepicker.$views.length);
          };
          $datepicker.update = function (date) {
            if (!isNaN(date.getTime())) {
              $datepicker.$date = date;
              $picker.update.call($picker, date);
            } else if (!$picker.built) {
              $datepicker.$build();
            }
          };
          $datepicker.select = function (date, keep) {
            if (!angular.isDate(date)) {
              date = new Date(date);
            }
            controller.$dateValue.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            if (!scope.$mode || keep) {
              controller.$setViewValue(controller.$dateValue);
              controller.$render();
              if (options.autoclose && !keep) {
                $datepicker.hide(true);
              }
            } else {
              angular.extend(viewDate, {
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate()
              });
              $datepicker.setMode(scope.$mode - 1);
              $datepicker.$build();
            }
          };
          $datepicker.setMode = function (mode) {
            scope.$mode = mode;
            $picker = $datepicker.$views[scope.$mode];
            $datepicker.$build();
          };
          $datepicker.$build = function () {
            $picker.build.call($picker);
          };
          $datepicker.$updateSelected = function () {
            for (var i = 0, l = scope.rows.length; i < l; i++) {
              angular.forEach(scope.rows[i], updateSelected);
            }
          };
          $datepicker.$isSelected = function (date) {
            return $picker.isSelected(date);
          };
          $datepicker.$selectPane = function (value) {
            var steps = $picker.steps;
            var targetDate = new Date(Date.UTC(viewDate.year + (steps.year || 0) * value, viewDate.month + (steps.month || 0) * value, viewDate.date + (steps.day || 0) * value));
            angular.extend(viewDate, {
              year: targetDate.getUTCFullYear(),
              month: targetDate.getUTCMonth(),
              date: targetDate.getUTCDate()
            });
            $datepicker.$build();
          };
          $datepicker.$onMouseDown = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (isTouch) {
              var targetEl = angular.element(evt.target);
              if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                targetEl = targetEl.parent();
              }
              targetEl.triggerHandler('click');
            }
          };
          $datepicker.$onKeyDown = function (evt) {
            if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey) {
              return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            if (evt.keyCode === 13) {
              if (!scope.$mode) {
                return $datepicker.hide(true);
              } else {
                return scope.$apply(function () {
                  $datepicker.setMode(scope.$mode - 1);
                });
              }
            }
            $picker.onKeyDown(evt);
            parentScope.$digest();
          };
          function updateSelected(el) {
            el.selected = $datepicker.$isSelected(el.date);
          }
          function focusElement() {
            element[0].focus();
          }
          var _init = $datepicker.init;
          $datepicker.init = function () {
            if (isAppleTouch && options.useNative) {
              element.prop('type', 'date');
              element.css('-webkit-appearance', 'textfield');
              return;
            } else if (isTouch) {
              element.prop('type', 'text');
              element.attr('readonly', 'true');
              element.on('click', focusElement);
            }
            _init();
          };
          var _destroy = $datepicker.destroy;
          $datepicker.destroy = function () {
            if (isAppleTouch && options.useNative) {
              element.off('click', focusElement);
            }
            _destroy();
          };
          var _show = $datepicker.show;
          $datepicker.show = function () {
            _show();
            setTimeout(function () {
              $datepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
              if (options.keyboard) {
                element.on('keydown', $datepicker.$onKeyDown);
              }
            });
          };
          var _hide = $datepicker.hide;
          $datepicker.hide = function (blur) {
            $datepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
            if (options.keyboard) {
              element.off('keydown', $datepicker.$onKeyDown);
            }
            _hide(blur);
          };
          return $datepicker;
        }
        DatepickerFactory.defaults = defaults;
        return DatepickerFactory;
      }
    ];
  }).directive('bsDatepicker', [
    '$window',
    '$parse',
    '$q',
    '$locale',
    'dateFilter',
    '$datepicker',
    '$dateParser',
    '$timeout',
    function ($window, $parse, $q, $locale, dateFilter, $datepicker, $dateParser, $timeout) {
      var isAppleTouch = /(iP(a|o)d|iPhone)/g.test($window.navigator.userAgent);
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function postLink(scope, element, attr, controller) {
          var options = {
              scope: scope,
              controller: controller
            };
          angular.forEach([
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'template',
            'autoclose',
            'dateType',
            'dateFormat',
            'useNative',
            'lang'
          ], function (key) {
            if (angular.isDefined(attr[key])) {
              options[key] = attr[key];
            }
          });
          if (isAppleTouch && options.useNative) {
            options.dateFormat = 'yyyy-MM-dd';
          }
          var datepicker = $datepicker(element, controller, options);
          options = datepicker.$options;
          angular.forEach([
            'minDate',
            'maxDate'
          ], function (key) {
            angular.isDefined(attr[key]) && attr.$observe(key, function (newValue) {
              if (newValue === 'today') {
                var today = new Date();
                datepicker.$options[key] = +new Date(today.getFullYear(), today.getMonth(), today.getDate() + (key === 'maxDate' ? 1 : 0), 0, 0, 0, key === 'minDate' ? 0 : -1);
              } else if (angular.isString(newValue) && newValue.match(/^".+"$/)) {
                datepicker.$options[key] = +new Date(newValue.substr(1, newValue.length - 2));
              } else {
                datepicker.$options[key] = +new Date(newValue);
              }
              !isNaN(datepicker.$options[key]) && datepicker.$build();
            });
          });
          scope.$watch(attr.ngModel, function (newValue, oldValue) {
            datepicker.update(controller.$dateValue);
          }, true);
          var dateParser = $dateParser({
              format: options.dateFormat,
              lang: options.lang
            });
          controller.$parsers.unshift(function (viewValue) {
            if (!viewValue) {
              controller.$setValidity('date', true);
              return;
            }
            var parsedDate = dateParser.parse(viewValue, controller.$dateValue);
            if (!parsedDate || isNaN(parsedDate.getTime())) {
              controller.$setValidity('date', false);
            } else {
              var isValid = parsedDate.getTime() >= options.minDate && parsedDate.getTime() <= options.maxDate;
              controller.$setValidity('date', isValid);
              if (isValid) {
                controller.$dateValue = parsedDate;
              }
            }
            if (options.dateType === 'string') {
              return dateFilter(viewValue, options.dateFormat);
            } else if (options.dateType === 'number') {
              return controller.$dateValue.getTime();
            } else if (options.dateType === 'iso') {
              return controller.$dateValue.toISOString();
            } else {
              return controller.$dateValue;
            }
          });
          controller.$formatters.push(function (modelValue) {
            var date = angular.isDate(modelValue) ? modelValue : new Date(modelValue);
            controller.$dateValue = date;
            return controller.$dateValue;
          });
          controller.$render = function () {
            element.val(isNaN(controller.$dateValue.getTime()) ? '' : dateFilter(controller.$dateValue, options.dateFormat));
          };
          scope.$on('$destroy', function () {
            datepicker.destroy();
            options = null;
            datepicker = null;
          });
        }
      };
    }
  ]).provider('datepickerViews', function () {
    var defaults = this.defaults = {
        dayFormat: 'dd',
        daySplit: 7
      };
    function split(arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    }
    this.$get = [
      '$locale',
      '$sce',
      'dateFilter',
      function ($locale, $sce, dateFilter) {
        return function (picker) {
          var scope = picker.$scope;
          var options = picker.$options;
          var weekDaysMin = $locale.DATETIME_FORMATS.SHORTDAY;
          var weekDaysLabels = weekDaysMin.slice(options.weekStart).concat(weekDaysMin.slice(0, options.weekStart));
          var dayLabelHtml = $sce.trustAsHtml('<th class="dow text-center">' + weekDaysLabels.join('</th><th class="dow text-center">') + '</th>');
          var startDate = picker.$date || new Date();
          var viewDate = {
              year: startDate.getFullYear(),
              month: startDate.getMonth(),
              date: startDate.getDate()
            };
          var timezoneOffset = startDate.getTimezoneOffset() * 60000;
          var views = [
              {
                format: 'dd',
                split: 7,
                steps: { month: 1 },
                update: function (date, force) {
                  if (!this.built || force || date.getFullYear() !== viewDate.year || date.getMonth() !== viewDate.month) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$build();
                  } else if (date.getDate() !== viewDate.date) {
                    viewDate.date = picker.$date.getDate();
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1);
                  var firstDate = new Date(+firstDayOfMonth - (firstDayOfMonth.getDay() - options.weekStart) * 86400000);
                  var days = [], day;
                  for (var i = 0; i < 35; i++) {
                    day = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i);
                    days.push({
                      date: day,
                      label: dateFilter(day, this.format),
                      selected: picker.$date && this.isSelected(day),
                      muted: day.getMonth() !== viewDate.month,
                      disabled: this.isDisabled(day)
                    });
                  }
                  scope.title = dateFilter(firstDayOfMonth, 'MMMM yyyy');
                  scope.labels = dayLabelHtml;
                  scope.rows = split(days, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth() && date.getDate() === picker.$date.getDate();
                },
                isDisabled: function (date) {
                  return date.getTime() < options.minDate || date.getTime() > options.maxDate;
                },
                onKeyDown: function (evt) {
                  var actualTime = picker.$date.getTime();
                  if (evt.keyCode === 37) {
                    picker.select(new Date(actualTime - 1 * 86400000), true);
                  } else if (evt.keyCode === 38) {
                    picker.select(new Date(actualTime - 7 * 86400000), true);
                  } else if (evt.keyCode === 39) {
                    picker.select(new Date(actualTime + 1 * 86400000), true);
                  } else if (evt.keyCode === 40) {
                    picker.select(new Date(actualTime + 7 * 86400000), true);
                  }
                }
              },
              {
                name: 'month',
                format: 'MMM',
                split: 4,
                steps: { year: 1 },
                update: function (date, force) {
                  if (!this.built || date.getFullYear() !== viewDate.year) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$build();
                  } else if (date.getMonth() !== viewDate.month) {
                    angular.extend(viewDate, {
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstMonth = new Date(viewDate.year, 0, 1);
                  var months = [], month;
                  for (var i = 0; i < 12; i++) {
                    month = new Date(viewDate.year, i, 1);
                    months.push({
                      date: month,
                      label: dateFilter(month, this.format),
                      selected: picker.$isSelected(month),
                      disabled: this.isDisabled(month)
                    });
                  }
                  scope.title = dateFilter(month, 'yyyy');
                  scope.labels = false;
                  scope.rows = split(months, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth();
                },
                isDisabled: function (date) {
                  var lastDate = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  return lastDate < options.minDate || date.getTime() > options.maxDate;
                },
                onKeyDown: function (evt) {
                  var actualMonth = picker.$date.getMonth();
                  if (evt.keyCode === 37) {
                    picker.select(picker.$date.setMonth(actualMonth - 1), true);
                  } else if (evt.keyCode === 38) {
                    picker.select(picker.$date.setMonth(actualMonth - 4), true);
                  } else if (evt.keyCode === 39) {
                    picker.select(picker.$date.setMonth(actualMonth + 1), true);
                  } else if (evt.keyCode === 40) {
                    picker.select(picker.$date.setMonth(actualMonth + 4), true);
                  }
                }
              },
              {
                name: 'year',
                format: 'yyyy',
                split: 4,
                steps: { year: 12 },
                update: function (date, force) {
                  if (!this.built || force || parseInt(date.getFullYear() / 20, 10) !== parseInt(viewDate.year / 20, 10)) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$build();
                  } else if (date.getFullYear() !== viewDate.year) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate()
                    });
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstYear = viewDate.year - viewDate.year % (this.split * 3);
                  var years = [], year;
                  for (var i = 0; i < 12; i++) {
                    year = new Date(firstYear + i, 0, 1);
                    years.push({
                      date: year,
                      label: dateFilter(year, this.format),
                      selected: picker.$isSelected(year),
                      disabled: this.isDisabled(year)
                    });
                  }
                  scope.title = years[0].label + '-' + years[years.length - 1].label;
                  scope.labels = false;
                  scope.rows = split(years, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return picker.$date && date.getFullYear() === picker.$date.getFullYear();
                },
                isDisabled: function (date) {
                  var lastDate = +new Date(date.getFullYear() + 1, 0, 0);
                  return lastDate < options.minDate || date.getTime() > options.maxDate;
                },
                onKeyDown: function (evt) {
                  var actualYear = picker.$date.getFullYear();
                  if (evt.keyCode === 37) {
                    picker.select(picker.$date.setYear(actualYear - 1), true);
                  } else if (evt.keyCode === 38) {
                    picker.select(picker.$date.setYear(actualYear - 4), true);
                  } else if (evt.keyCode === 39) {
                    picker.select(picker.$date.setYear(actualYear + 1), true);
                  } else if (evt.keyCode === 40) {
                    picker.select(picker.$date.setYear(actualYear + 4), true);
                  }
                }
              }
            ];
          return {
            views: options.minView ? Array.prototype.slice.call(views, options.minView) : views,
            viewDate: viewDate
          };
        };
      }
    ];
  });
  angular.module('mgcrea.ngStrap.helpers.dateParser', []).provider('$dateParser', [
    '$localeProvider',
    function ($localeProvider) {
      var proto = Date.prototype;
      function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      var defaults = this.defaults = {
          format: 'shortDate',
          strict: false
        };
      this.$get = [
        '$locale',
        function ($locale) {
          var DateParserFactory = function (config) {
            var options = angular.extend({}, defaults, config);
            var $dateParser = {};
            var regExpMap = {
                'sss': '[0-9]{3}',
                'ss': '[0-5][0-9]',
                's': options.strict ? '[1-5]?[0-9]' : '[0-5][0-9]',
                'mm': '[0-5][0-9]',
                'm': options.strict ? '[1-5]?[0-9]' : '[0-5][0-9]',
                'HH': '[01][0-9]|2[0-3]',
                'H': options.strict ? '[0][1-9]|[1][012]' : '[01][0-9]|2[0-3]',
                'hh': '[0][1-9]|[1][012]',
                'h': options.strict ? '[1-9]|[1][012]' : '[0]?[1-9]|[1][012]',
                'a': 'AM|PM',
                'EEEE': $locale.DATETIME_FORMATS.DAY.join('|'),
                'EEE': $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
                'dd': '[0-2][0-9]{1}|[3][01]{1}',
                'd': options.strict ? '[1-2]?[0-9]{1}|[3][01]{1}' : '[0-2][0-9]{1}|[3][01]{1}',
                'MMMM': $locale.DATETIME_FORMATS.MONTH.join('|'),
                'MMM': $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                'MM': '[0][1-9]|[1][012]',
                'M': options.strict ? '[1-9]|[1][012]' : '[0][1-9]|[1][012]',
                'yyyy': '(?:(?:[1]{1}[0-9]{1}[0-9]{1}[0-9]{1})|(?:[2]{1}[0-9]{3}))(?![[0-9]])',
                'yy': '(?:(?:[0-9]{1}[0-9]{1}))(?![[0-9]])'
              };
            var setFnMap = {
                'sss': proto.setMilliseconds,
                'ss': proto.setSeconds,
                's': proto.setSeconds,
                'mm': proto.setMinutes,
                'm': proto.setMinutes,
                'HH': proto.setHours,
                'H': proto.setHours,
                'hh': proto.setHours,
                'h': proto.setHours,
                'dd': proto.setDate,
                'd': proto.setDate,
                'a': function (value) {
                  var hours = this.getHours();
                  return this.setHours(value.match(/pm/i) ? hours + 12 : hours);
                },
                'MMMM': function (value) {
                  return this.setMonth($locale.DATETIME_FORMATS.MONTH.indexOf(value));
                },
                'MMM': function (value) {
                  return this.setMonth($locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value));
                },
                'MM': function (value) {
                  return this.setMonth(1 * value - 1);
                },
                'M': function (value) {
                  return this.setMonth(1 * value - 1);
                },
                'yyyy': proto.setFullYear,
                'yy': function (value) {
                  return this.setFullYear(2000 + 1 * value);
                },
                'y': proto.setFullYear
              };
            var regex, setMap;
            $dateParser.init = function () {
              $dateParser.$format = $locale.DATETIME_FORMATS[options.format] || options.format;
              regex = regExpForFormat($dateParser.$format);
              setMap = setMapForFormat($dateParser.$format);
            };
            $dateParser.isValid = function (date) {
              if (angular.isDate(date)) {
                return !isNaN(date.getTime());
              }
              return regex.test(date);
            };
            $dateParser.parse = function (value, baseDate) {
              if (angular.isDate(value)) {
                return value;
              }
              var matches = regex.exec(value);
              if (!matches) {
                return false;
              }
              var date = baseDate || new Date(0);
              for (var i = 0; i < matches.length - 1; i++) {
                setMap[i] && setMap[i].call(date, matches[i + 1]);
              }
              return date;
            };
            function setMapForFormat(format) {
              var keys = Object.keys(setFnMap), i;
              var map = [], sortedMap = [];
              var clonedFormat = format;
              for (i = 0; i < keys.length; i++) {
                if (format.split(keys[i]).length > 1) {
                  var index = clonedFormat.search(keys[i]);
                  format = format.split(keys[i]).join('');
                  if (setFnMap[keys[i]]) {
                    map[index] = setFnMap[keys[i]];
                  }
                }
              }
              angular.forEach(map, function (v) {
                sortedMap.push(v);
              });
              return sortedMap;
            }
            function escapeReservedSymbols(text) {
              return text.replace(/\//g, '[\\/]').replace('/-/g', '[-]').replace(/\./g, '[.]').replace(/\\s/g, '[\\s]');
            }
            function regExpForFormat(format) {
              var keys = Object.keys(regExpMap), i;
              var re = format;
              for (i = 0; i < keys.length; i++) {
                re = re.split(keys[i]).join('${' + i + '}');
              }
              for (i = 0; i < keys.length; i++) {
                re = re.split('${' + i + '}').join('(' + regExpMap[keys[i]] + ')');
              }
              format = escapeReservedSymbols(format);
              return new RegExp('^' + re + '$', ['i']);
            }
            $dateParser.init();
            return $dateParser;
          };
          return DateParserFactory;
        }
      ];
    }
  ]);
  angular.module('mgcrea.ngStrap.helpers.dimensions', []).factory('dimensions', [
    '$document',
    '$window',
    function ($document, $window) {
      var jqLite = angular.element;
      var fn = {};
      var nodeName = fn.nodeName = function (element, name) {
          return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
        };
      fn.css = function (element, prop, extra) {
        var value;
        if (element.currentStyle) {
          value = element.currentStyle[prop];
        } else if (window.getComputedStyle) {
          value = window.getComputedStyle(element)[prop];
        } else {
          value = element.style[prop];
        }
        return extra === true ? parseFloat(value) || 0 : value;
      };
      fn.offset = function (element) {
        var boxRect = element.getBoundingClientRect();
        var docElement = element.ownerDocument;
        return {
          width: element.offsetWidth,
          height: element.offsetHeight,
          top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
          left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
        };
      };
      fn.position = function (element) {
        var offsetParentRect = {
            top: 0,
            left: 0
          }, offsetParentElement, offset;
        if (fn.css(element, 'position') === 'fixed') {
          offset = element.getBoundingClientRect();
        } else {
          offsetParentElement = offsetParent(element);
          offset = fn.offset(element);
          offset = fn.offset(element);
          if (!nodeName(offsetParentElement, 'html')) {
            offsetParentRect = fn.offset(offsetParentElement);
          }
          offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
          offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
        }
        return {
          width: element.offsetWidth,
          height: element.offsetHeight,
          top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
          left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
        };
      };
      var offsetParent = function offsetParentElement(element) {
        var docElement = element.ownerDocument;
        var offsetParent = element.offsetParent || docElement;
        if (nodeName(offsetParent, '#document')) {
          return docElement.documentElement;
        }
        while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
          offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || docElement.documentElement;
      };
      fn.height = function (element, outer) {
        var value = element.offsetHeight;
        if (outer) {
          value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
        } else {
          value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
        }
        return value;
      };
      fn.width = function (element, outer) {
        var value = element.offsetWidth;
        if (outer) {
          value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
        } else {
          value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
        }
        return value;
      };
      return fn;
    }
  ]);
  angular.module('mgcrea.ngStrap.tooltip', ['mgcrea.ngStrap.helpers.dimensions']).provider('$tooltip', function () {
    var defaults = this.defaults = {
        animation: 'am-fade',
        prefixClass: 'tooltip',
        container: false,
        placement: 'top',
        template: 'tooltip/tooltip.tpl.html',
        contentTemplate: false,
        trigger: 'hover focus',
        keyboard: false,
        html: false,
        show: false,
        title: '',
        type: '',
        delay: 0
      };
    this.$get = [
      '$window',
      '$rootScope',
      '$compile',
      '$q',
      '$templateCache',
      '$http',
      '$animate',
      '$timeout',
      'dimensions',
      function ($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, dimensions) {
        var trim = String.prototype.trim;
        var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
        var isTouch = 'createTouch' in $window.document;
        var htmlReplaceRegExp = /ng-bind="/gi;
        var findElement = function (query, element) {
          return angular.element((element || document).querySelectorAll(query));
        };
        function TooltipFactory(element, config) {
          var $tooltip = {};
          var options = $tooltip.$options = angular.extend({}, defaults, config);
          $tooltip.$promise = $q.when($templateCache.get(options.template) || $http.get(options.template));
          var scope = $tooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
          if (options.delay && angular.isString(options.delay)) {
            options.delay = parseFloat(options.delay);
          }
          if (options.title) {
            $tooltip.$scope.title = options.title;
          }
          scope.$hide = function () {
            scope.$$postDigest(function () {
              $tooltip.hide();
            });
          };
          scope.$show = function () {
            scope.$$postDigest(function () {
              $tooltip.show();
            });
          };
          scope.$toggle = function () {
            scope.$$postDigest(function () {
              $tooltip.toggle();
            });
          };
          $tooltip.$isShown = false;
          var timeout, hoverState;
          if (options.contentTemplate) {
            $tooltip.$promise = $tooltip.$promise.then(function (template) {
              if (angular.isObject(template)) {
                template = template.data;
              }
              var templateEl = angular.element(template);
              return $q.when($templateCache.get(options.contentTemplate) || $http.get(options.contentTemplate, { cache: $templateCache })).then(function (contentTemplate) {
                if (angular.isObject(contentTemplate)) {
                  contentTemplate = contentTemplate.data;
                }
                findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
                return templateEl[0].outerHTML;
              });
            });
          }
          var tipLinker, tipElement, tipTemplate;
          $tooltip.$promise.then(function (template) {
            if (angular.isObject(template)) {
              template = template.data;
            }
            if (options.html) {
              template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
            }
            template = trim.apply(template);
            tipTemplate = template;
            tipLinker = $compile(template);
            $tooltip.init();
          });
          $tooltip.init = function () {
            if (options.delay && angular.isNumber(options.delay)) {
              options.delay = {
                show: options.delay,
                hide: options.delay
              };
            }
            var triggers = options.trigger.split(' ');
            for (var i = triggers.length; i--;) {
              var trigger = triggers[i];
              if (trigger === 'click') {
                element.on('click', $tooltip.toggle);
              } else if (trigger !== 'manual') {
                element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
                element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
              }
            }
            if (options.show) {
              scope.$$postDigest(function () {
                options.trigger === 'focus' ? element[0].focus() : $tooltip.show();
              });
            }
          };
          $tooltip.destroy = function () {
            var triggers = options.trigger.split(' ');
            for (var i = triggers.length; i--;) {
              var trigger = triggers[i];
              if (trigger === 'click') {
                element.off('click', $tooltip.toggle);
              } else if (trigger !== 'manual') {
                element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
                element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
              }
            }
            if (tipElement) {
              tipElement.remove();
              tipElement = null;
            }
            scope.$destroy();
          };
          $tooltip.enter = function () {
            clearTimeout(timeout);
            hoverState = 'in';
            if (!options.delay || !options.delay.show) {
              return $tooltip.show();
            }
            timeout = setTimeout(function () {
              if (hoverState === 'in') {
                $tooltip.show();
              }
            }, options.delay.show);
          };
          $tooltip.show = function () {
            var parent = options.container ? findElement(options.container) : null;
            var after = options.container ? null : element;
            tipElement = $tooltip.$element = tipLinker(scope, function (clonedElement, scope) {
            });
            tipElement.css({
              top: '0px',
              left: '0px',
              display: 'block'
            }).addClass(options.placement);
            if (options.animation) {
              tipElement.addClass(options.animation);
            }
            if (options.type) {
              tipElement.addClass(options.prefixClass + '-' + options.type);
            }
            $animate.enter(tipElement, parent, after, function () {
            });
            $tooltip.$isShown = true;
            scope.$$phase || scope.$digest();
            requestAnimationFrame($tooltip.$applyPlacement);
            if (options.keyboard) {
              if (options.trigger !== 'focus') {
                $tooltip.focus();
                tipElement.on('keyup', $tooltip.$onKeyUp);
              } else {
                element.on('keyup', $tooltip.$onFocusKeyUp);
              }
            }
          };
          $tooltip.leave = function () {
            if (!$tooltip.$isShown) {
              return;
            }
            clearTimeout(timeout);
            hoverState = 'out';
            if (!options.delay || !options.delay.hide) {
              return $tooltip.hide();
            }
            timeout = setTimeout(function () {
              if (hoverState === 'out') {
                $tooltip.hide();
              }
            }, options.delay.hide);
          };
          $tooltip.hide = function (blur) {
            if (!$tooltip.$isShown)
              return;
            $animate.leave(tipElement, function () {
              tipElement = null;
            });
            scope.$$phase || scope.$digest();
            $tooltip.$isShown = false;
            if (options.keyboard) {
              tipElement.off('keyup', $tooltip.$onKeyUp);
            }
            if (blur && options.trigger === 'focus') {
              return element[0].blur();
            }
          };
          $tooltip.toggle = function () {
            $tooltip.$isShown ? $tooltip.leave() : $tooltip.enter();
          };
          $tooltip.focus = function () {
            tipElement[0].focus();
          };
          $tooltip.$applyPlacement = function () {
            if (!tipElement) {
              return;
            }
            var elementPosition = getPosition();
            var tipWidth = tipElement.prop('offsetWidth'), tipHeight = tipElement.prop('offsetHeight');
            var tipPosition = getCalculatedOffset(options.placement, elementPosition, tipWidth, tipHeight);
            tipPosition.top += 'px';
            tipPosition.left += 'px';
            tipElement.css(tipPosition);
          };
          $tooltip.$onKeyUp = function (evt) {
            evt.which === 27 && $tooltip.hide();
          };
          $tooltip.$onFocusKeyUp = function (evt) {
            evt.which === 27 && element[0].blur();
          };
          function getPosition() {
            if (options.container === 'body') {
              return dimensions.offset(element[0]);
            } else {
              return dimensions.position(element[0]);
            }
          }
          function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
            var offset;
            var split = placement.split('-');
            switch (split[0]) {
            case 'right':
              offset = {
                top: position.top + position.height / 2 - actualHeight / 2,
                left: position.left + position.width
              };
              break;
            case 'bottom':
              offset = {
                top: position.top + position.height,
                left: position.left + position.width / 2 - actualWidth / 2
              };
              break;
            case 'left':
              offset = {
                top: position.top + position.height / 2 - actualHeight / 2,
                left: position.left - actualWidth
              };
              break;
            default:
              offset = {
                top: position.top - actualHeight,
                left: position.left + position.width / 2 - actualWidth / 2
              };
              break;
            }
            if (!split[1]) {
              return offset;
            }
            if (split[0] === 'top' || split[0] === 'bottom') {
              switch (split[1]) {
              case 'left':
                offset.left = position.left;
                break;
              case 'right':
                offset.left = position.left + position.width - actualWidth;
              }
            } else if (split[0] === 'left' || split[0] === 'right') {
              switch (split[1]) {
              case 'top':
                offset.top = position.top - actualHeight;
                break;
              case 'bottom':
                offset.top = position.top + position.height;
              }
            }
            return offset;
          }
          return $tooltip;
        }
        return TooltipFactory;
      }
    ];
  }).directive('bsTooltip', [
    '$window',
    '$location',
    '$sce',
    '$tooltip',
    function ($window, $location, $sce, $tooltip) {
      var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
      return {
        restrict: 'EAC',
        scope: true,
        link: function postLink(scope, element, attr, transclusion) {
          var options = { scope: scope };
          angular.forEach([
            'template',
            'contentTemplate',
            'placement',
            'container',
            'delay',
            'trigger',
            'keyboard',
            'html',
            'animation',
            'type'
          ], function (key) {
            if (angular.isDefined(attr[key])) {
              options[key] = attr[key];
            }
          });
          angular.forEach(['title'], function (key) {
            attr[key] && attr.$observe(key, function (newValue, oldValue) {
              scope[key] = newValue;
              angular.isDefined(oldValue) && requestAnimationFrame(function () {
                tooltip && tooltip.$applyPlacement();
              });
            });
          });
          attr.bsTooltip && scope.$watch(attr.bsTooltip, function (newValue, oldValue) {
            if (angular.isObject(newValue)) {
              angular.extend(scope, newValue);
            } else {
              scope.content = newValue;
            }
            angular.isDefined(oldValue) && requestAnimationFrame(function () {
              tooltip && tooltip.$applyPlacement();
            });
          }, true);
          var tooltip = $tooltip(element, options);
          scope.$on('$destroy', function () {
            tooltip.destroy();
            options = null;
            tooltip = null;
          });
        }
      };
    }
  ]);
}(window, document));