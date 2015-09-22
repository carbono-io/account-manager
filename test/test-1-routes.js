'use strict';

var request = require('supertest');
var should = require('chai').should();
var cp = require('child_process');
var sys = require('sys');
var spawn = require('child_process').spawn;
var changeNodeEnv = 'export NODE_ENV=test';
var showNodeEnv = 'echo $NODE_ENV';
var prepareSQLite = 'rm -rf carbono.sqlite | cp extra/db.sqlite carbono.sqlite';
var cpSQLite = ''
var cmdLine = 'rm -rf test/carbono.sqlite | cp test/extra/db.sqlite test/carbono.sqlite';

var url = 'http://localhost:7888/account-manager';

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
var profileCode = null;
function setCreatedProfileCode (code) {
    profileCode = code;   
}

function getCreatedProfileCode () {
    return profileCode;   
}

var serverObj;

describe('Routing tests --> ', function () {
    before(function () {    

        function puts(error, stdout, stderr) {
            if (error !== null) {
                console.log('CL Error -- ' + error, stdout, stderr);
            }
        }
        process.env.NODE_ENV = 'test';
        cp.exec(cmdLine, puts);

        serverObj = require('../');
    });

    after(function () {
        function puts(error, stdout, stderr) {
            if (error !== null) {
                console.log('CL Error -- ' + error, stdout, stderr);
            }
        }
        process.env.NODE_ENV = 'default';
        cp.exec(cmdLine, puts);
        serverObj.close();
    });

    describe('Basic routes - This test should work when:', function () {
        it('can create a new profile', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'Paulo Cesar',
                        email: 'email@email.com',
                        password: 'senha123',
                    }))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    try {
                        var jsonResponse = JSON.parse(res.body);
                        defaultResponse(jsonResponse);
                        jsonResponse.data.items[0].should.have.property('profile');
                        jsonResponse.data.items[0].profile.should.have.property('code');
                        setCreatedProfileCode(jsonResponse.data.items[0].profile.code);
                        jsonResponse.data.items[0].profile.should.have.property('name');
                        jsonResponse.data.items[0].profile.should.have.property('email');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot create a new profile without name', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        email: 'email1@email.com',
                        password: 'senha123',
                    }))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(400);
                    done();
                });
        });

        it('cannot create a new profile with the same email', function (done) {
            server
                .post('/profiles')
                .send(correctPostMessage({
                        name: 'Paulo2 Cesar',
                        email: 'email@email.com',
                        password: 'senha123',
                    }))
                .end(function (err, res) {
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
                        email: 'another@email.com',
                        password: 'senha123',
                    }))
                .end(function (err, res) {
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
                        email: 'oooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'o@email.com',
                        password: 'senha123',
                    }))
                .end(function (err, res) {
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
                        email: 'email@email.com',
                        password: 'seooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooonha123',
                    }))
                .end(function (err, res) {
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
                .get('/profiles/' + getCreatedProfileCode())
                .expect('Content-type',/json/)
                .end(function (err, res) {
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
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot retrieve a non-existing profile', function (done) {
            server
                .get('/profiles/' + 'fakeCode')
                .end(function (err, res) {
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
                .end(function (err, res) {
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

        it('a username is valid', function (done) {
            server
                .get('/users')
                .set('crbemail', 'email@email.com')
                .end(function (err, res) {
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
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('a username is not valid', function (done) {
            server
                .get('/users')
                .set('crbemail', 'invalidmail@email.com')
                .end(function (err, res) {
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

        it('a username is too big', function (done) {
            server
                .get('/users')
                .set('crbemail', 'oooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'o@email.com')
                .end(function (err, res) {
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

        it('a username and password are valid', function (done) {
            server
                .post('/login')
                .send(correctPostMessage({
                        email: 'email@email.com',
                        password: 'senha123',
                    }))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('email');
                        jsonRes.data.items[0].should.have.property('code');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('a username and password are not valid', function (done) {
            server
                .post('/login')
                .send(correctPostMessage({
                        email: 'noexist@email.com',
                        password: 'noexistpass',
                    }))
                .end(function (err, res) {
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

        it('a username too big', function (done) {
            server
                .post('/login')
                .send(correctPostMessage({
                        email: 'oooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'o@email.com',
                        password: 'noexistpass',
                    }))
                .end(function (err, res) {
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

        it('a password too big', function (done) {
            server
                .post('/login')
                .send(correctPostMessage({
                        email: 'email@email.com',
                        password: 'oooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo',
                    }))
                .end(function (err, res) {
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

        it('there are no parameters', function (done) {
            server
                .post('/login')
                .send(correctPostMessage({}))
                .end(function (err, res) {
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

    describe('Project Routes: Create and get: ', function () {
        it('can create a new project', function (done) {
            server
                .post('/projects')
                .set('crbemail', 'email@email.com')
                .send(correctPostMessage({
                        name: 'Projeto Teste',
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('can create a project with the same name as before',
        function (done) {
            server
                .post('/projects')
                .set('crbemail', 'email@email.com')
                .send(correctPostMessage({
                        name: 'Projeto Teste',
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot create a project with name too big', function (done) {
            server
                .post('/projects')
                .set('crbemail', 'email@email.com')
                .send(correctPostMessage({
                        name: 'oooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo',
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
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

        it('cannot create a project with crbemail too big', function (done) {
            server
                .post('/projects')
                .set('crbemail', 'oooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooo@email.com')
                .send(correctPostMessage({
                        name: 'Projeto teste',
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
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

        it('Can create a project with an enormous description',
        function (done) {
            server
                .post('/projects')
                .set('crbemail', 'email@email.com')
                .send(correctPostMessage({
                        name: 'Projeto Teste',
                        description: 'ooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo',
                    }))
                .end(function (err, res) {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot create a project without name', function (done) {
            server
                .post('/projects')
                .set('crbemail', 'email@email.com')
                .send(correctPostMessage({
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
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

        it('cannot create a project without description', function (done) {
            server
                .post('/projects')
                .set('crbemail', 'email@email.com')
                .send(correctPostMessage({
                        name: 'Projeto teste',
                    }))
                .end(function (err, res) {
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

        it('cannot create a project without crbemail', function (done) {
            server
                .post('/projects')
                .send(correctPostMessage({
                        name: 'Projeto teste',
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
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

        it('cannot create a project with fake crbemail', function (done) {
            server
                .post('/projects')
                .set('crbemail', 'fakeemail@email.com')
                .send(correctPostMessage({
                        name: 'Projeto teste',
                        description: 'Descricao do projeto teste',
                    }))
                .end(function (err, res) {
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

        it('can list projects from a existing user with shared projects',
        function (done) {
            server
                .get('/projects')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(200);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                        jsonRes.data.items[0].project
                        .should.have.property('access');
                        jsonRes.data.items[0].project
                        .should.have.property('owner');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('can list projects from a existing user without shared projects',
        function (done) {
            server
                .get('/projects')
                .set('crbemail', 'sarah.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(200);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                        jsonRes.data.items[0].project
                        .should.have.property('access');
                        jsonRes.data.items[0].project
                        .should.have.property('owner');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot list projects from a invalid user',
        function (done) {
            server
                .get('/projects')
                .set('crbemail', 'palhaco.pimpao@alegria.com')
                .end(function (err, res) {
                    res.status.should.equal(404);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot list projects from a email too big',
        function (done) {
            server
                .get('/projects')
                .set('crbemail', 'ooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo')
                .end(function (err, res) {
                    res.status.should.equal(400);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot list projects without email',
        function (done) {
            server
                .get('/projects')
                .end(function (err, res) {
                    res.status.should.equal(400);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('can get a project from a valid code',
        function (done) {
            server
                .get('/projects/code2222')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(200);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                        jsonRes.data.items[0].project
                        .should.have.property('access');
                        jsonRes.data.items[0].project
                        .should.have.property('owner');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('can get a project with write access',
        function (done) {
            server
                .get('/projects/code555')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(200);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                        jsonRes.data.items[0].project
                        .should.have.property('access');
                        jsonRes.data.items[0].project
                        .should.have.property('owner');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('can get a project with read access',
        function (done) {
            server
                .get('/projects/code666')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(200);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultResponse(jsonRes);
                        jsonRes.data.items[0].should.have.property('project');
                        jsonRes.data.items[0].project
                        .should.have.property('code');
                        jsonRes.data.items[0].project
                        .should.have.property('safeName');
                        jsonRes.data.items[0].project
                        .should.have.property('name');
                        jsonRes.data.items[0].project
                        .should.have.property('description');
                        jsonRes.data.items[0].project
                        .should.have.property('access');
                        jsonRes.data.items[0].project
                        .should.have.property('owner');
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot get project without permission',
        function (done) {
            server
                .get('/projects/code888')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(403);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot get project that does not exist',
        function (done) {
            server
                .get('/projects/fakeProjectCode')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(404);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot get project that does not exist',
        function (done) {
            server
                .get('/projects/code666')
                .set('crbemail', 'palhaco.pimpao@alegria.com')
                .end(function (err, res) {
                    res.status.should.equal(404);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot get project without user',
        function (done) {
            server
                .get('/projects/code666')
                .end(function (err, res) {
                    res.status.should.equal(400);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot get project with user too big',
        function (done) {
            server
                .get('/projects/code666')
                .set('crbemail', 'john.connor@oooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo')
                .end(function (err, res) {
                    res.status.should.equal(400);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        it('cannot get project with code too big',
        function (done) {
            server
                .get('/projects/oooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'oooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
                        'ooooooooooooooooooooooooooooooooooooooooooooooooo')
                .set('crbemail', 'john.connor@resistance.com')
                .end(function (err, res) {
                    res.status.should.equal(400);
                    should.not.exist(err);
                    try {
                        var jsonRes = JSON.parse(res.body);
                        defaultErrorResponse(jsonRes);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                });
        });

        // Put Delete projects com terminator e sarah
    //     it('can get a existing project', function (done) {
    //         server
    //             .get('/projects/projeto-teste')
    //             .expect(200)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(200);
    //                 try {
    //                     var jsonResponse = JSON.parse(res.body);
    //                     defaultResponse(jsonResponse);
    //                     jsonResponse.data.should.have.property('items');
    //                     jsonResponse.data.items[0].should.property('project');
    //                     jsonResponse.data.items[0].project
    //                     .should.property('safeName');
    //                     jsonResponse.data.items[0].project
    //                     .should.property('owner');
    //                     jsonResponse.data.items[0].project
    //                     .should.property('name');
    //                 } catch (e) {
    //                     return done(e);
    //                 }
    //                 done();
    //             });
    //     });

    //     it('cannot get a non-existing project', function (done) {
    //         server
    //             .get('/projects/projeto-fake')
    //             .expect(404)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(404);
    //                 done();
    //             });
    //     });

    //     it('cannot get a project without safeName', function (done) {
    //         server
    //             .get('/projects/')
    //             .expect(404)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(404);
    //                 done();
    //             });
    //     });

    //     it('cannot get a project with safeName too big', function (done) {
    //         server
    //             .get('/projects/ooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo')
    //             .expect(400)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(400);
    //                 done();
    //             });
    //     });
    // });
    // describe('Project Routes: update and delete: ', function () {
    //     it('can update an existing project', function (done) {
    //         server
    //             .put('/projects/projeto-teste')
    //             .set('Accept', 'application/json')
    //             .send(correctPostMessage({
    //                     name: 'Projeto Teste Mudado',
    //                     description: 'Descrição do projeto',
    //                 }))
    //             .expect(200)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(200);
    //                 done();
    //             });
    //     });

    //     it('can update the name of an existing project', function (done) {
    //         server
    //             .put('/projects/projeto-teste')
    //             .send(correctPostMessage({
    //                     name: 'Projeto Teste Mudado',
    //                 }))
    //             .expect(200)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(200);
    //                 done();
    //             });
    //     });

    //     it('can update the desc of an existing project', function (done) {
    //         server
    //             .put('/projects/projeto-teste')
    //             .send(correctPostMessage({
    //                     description: 'Descrição do projeto',
    //                 }))
    //             .expect(200)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(200);
    //                 done();
    //             });
    //     });

    //     it('cant update project without params', function (done) {
    //         server
    //             .put('/projects/projeto-teste')
    //             .send(correctPostMessage({
    //                 }))
    //             .expect(400)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(400);
    //                 done();
    //             });
    //     });

    //     it('cant update an existing project with safeNametoo big',
    //     function (done) {
    //         server
    //             .put('/projects/ooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo')
    //             .send(correctPostMessage({
    //                     name: 'Projeto Teste Mudado',
    //                     description: 'Descrição do projeto',
    //                 }))
    //             .expect(400)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(400);
    //                 done();
    //             });
    //     });

    //     it('cant update a non-existing project', function (done) {
    //         server
    //             .put('/projects/projeto-fake')
    //             .send(correctPostMessage({
    //                     name: 'Projeto Teste Mudado',
    //                     description: 'Descrição do projeto',
    //                 }))
    //             .expect(404)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(404);
    //                 done();
    //             });
    //     });

    //     it('cant update a existing project with name too big',
    //     function (done) {
    //         server
    //             .put('/projects/projeto-fake')
    //             .send(correctPostMessage({
    //                     name: 'ooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo',
    //                     description: 'Descrição do projeto',
    //                 }))
    //             .expect(400)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(400);
    //                 done();
    //             });
    //     });

    //     it('cant delete a non-existing project', function (done) {
    //         server
    //             .delete('/projects/projeto-fake')
    //             .expect(404)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(404);
    //                 done();
    //             });
    //     });

    //     it('cant delete a project without safeName', function (done) {
    //         server
    //             .delete('/projects/')
    //             .expect(404)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(404);
    //                 done();
    //             });
    //     });

    //     it('cant delete a project with safeName too big', function (done) {
    //         server
    //             .delete('/projects/ooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'oooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo' +
    //                     'ooooooooooooooooooooooooooooooooooooooooooooooooo')
    //             .expect(400)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(400);
    //                 done();
    //             });
    //     });

    //     it('can delete a existing project', function (done) {
    //         server
    //             .delete('/projects/projeto-teste')
    //             .expect(200)
    //             .end(function (err, res) {
                    
    //                 should.not.exist(err);
    //                 res.status.should.equal(200);
    //                 done();
    //             });
    //     });
    });
});
