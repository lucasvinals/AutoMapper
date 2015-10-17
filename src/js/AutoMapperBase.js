/// <reference path="../../dist/arcady-automapper-interfaces.d.ts" />
/// <reference path="TypeConverter.ts" />
/// <reference path="AutoMapperHelper.ts" />
/// <reference path="AutoMapperValidator.ts" />
var AutoMapperJs;
(function (AutoMapperJs) {
    'use strict';
    /**
     * AutoMapper implementation, for both creating maps and performing maps. Comparable usage and functionality to the original
     * .NET AutoMapper library is the pursuit of this implementation.
     */
    var AutoMapperBase = (function () {
        function AutoMapperBase() {
        }
        AutoMapperBase.prototype.getMapping = function (mappings, sourceKey, destinationKey) {
            var srcKey = this.getKey(sourceKey);
            var dstKey = this.getKey(destinationKey);
            var mapping = mappings[srcKey + dstKey];
            if (!mapping) {
                throw new Error("Could not find map object with a source of " + srcKey + " and a destination of " + dstKey);
            }
            return mapping;
        };
        AutoMapperBase.prototype.getKey = function (keyStringOrType) {
            if (typeof keyStringOrType === 'string') {
                return keyStringOrType;
            }
            else {
                return AutoMapperJs.AutoMapperHelper.getClassName(keyStringOrType);
            }
        };
        AutoMapperBase.prototype.isArray = function (sourceObject) {
            return sourceObject instanceof Array;
        };
        AutoMapperBase.prototype.handleArray = function (mapping, sourceArray, itemFunc) {
            var arrayLength = sourceArray.length;
            var destinationArray = new Array(sourceArray.length);
            for (var index = 0; index < arrayLength; index++) {
                var sourceObject = sourceArray[index];
                var destinationObject = void 0;
                if (sourceObject === null || sourceObject === undefined) {
                    destinationObject = sourceObject;
                }
                else {
                    destinationObject = this.createDestinationObject(mapping.destinationTypeClass);
                    itemFunc(sourceObject, destinationObject);
                }
                destinationArray[index] = destinationObject;
            }
            return destinationArray;
        };
        AutoMapperBase.prototype.handleItem = function (mapping, sourceObject, destinationObject, propertyFunction) {
            for (var sourcePropertyName in sourceObject) {
                if (!sourceObject.hasOwnProperty(sourcePropertyName)) {
                    continue;
                }
                propertyFunction(sourcePropertyName);
            }
            return destinationObject;
        };
        AutoMapperBase.prototype.handleProperty = function (mapping, sourceObject, sourcePropertyName, destinationObject, loopMemberValuesAndFunctions) {
            var propertyMapping = mapping.forMemberMappings[sourcePropertyName];
            if (propertyMapping) {
                // a forMember mapping exists
                var ignore = propertyMapping.ignore, conditionFunction = propertyMapping.conditionFunction, destinationProperty = propertyMapping.destinationProperty, mappingValuesAndFunctions = propertyMapping.mappingValuesAndFunctions;
                // ignore ignored properties
                if (ignore) {
                    return;
                }
                // check for condition function
                if (conditionFunction) {
                    // and, if there, return when the condition is not met.
                    if (conditionFunction(sourceObject) === false) {
                        return;
                    }
                }
                var memberConfigurationOptions = {
                    mapFrom: function () {
                        // no action required, just here as a stub to prevent calling a non-existing 'opts.mapFrom()' function.
                    },
                    condition: function (predicate) {
                        // no action required, just here as a stub to prevent calling a non-existing 'opts.mapFrom()' function.
                    },
                    sourceObject: sourceObject,
                    sourcePropertyName: sourcePropertyName,
                    intermediatePropertyValue: sourceObject[sourcePropertyName]
                };
                loopMemberValuesAndFunctions(propertyMapping.destinationProperty, mappingValuesAndFunctions, memberConfigurationOptions);
            }
            else {
                // no forMember mapping exists, auto map properties ...
                // ... except for the situation where ignoreAllNonExisting is specified.
                if (mapping.ignoreAllNonExisting) {
                    return;
                }
                // use profile mapping when specified; otherwise, specify source property name as destination property name.
                var destinationPropertyName = this.getDestinationPropertyName(mapping.profile, sourcePropertyName);
                this.setPropertyValue(mapping, destinationObject, destinationPropertyName, sourceObject[sourcePropertyName]);
            }
        };
        AutoMapperBase.prototype.setPropertyValue = function (mapping, destinationObject, destinationProperty, destinationPropertyValue) {
            if (mapping.forAllMemberMappings.length > 0) {
                for (var _i = 0, _a = mapping.forAllMemberMappings; _i < _a.length; _i++) {
                    var forAllMemberMapping = _a[_i];
                    forAllMemberMapping(destinationObject, destinationProperty, destinationPropertyValue);
                }
            }
            else {
                destinationObject[destinationProperty] = destinationPropertyValue;
            }
        };
        AutoMapperBase.prototype.createDestinationObject = function (destinationType) {
            // create empty destination object.
            return destinationType
                ? new destinationType()
                : {};
        };
        AutoMapperBase.prototype.getDestinationPropertyName = function (profile, sourcePropertyName) {
            if (!profile) {
                return sourcePropertyName;
            }
            // TODO BL no support yet for INamingConvention.splittingCharacter
            try {
                // First, split the source property name based on the splitting expression.
                // TODO BL Caching of RegExp splitting!
                var sourcePropertyNameParts = sourcePropertyName.split(profile.sourceMemberNamingConvention.splittingExpression);
                // NOTE BL For some reason, splitting by (my ;)) RegExp results in empty strings in the array; remove them.
                for (var index = sourcePropertyNameParts.length - 1; index >= 0; index--) {
                    if (sourcePropertyNameParts[index] === '') {
                        sourcePropertyNameParts.splice(index, 1);
                    }
                }
                return profile.destinationMemberNamingConvention.transformPropertyName(sourcePropertyNameParts);
            }
            catch (error) {
                return sourcePropertyName;
            }
        };
        return AutoMapperBase;
    })();
    AutoMapperJs.AutoMapperBase = AutoMapperBase;
})(AutoMapperJs || (AutoMapperJs = {}));

//# sourceMappingURL=AutoMapperBase.js.map