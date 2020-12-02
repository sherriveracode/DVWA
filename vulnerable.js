var url = require('url');
var util =require('util');
var textBody = require("body");
var jsonBody = require("body/json");
var formBody = require("body/form");
var fs = require('fs');
var anyBody = require("body/any");
var http = require("http");
var sendJson = require("send-data/json");
var Router = require("routes-router");
var sqlite3 = require('sqlite3').verbose();
var qs = require('qs');
var querystring = require('querystring');

// make a change

var app = Router({
    errorHandler: function(req, res, err) {
        console.log(err);
        res.end("500");
    },
    notFound: function(req, res, err) {
        console.log(err);
        console.log("got a 404 request: " + req.url);   // CWEID 117
        res.end("404");
    }
});

var memDb = function() {
    var db = new sqlite3.Database(":memory:");
    db.serialize(function() {
        db.run("CREATE TABLE testtbl (a INT, b TEXT)");
        db.run("INSERT INTO testtbl (a, b) VALUES (1, 'foo')");
        db.run("INSERT INTO testtbl (a, b) VALUES (2, 'bar')");
    });
    return db;
}

app.addRoute('/a/:id', function(req, res, opts) {
    var db = memDb();
    db.each("SELECT * FROM testtbl", function(err, row) {
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});

app.addRoute('/b/:id', function(req, res, opts) {
    var db = memDb();
    db.each("SELECT * FROM testtbl WHERE a = " + opts.params.id, function(err, row) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});
app.addRoute('/c/:id', function(req, res, opts) {
    var db = memDb();
    db.get("SELECT * FROM testtbl WHERE a = " + opts.params.id, function(err, row) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});
app.addRoute('/d/:id', function(req, res, opts) {
    var db = memDb();
    db.run("SELECT * FROM testtbl WHERE a = " + opts.params.id, function(err) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        res.end("");
    });
});
app.addRoute('/e/:id', function(req, res, opts) {
    var db = memDb();
    db.all("SELECT * FROM testtbl WHERE a = " + opts.params.id, function(err, row) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row[0].b);     // CWEID 80
    });
});
app.addRoute('/f/:id', function(req, res, opts) {
    var db = memDb();
    db.exec("SELECT * FROM testtbl WHERE a = " + opts.params.id, function(err) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        res.end("");
    });
});
app.addRoute('/g/:id', function(req, res, opts) {
    var db = memDb();
    var prep = db.prepare("SELECT * FROM testtbl WHERE a = " + opts.params.id);     // CWEID 89
    prep.run(function(err) {
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        res.end("ok");
    });
});
app.addRoute('/h/:id', function(req, res, opts) {
    var db = memDb();
    var prep = db.prepare("SELECT * FROM testtbl WHERE a = " + opts.params.id);     // CWEID 89
    prep.get(function(err, row) {
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});
app.addRoute('/i/:id', function(req, res, opts) {
    var db = memDb();
    var prep = db.prepare("SELECT * FROM testtbl WHERE a = " + opts.params.id);     // CWEID 89
    prep.all(function(err, row) {
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row[0].b);     // CWEID 80
    });
});
app.addRoute('/j/:id', function(req, res, opts) {
    var db = memDb();
    var prep = db.prepare("SELECT * FROM testtbl WHERE a = " + opts.params.id);     // CWEID 89
    prep.each(function(err, row) {
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});
app.addRoute('/k/:id', function(req, res, opts) {
    jsonBody(req, function(err, body) {
        if(err) {
            res.end(err.stack); // CWEID 201
            return;
        }
        var db;
        if(body.fname) {
            db = new sqlite3.Database(body.fname);       // CWEID 73
        } else {
            db = memDb();
        }
        var prep = db.prepare("SELECT * FROM testtbl WHERE a = " + opts.params.id);     // CWEID 89
        prep.each(function(err, row) {
            if(err) {
                res.end(err.stack);     // CWEID 201
            }
            console.log(row);
            res.end(row.b);     // CWEID 80
        });
    });
});
app.addRoute('/l/:id', function(req, res, opts) {
    var db = memDb();
    var s = req.url;
    var qstr = s.substring(s.indexOf('?')+1);
    var qparams = qs.parse(qstr);
    db.each("SELECT * FROM testtbl WHERE a = " + qparams.fooid, function(err, row) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});
app.addRoute('/m/:id', function(req, res, opts) {
    var db = memDb();
    var s = req.url;
    var qstr = s.substring(s.indexOf('?')+1);
    var qparams = querystring.parse(qstr);
    db.each("SELECT * FROM testtbl WHERE a = " + qparams.fooid, function(err, row) {       // CWEID 89
        if(err) {
            res.end(err.stack);     // CWEID 201
        }
        console.log(row);
        res.end(row.b);     // CWEID 80
    });
});


var serv = http.createServer(app);
serv.listen(8000);
