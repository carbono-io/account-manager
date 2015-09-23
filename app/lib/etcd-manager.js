'use strict';

var config          = require('config');
var ServiceManager  = require('carbono-service-manager');
var Q               = require('q');
var url             = require('url');
require('colors');

var PATH_ACCOUNT_MANAGER = '/account-manager';
var ACCM_SERVICE_KEY = 'accm';

/**
 * This class acts as a 'wrapper' for carbono-service-manager module, which is
 * responsible to register and find services.
 *
 * @class EtcdManager
 */
var EtcdManager = function () {
    return this;
};

/**
 * Registers a submodule as a service at etcd.
 *
 * @param {Object} Object representing a ServiceManager.
 * @param {string} service - Service identifier.
 * @param {string} path - Path to access the submodule.
 *
 * @function
 */
function register(serviceManager, service, path) {
    var promise = serviceManager.registerService(service, path);
    promise.then(
        function () {
            console.log(service + ' submodule registered');
        }, function (err) {
            console.log('[ERROR] Registering ' + service +
                ' with etcd: ' + err);
        });
    return promise;
}

/**
 * Registers all mocks at etcd.
 *
 * @return {Object} Array of promisses, with all submodules to be registered.
 * @function
 */
function registerAll() {
    if (process.env.ETCD_SERVER) {
        var serviceManager = new ServiceManager(process.env.ETCD_SERVER);

        var basePath = url.format({
            protocol: 'http',
            hostname: config.get('host'),
            port: config.get('port'),
        });

        return Q.all([
            register(serviceManager, ACCM_SERVICE_KEY,
                    url.resolve(basePath, PATH_ACCOUNT_MANAGER)),
        ]);

    } else {
        console.log(
            'The environment variable ETCD_SERVER is not defined!'.bold.red);
        console.log('Please, define it before continuing, otherwise the'.red);
        console.log('integration will not work!'.red);
        console.log();
        return null;
    }
}

/**
 * Initialize the communication with etcd. An environment variable named
 * ETCD_SERVER must exist, with an URL location to access etcd.
 *
 * @function
 */
EtcdManager.prototype.init = function () {
    var promises = registerAll();
    if (promises) {
        promises.then(
            function () {
                console.log('Everything was correctly registered at etcd.'
                    .green);
            }, function () {
                console.log('Error while registering submodules at etcd.'
                    .bold.red);
                console.log('They may not work correctly with other services.'
                    .red);
            }
        );
    }
};

module.exports = EtcdManager;
