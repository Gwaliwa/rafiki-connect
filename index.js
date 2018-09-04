var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var socket = require('socket.io');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var htmlToPdf = require('html-to-pdf');
const fs = require('fs');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gwaliwa10@gmail.com',
    pass: 'Gwaliwa2010'
  }
});
/*var db_con = db_connect();
db_con.connect(function(err) {
        if (err) throw err;
 });*/
var db_pool = get_db_pool();

var app = express();
var appRoot = require('app-root-path');

const PORT = process.env.PORT || 4000

var server = app.listen(PORT, function(){
    console.log('Server listens at port '+PORT);
});

app.use(express.static('public'));

var sess;
app.post('/login',function(req,res){
    sess = req.session;
    console.log("..username...."+req.getP);

    res.end('done');

});

app.get('/logout',function(req,res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

var io = socket(server);

io.on('connection', function(socket){
    console.log('make socket connection');

    // Handle chat event
    socket.on('chat', function(data){
        // console.log(data);
        io.sockets.emit('chat', data);
        store_chat(data);
    });

    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

    socket.on('new-session', function(data){
        store_session(data);
    });

    socket.on('send-email', function(data){
        send_email(data);
        io.sockets.emit('email-sent', data);
    });

    socket.on('share-link', function(data){
        share_link(data);
        io.sockets.emit('link_shared', data);
    });

});

function store_session(data) {
    var date = formatDate(new Date());
    var name = data;
    var id = data+"-"+currDateMillsecs(new Date());
    var session_id = id.replace(/\s/g,"-");
    var sql = "INSERT INTO session (name, session_id, date) VALUES ('"+name+"', '"+session_id+"', '"+date+"')";
    /*db_con.query(sql, function (err, result) {
        if (err) throw err;
    });*/
    db_simple_query(sql);
    io.sockets.emit('home-redirect', session_id);
}

function send_email(data){
    var datetime = new Date();
    var pdf_name = 'chat_'+datetime.getTime()+'.pdf';
    var pdf_path = 'public/files/'+pdf_name;
    htmlToPdf.convertHTMLString(data.content, pdf_path,
        function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Created temp file: '+pdf_path);
            }
        }
    );
   var mailOptions = {
  from: 'gwaliwa10@gmail.com',
  to: data.email_to,
  subject: 'Attachment',
  text: 'Attached is the session message logs',
       attachments: [{
           filename: pdf_name,
           path: pdf_path,
           contentType: 'application/pdf'
       }]
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
      fs.unlink(pdf_path, function(error) {
          if (error) {
              throw error;
          }
          console.log('Deleted temp file: '+pdf_path);
      });
  }
});
}

function share_link(data){
   var mailOptions = {
  from: 'gwaliwa10@gmail.com',
  to: data.email_to,
  subject: 'Rafikiconnect url',
  text: 'rafikiconnect url:'+data.url
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log("share link-->>"+error);
  } else {
    console.log('link shared: ' + info.response);
  }
});
}

function store_chat(data) {
    var msg = data.message;
    var usr = data.user;
    var session_id = data.session_id;
    var date = formatDate(new Date());
    var sql = "INSERT INTO chat (username, message, session_id, date) VALUES ('"+usr+"', '"+msg+"', '"+session_id+"', '"+date+"')";
    /*db_con.query(sql, function (err, result) {
        if (err) throw err;
    });*/
    db_simple_query(sql);
}

function get_db_pool(){
    var pool  = mysql.createPool({
        connectionLimit : 10,
        host            : 'us-cdbr-iron-east-01.cleardb.net',
        user            : 'bed5f52a7cde0b',
        password        : 'fbc9a180',
        database        : 'heroku_3fd975a5135759a'
    });
    return pool;
}

/*function db_connect() {
    var con = mysql.createConnection({
        host: "us-cdbr-iron-east-01.cleardb.net",
        user: "bed5f52a7cde0b",
        password: "fbc9a180",
        database: "heroku_3fd975a5135759a"
    });
    return con;
}*/

function formatDate(date) {
    var d = new Date(date),
        year = d.getFullYear(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        hrs = '' + d.getHours(),
        mns = '' + d.getMinutes(),
        secs = '' + d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-')+' '+[hrs, mns, secs].join(':');
}

function currDateMillsecs(date) {
    var d = new Date(date),
        year = d.getFullYear(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        hrs = '' + d.getHours(),
        mns = '' + d.getMinutes(),
        secs = '' + d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return year+month+day+hrs+mns+secs;
}

app.get('/chat-logs/:session_id', function(req,res) {
    var session_id = req.params.session_id;
    var sql = "SELECT * FROM chat WHERE session_id='"+session_id+"' order by id asc";
    /*db_con.query(sql, function (err, result, fields) {
        var chatLogs = {'logs': result};
        var chatLogsJSONdata = JSON.stringify(chatLogs);
        res.send(chatLogsJSONdata);
    });*/
    db_pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(sql, function (error, results, fields) {
            var chatLogs = {'logs': results};
            var chatLogsJSONdata = JSON.stringify(chatLogs);
            connection.release();
            res.send(chatLogsJSONdata);
            if (error) throw error;
        });
    });
});

app.get('/chat-sessions', function(req,res) {
    var sql = "SELECT * FROM session order by id asc";
    /*db_con.query(sql, function (err, result, fields) {
        var chatSessions = {'sessions': result};
        var cchatSessionsJSONdata = JSON.stringify(chatSessions);
        res.send(cchatSessionsJSONdata);
    });*/
    db_pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(sql, function (error, results, fields) {
            var chatSessions = {'sessions': results};
            var chatSessionsJSONdata = JSON.stringify(chatSessions);
            connection.release();
            res.send(chatSessionsJSONdata);
            if (error) throw error;
        });
    });
});

function db_simple_query(sql) {
    db_pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(sql, function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();
            if (error) throw error;
        });
    });
}