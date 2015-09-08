'use strict';
var CJM = require('carbono-json-messages');
var uuid = require('node-uuid');

module.exports = function (app, models) {

    /**
     * Root test
     * @todo Needs implementation
     * @param {Object} req - Request object
     * @param {Object} res - Response object (will carry a success or error
     * carbono-json-message)
     */
    this.root = function (req, res) {
        var cjm = new CJM({apiVersion: '1.0'});
        try {
            if (!req) {
                res.status(400);
                var err = {
                       code: 400,
                       message: 'req must be something',
                   };
                cjm.setError(err);
            } else {
                cjm.setData(
                   {
                       id: uuid.v4(),
                       items: [
                            {
                                success: 'You got it right!',
                            },
                           ],
                   }
                );
            }
            res.json(cjm);
            res.end();
        } catch (e) {
            res.status(500).end();
        }
    };

    /**
     * New user
     * @todo Needs implementation
     * @param {Object} req - Request object
     * @param {string} req.body.username - Username (email) of the user
     * @param {string} req.body.password - Password of the user
     * @param {Object} res - Response object (will carry a success or error
     * carbono-json-message)
     */
    this.new = function (req, res) {
        var cjm = new CJM({apiVersion: '1.0'});
        try {
            if (!req.body || !req.body.username || !req.body.password) {
                res.status(400);
                var err = {
                       code: 400,
                       message: 'Missing parameter',
                   };
                cjm.setError(err);
                res.json(cjm);
                res.end();
            } else {
                var user = models.User.build({
                    email: req.body.username,
                    password: req.body.password,
                });

                user.save().then(
                    function () {
                        cjm.setData(
                           {
                               id: uuid.v4(),
                               items: [
                                    {
                                        success: 'You got it right!',
                                    },
                                   ],
                           }
                        );
                        res.json(cjm);
                        res.end();
                    },
                    function (err) {
                        if (err) {
                            console.log(err);
                            res.status(400);
                            var error = {
                                   code: 400,
                                   message: err.message,
                                   errors: err.errors,
                               };
                            cjm.setError(error);
                            res.json(cjm);
                            res.end();
                        }
                    }
                );
            }
        } catch (e) {
            res.status(500).end();
        }
    };

    return this;
};
