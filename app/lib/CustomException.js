'use strict';

/**
 * Class with custom exceptions
 *
 * @Class
 */
var CustomException = function() {
    return this;
}

/**
 * Exception of string exceeded length
 *
 * @function
 * @param {string} paramName - The name of the parameter
 * @param {number} exprectedLength - The length exprected
 * @param {string} param - The value of the parameter
 *
 * @retuns {string} The custom exception message
 */
CustomException.prototype.StringLengthException = function(paramName, 
expectedLength, param) {
    this.value = param;
    this.size = param.size;
    this.paramName = paramName;
    this.expectedLength = expectedLength;
    return this.paramName + '(' + this.value + ') expected to have length of '
    + this.expectedLength + ' but has length of ' + this.size;
};

module.exports = CustomException;