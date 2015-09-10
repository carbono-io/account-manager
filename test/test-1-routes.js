'use strict';
var request = require('supertest');
var should = require('chai').should();

var url = 'http://localhost:7888';

var server = request.agent(url);

function defaultResponse(res) {
    res.should.have.property('apiVersion');
    res.should.have.property('id');
    res.should.have.property('data');
    res.data.should.have.property('items');
    res.data.items.should.be.instanceof(Array);
}

function defaultErrorResponse(res) {
    res.should.have.property('apiVersion');
    res.should.have.property('id');
    res.should.have.property('error');
    res.error.should.have.property('code');
    res.error.should.have.property('message');
}

function correctPostMessage(info) {
    return {
            apiVersion: '1.0',
            id: '12345',
            data: {
                id: '98765',
                items: [
                    info,
                ],
            },
        };
}

var serverObj;

describe('Routing tests --> ', function () {
    before(function () {
        // Starting Server
        serverObj = require('../');
    });

    after(function () {
        // Closing Server
        var sequelize = require('../app/models/index.js');
        var promise = sequelize.sequelize.sync({force: true});
        promise.then(function () {
            serverObj.close();
        });
    });

    describe('Basic routes - This test should work when:', function () {
        it('can create a new profile', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'Paulo Cesar',
                        code: '00122eee',
                        email: 'email1@email.com',
                        password: 'senha123',
                    }))
                .expect(200)
                .end(function (err, res) {

                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(200);
                    done();
                });
        });

        it('cannot create a new profile without name', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        code: '00122eee',
                        email: 'email1@email.com',
                        password: 'senha123',
                    }))
                .expect(400)
                .end(function (err, res) {

                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    done();
                });
        });

        it('cannot create a new profile with the same code', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'Paulo1 Cesar',
                        code: '00122eee',
                        email: 'diferente@email.com',
                        password: 'senha123',
                    }))
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });
        it('cannot create a new profile with the same email', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'Paulo2 Cesar',
                        code: '007700',
                        email: 'email1@email.com',
                        password: 'senha123',
                    }))
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });
        it('cannot create a new profile with name too big', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'name example error nanme name example error' +
                        ' nanme name example error nanme name example error' +
                        ' nanme name example error nanme name example error' +
                        ' nanme name example error nanme name example error' +
                        ' nanme ashjash',
                        code: 'other',
                        email: 'another@email.com',
                        password: 'senha123',
                    }))
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot create a new profile with code too big', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'name',
                        code: 'ooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooo00000ooooooooooooo',
                        email: 'another@email.com',
                        password: 'senha123',
                    }))
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot create a new profile with email too big', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'name',
                        code: 'oooo',
                        email: 'oooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'o@email.com',
                        password: 'senha123',
                    }))
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot create a new profile with password too big',
        function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'name',
                        code: 'oooo',
                        email: 'email@email.com',
                        password: 'seooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooonha123',
                    }))
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('can retrieve an existing profile', function (done) {
            server
                .get('/profiles/' + '00122eee')
                .expect('Content-type',/json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(200);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultResponse(jsonResponse);
                        jsonResponse.data.items[0].
                        should.have.property('profile');
                        jsonResponse.data.items[0].
                        profile.should.have.property('code');
                        jsonResponse.data.items[0].
                        profile.should.have.property('email');
                        jsonResponse.data.items[0].
                        profile.should.have.property('name');
                        jsonResponse.data.items[0].
                        profile.should.have.property('password');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot retrieve a non-existing profile', function (done) {
            server
                .get('/profiles/' + 'fakeCode')
                .expect(404)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(404);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('code is too big (> 40)', function (done) {
            server
                .get('/profiles/' + 'oooooooooooooooooooooooooooooooooooo' +
                'oooooooooooooooooooooooo')
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    should.not.exist(err);
                    res.status.should.equal(400);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultErrorResponse(jsonResponse);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });
    });
});
