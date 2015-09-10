'use strict';
var RequestHelper = require('../app/lib/RequestHelper.js');
var should = require('should');

describe('RequestHelper', function () {

    beforeEach(function () {
        this.helper = new RequestHelper();
        this.validRequest = {
            body: {
                apiVersion: '1.0',
                id: '12345',
                data: {
                    id: '98765',
                    items: [
                        {obj: 'fake'},
                    ],
                },
            },
        };
        this.res = {
            resStatus: 0,
            resData: null,

            end: function () {},
            status: function (code) {
                this.resStatus = code;
            },
            json: function (cjm) {
                this.resData = cjm;
            },
        };
    });

    describe('checkMessageStructure()', function () {
        it('check ID field', function () {
            delete this.validRequest.body.id;
            var success = this.helper.checkMessageStructure(this.validRequest);
            should.exist(success);
            success.should.be.a('boolean');
            success.should.be.equal(false);
        });

        it('check ApiVersion field', function () {
            delete this.validRequest.body.apiVersion;
            var success = this.helper.checkMessageStructure(this.validRequest);
            should.exist(success);
            success.should.be.a('boolean');
            success.should.be.equal(false);
        });

        it('check Data field', function () {
            delete this.validRequest.body.data;
            var success = this.helper.checkMessageStructure(this.validRequest);
            should.exist(success);
            success.should.be.a('boolean');
            success.should.be.equal(false);
        });

        it('check Data.Id field', function () {
            delete this.validRequest.body.data.id;
            var success = this.helper.checkMessageStructure(this.validRequest);
            should.exist(success);
            success.should.be.a('boolean');
            success.should.be.equal(false);
        });

        it('check Data.Items field', function () {
            delete this.validRequest.body.data.items;
            var success = this.helper.checkMessageStructure(this.validRequest);
            should.exist(success);
            success.should.be.a('boolean');
            success.should.be.equal(false);
        });
    });

    describe('checkRequiredData()', function () {
        it('don\'t break when facing a null parameter', function () {
            var missingProp = this.helper.checkRequiredData(null);
            should.exist(missingProp);
            missingProp.should.be.an('array');
            missingProp.should.have.length(0);

            missingProp = this.helper.checkRequiredData({foo: 'bar'});
            should.exist(missingProp);
            missingProp.should.be.an('array');
            missingProp.should.have.length(0);
        });

        it('don\'t break when facing an empty object', function () {
            var missingProp = this.helper.checkRequiredData({});
            should.exist(missingProp);
            missingProp.should.be.an('array');
            missingProp.should.have.length(0);

            missingProp = this.helper.checkRequiredData({foo: 'bar'}, []);
            should.exist(missingProp);
            missingProp.should.be.an('array');
            missingProp.should.have.length(0);
        });

        it('identify missing properties inside the object', function () {
            var data = {
                prop1: 'foo',
                prop2: 1,
                prop3: {
                    prop4: 'bar',
                },
            };
            var required = ['prop5', 'prop6'];

            var missingProp = this.helper.checkRequiredData(data, required);
            should.exist(missingProp);
            missingProp.should.be.an('array');
            missingProp.should.have.length(2);
            missingProp.should.contains('prop5');
            missingProp.should.contains('prop6');
        });

        it('recognize when a required property exists inside the object',
            function () {
                var data = {
                    prop1: 'foo',
                    prop2: 1,
                    prop3: {
                        prop4: 'bar',
                    },
                };
                var required = ['prop1', 'prop5'];

                var missingProp = this.helper.checkRequiredData(data, required);
                should.exist(missingProp);
                missingProp.should.be.an('array');
                missingProp.should.have.length(1);
                missingProp.should.contains('prop5');
                missingProp.should.not.contains('prop1');
            });
    });

    describe('createResponse()', function () {
        it('can\'t alter the response if no status code was passed',
            function () {
                var response = this.helper.createResponse(this.res);
                should.exist(response);
                should.equal(response, this.res);
            });

        it('create a valid success response with message', function () {
            var data = {
                id: '1234',
                items: [
                    {
                        foo: 'bar',
                    },
                ],
            };
            var response = this.helper.createResponse(this.res, 200, data);
            should.equal(response.resStatus, 200);
            should.exist(response.resData);
            should.equal(response.resData.data.id, '1234');
            should.equal(response.resData.data.items[0].foo, 'bar');
        });

        it('create a valid success response without message', function () {
            var response = this.helper.createResponse(this.res, 200);
            should.equal(response.resStatus, 200);
            should.not.exist(response.resData);
        });

        it('create a valid error response with message', function () {
            var response = this.helper.createResponse(this.res, 400, 'error!');
            should.equal(response.resStatus, 400);
            should.exist(response.resData);
            should.equal(response.resData.error.code, 400);
            should.equal(response.resData.error.message, 'error!');
        });
    });
});
