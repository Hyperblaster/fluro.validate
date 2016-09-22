
console.log('Fluro Validate ha updated');

angular.module('fluro.validate', []);
angular.module('fluro.validate')
    .service('FluroValidate', function() {

        var controller = {};

        /////////////////////////////////////////////////////

        controller.validate = function(entry, field) {

             // console.log('VALIDATE', entry, field)

            //Required
            if (field.minimum > 0 && !entry) {
                // console.log(field.key, 'is required', entry)
                return false;
            }

            //Check if the value is an array or a value
            if (_.isArray(entry)) {

                console.log('Its an array', entry)
                //Run tests on array
                var array = entry;

                if (field.minimum == 1 && field.maximum == 1 && field.type != 'array') {
                    //console.log(field.key, 'array provided when a single value was expected')
                    return false; //Require a singular value not an array
                }

                if (array.length < field.minimum) {
                    //console.log(field.key, 'requires at least', field.minimum, 'values')
                    return false;
                }

                if (field.maximum) {
                    if (array.length > field.maximum) {
                        //console.log(field.key, 'requires less than', field.maximum, 'values')
                        return false;
                    }
                }

                /////////////////////////////

                var invalidEntries = _.filter(array, function(obj) {

                    var allowed = true;

                    //If there is a specified list of allowed values
                    if (field.allowedValues && field.allowedValues.length) {
                        allowed = _.contains(field.allowedValues, obj);
                    }

                    //Check if each entry is a valid value
                    var correctType = controller.validateType(obj, field.type);

                    if (allowed && correctType) {
                        //console.log('CORRECT TYPE', allowed, correctType)
                        return false;
                    } else {
                        //console.log(obj, 'is not a valid value for ', field.key, 'TESTING', allowed, field.type)
                        return true;
                    }
                });


                if (invalidEntries.length) {
                    // console.log('Invalid', invalidEntries.length)
                    return false;
                }

            } else {

                //Check against singular value
                if (field.minimum > 1) {
                    //console.log(field.key, 'Must be provided as an array not a singular value')
                    //Must have an array
                    return false;
                }

                if (field.minimum > 0) {
                    var correctType = controller.validateType(entry, field.type);
                    if (!correctType) {
                        console.log(field.key, 'Must be provided as an ' + field.type + ' type value', entry, 'was provided')
                        return false;
                    }
                }


                //If the user has provided a value then check if its in the allowed values
                if (entry) {
                    //If there is a specified list of allowed values
                    if (field.allowedValues && field.allowedValues.length) {
                        var allowed = _.contains(field.allowedValues, entry);

                        if (!allowed) {
                            console.log(entry, 'is not a valid singular value for field', field.key)
                            return false;
                        }
                    }
                }
            }


            return true;

        }

        /////////////////////////////////////////////////////

        controller.validateType = function(field, fieldType) {
            switch (fieldType.toLowerCase()) {
                case 'reference':
                    if (_.isString(field)) {
                        return validator.isMongoId(field);
                    } else {
                        return validator.isMongoId(field._id);
                    }
                    break;
                case 'email':
                    return validator.isEmail(field);
                    break;
                case 'url':
                    return validator.isURL(field);
                    break;
                case 'array':
                    return _.isArray(field);
                    break;
                case 'decimal':
                case 'float':
                case 'number':
                    // console.log('Validate Number', field, validator.isDecimal(field), validator.isInt(field));

                    var numberised = Number(field);
                    var isActual = (_.isFinite(numberised) && !_.isNaN(numberised));
                    console.log('Numberised', numberised, isActual);

                    return isActual;//validator.isDecimal(field) || validator.isInt(field);
                    break;
                case 'integer':
                    return validator.isInt(field);
                    break;
               
                // // console.log('Validate decimal float', field, validator.isDecimal(field));
                //     return validator.isDecimal(field);
                //     break;
                case 'string':
                    return _.isString(field);
                    break;
                case 'object':
                    return _.isObject(field);
                    break;
                case 'date':
                    return _.isDate(field);
                    break;
                case 'boolean':
                    return _.isBoolean(field);
                    break;
                case 'void':
                    //Always return true for void
                    return true;
                    break;
            }
        }

        /////////////////////////////////////////////////////
        return controller;


    });