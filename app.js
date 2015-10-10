var koa = require('koa');
var path = require('path');
var favicon = require('koa-favicon');
var logger = require('koa-morgan');
var bodyParser = require('koa-bodyparser');
var koaStatic = require('koa-static');
var mount = require('koa-mount');

var app = koa();

// view engine setup
//var views = require('./server/views');
//app.use(
//    views(path.join(__dirname, 'server/views'), {
//    })
//);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.middleware('dev'));
app.use(bodyParser());
app.use(koaStatic(path.join(__dirname, './client', 'public')));
app.use(koaStatic(path.join(__dirname, './client', 'views')));

// development error handler
// will print stacktrace
if (app.env === 'development') {
    app.use(function* __errorHandler__(next) {
        try {
            yield next;
        } catch (ex) {
            this.status = ex.status || 500;
            this.response.body = ex.message;
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function* __errorHandler__(next) {
    try {
        yield next;
    } catch (ex) {
        this.status = ex.status || 500;
        this.response.body = ex.message;
    }
});

var router = require('./server/routes');
app.use(mount('/api', router.api));

module.exports = app;
