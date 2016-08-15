//https://github.com/Bluefieldscom/intl-tel-input
(function() {
	"use strict";
	angular.module("internationalPhoneNumber", [])
		.directive('internationalPhoneNumber', function($timeout, $rootScope) {
			return {
				restrict: 'A',
				require: '^ngModel',
				scope: {
					ngModel: '=',
					defaultCountry: '=',
					countries: '='
				},
				link: function(scope, element, attrs, ctrl) {

					var setup = function(){
						//Set value
						$timeout(function(){
						  	if (scope.ngModel && scope.ngModel.cleaned != undefined){
						  		element.intlTelInput('setNumber', scope.ngModel.cleaned);
						  	} else if (scope.ngModel && scope.ngModel.number != undefined){
						  		element.intlTelInput('setNumber', scope.ngModel.number);
						  	} else if (typeof scope.ngMode == "string") {
						  		element.intlTelInput('setNumber', scope.ngModel);
						  	} else {
						  		element.intlTelInput('setNumber', "");
						  	}
						});
						var handleWhatsSupposedToBeAnArray, options, read, watchOnce;
						if (ctrl) {
						  	if (element.val() !== '') {
						  		$timeout(function() {
						  			element.intlTelInput('setNumber', element.val());
						  			return ctrl.$setViewValue(element.val());
						  		}, 0);
						  	}
						};
						read = function() {

							//Prep number object
							var _config = $(element).intlTelInput("getSelectedCountryData"),
							    _number = {
									number: element.val(),
									cleaned: $(element).intlTelInput("getNumber"),
									original: element.val().replace(" ", ""),
									country_code: _config.iso2,
									dial_code: _config.dialCode
								}

							//areaCodes: _config.areaCodes,
							//name: _config.name,
							//priority: _config.priority

							scope.ngModel = _number;
							//return ctrl.$setViewValue(element.val());
						};
						handleWhatsSupposedToBeAnArray = function(value) {
							if (value instanceof Array) {
								return value;
							} else {
								return value.toString().replace(/[ ]/g, '').split(',');
							}
						};
						options = {
							autoPlaceholder: true,
							autoFormat: true,
							autoHideDialCode: true,
							defaultCountry: '',
							nationalMode: true,
							numberType: '',
							onlyCountries: scope.countries && scope.countries.length ? scope.countries : (void 0),
							preferredCountries: ($rootScope.defaultCountry ? [$rootScope.defaultCountry.toLowerCase()] : ['gb', 'us']),
							responsiveDropdown: false,
							utilsScript: ""
						};
						angular.forEach(options, function(value, key) {
							var option;
							if (!(attrs.hasOwnProperty(key) && angular.isDefined(attrs[key]))) {
								return;
							}
							option = attrs[key];
							if (key === 'preferredCountries') {
								return options.preferredCountries = handleWhatsSupposedToBeAnArray(option);
							} else if (key === 'onlyCountries') {
								return options.onlyCountries = handleWhatsSupposedToBeAnArray(option);
							} else if (typeof value === "boolean") {
								return options[key] = option === "true";
							} else {
								return options[key] = option;
							}
						});
						watchOnce = scope.$watch('ngModel', function(newValue) {
							return scope.$$postDigest(function() {

								if (scope.ngModel == undefined || (scope.ngModel && (!scope.ngModel.number || scope.ngModel.country_code)) ){

									//Set default country
									options.defaultCountry = $rootScope.defaultCountry;
									if (newValue !== null && newValue !== void 0 && newValue !== '') {
										element.val(newValue);
									}

									element.intlTelInput(options);
									if (!(attrs.skipUtilScriptDownload !== void 0 || options.utilsScript)) {
										element.intlTelInput('loadUtils', '/bower_components/international-phone-number/js/utils.js');
									}

									//Remove Blank Option
									$(element).parent('.intl-tel-input').find('[data-country-code=none]').remove();

									scope.$apply();


								} else {

									if (newValue && newValue.number != undefined){
										options.preferredCountries = [];
										element.val(newValue.number);
									} else {
										element.val("");
									}
									element.intlTelInput(options);
								}

								return watchOnce();
							});
						});

						ctrl.$formatters.push(function(value) {
							if (!value) {
								return value;
							} else {
								$timeout(function() {
									if (value.number != undefined){
										return element.intlTelInput('setNumber', value.number);
									} else if (typeof value == "string") {
										return element.intlTelInput('setNumber', value);
									} else {
										return element.intlTelInput('setNumber', "");
									}
								});
								return element.val();
							}
						});

						ctrl.$parsers.push(function(value) {
							if (!value) {
								return value;
							}
							return value.replace(/[^\d]/g, '');
						});

						if (ctrl.$validators){
							ctrl.$validators.internationalPhoneNumber = function(value) {
								if (element.attr('required')) {
									if (!value) {
										return false;
									} else {
										return element.intlTelInput("isValidNumber");
									}
								} else {
									if (element.intlTelInput("getSelectedCountryData").dialCode === value) {
										return true;
									} else {
										if (!value) {
											return true;
										} else {
											return element.intlTelInput("isValidNumber");
										}
									}
								}
							};
						};
						element.on('blur focus keyup change', function(event) {
							var escapedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Meta', 'Backspace'];
							if(escapedKeys.indexOf(event.key) === -1) { return scope.$apply(read); }
						});
						return element.on('$destroy', function() {
							element.intlTelInput('destroy');
							return element.off('blur focus keyup change');
						});

					}

					$rootScope.defaultCountry = Gecko.geo && Gecko.geo !== undefined ? Gecko.geo.country_code : '';
					setup();

				}
			};
		}
	);
}).call(this);