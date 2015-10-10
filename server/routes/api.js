"use strict";

var koa = require('koa');
var router = require('koa-router')();
var path = require('path');
var pg = require('pg');
var connectionString = require(path.join(__dirname, '../', '../', 'config'));

var connect = function (cs) {
    return new Promise(function (resolve, reject) {
        pg.connect(cs, function (err, client, done) {
            if (err) {
                done();
                console.log(err);
                return reject(err);
            }
            return resolve([client, done]);
        });
    });
};

var app = koa();

router.post('/v1/todos', function* (next) {

    // Grab data from http request
    var data = {text: this.request.body.text, complete: false};

    try {
        // Get a Postgres client from the connection pool
        var ret = yield connect(connectionString);
        var client = ret[0];
        var done = ret[1];

        // SQL Query > Insert Data
        client.query("INSERT INTO items(text, complete) values($1, $2)", [data.text, data.complete]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        var results = yield new Promise(function (resolve, reject) {
            var results = [];

            query.on('error', function(ex) {
                done();
                reject(ex);
            });

            // Stream results back one row at a time
            query.on('row', function(row) {
                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function() {
                done();
                resolve(results);
            });
        });

        this.response.body = results;

    } catch (ex) {
        this.response.status = 500;
        this.response.body = {
            success: false,
            data: ex.message || ex
        };
    }
});

router.get('/v1/todos', function* (next) {

    try {
        // Get a Postgres client from the connection pool
        var ret = yield connect(connectionString);
        var client = ret[0];
        var done = ret[1];

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC;");

        var results = yield new Promise(function (resolve, reject) {
            var results = [];

            query.on('error', function(ex) {
                done();
                reject(ex);
            });

            // Stream results back one row at a time
            query.on('row', function(row) {
                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function() {
                done();
                resolve(results);
            });
        });

        this.response.body = results;
        
    } catch (ex) {
        this.response.status = 500;
        this.response.body = {
            success: false,
            data: ex.message || ex
        };
    }

});

router.put('/v1/todos/:todo_id', function* (next) {

    // Grab data from the URL parameters
    var id = this.params.todo_id;

    // Grab data from http request
    var data = {text: this.request.body.text, complete: this.request.body.complete};

    try {
        // Get a Postgres client from the connection pool
        var ret = yield connect(connectionString);
        var client = ret[0];
        var done = ret[1];

        // SQL Query > Update Data
        client.query("UPDATE items SET text=($1), complete=($2) WHERE id=($3)", [data.text, data.complete, id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        var results = yield new Promise(function (resolve, reject) {
            var results = [];

            query.on('error', function (err) {
                done();
                reject(err);
            });

            // Stream results back one row at a time
            query.on('row', function(row) {
                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function() {
                done();
                resolve(results);
            });
        });

        this.response.body = results;
        
    } catch (ex) {
        this.response.status = 500;
        this.response.body = {
            success: false,
            data: ex.message || ex
        };
    }

});

router.delete('/v1/todos/:todo_id', function* (next) {

    // Grab data from the URL parameters
    var id = this.params.todo_id;

    try {
        // Get a Postgres client from the connection pool
        var ret = yield connect(connectionString);
        var client = ret[0];
        var done = ret[1];

        // SQL Query > Delete Data
        client.query("DELETE FROM items WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        var results = yield new Promise(function (resolve, reject) {
            var results = [];

            query.on('error', function (err) {
                done();
                reject(err);
            });

            // Stream results back one row at a time
            query.on('row', function(row) {
                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function() {
                done();
                resolve(results);
            });
        });

        this.response.body = results;

    } catch (ex) {
        this.response.status = 500;
        this.response.body = {
            success: false,
            data: ex.message || ex
        };
    }

});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
