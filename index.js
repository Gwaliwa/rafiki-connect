var express = require('express');
var socket = require('socket.io');
var mysql = require('mysql');
var db_con = db_connect();
db_con.connect(function(err) {
        if (err) throw err;
 });

var app = express();

const PORT = process.env.PORT || 4000

var server = app.listen(PORT, function(){
	console.log('Server listens at port '+PORT);
});

app.use(express.static('public'));

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

});

function store_session(data) {
    var date = formatDate(new Date());
    var name = data;
    var id = data+"-"+date;
    var session_id = id.replace(/\s/g,"-");
    var sql = "INSERT INTO session (name, session_id, date) VALUES ('"+name+"', '"+session_id+"', '"+date+"')";
    db_con.query(sql, function (err, result) {
        if (err) throw err;
    });
    io.sockets.emit('home-redirect', session_id);
}

function store_chat(data) {
        var msg = data.message;
        var usr = data.user;
        var session_id = data.session_id;
        var date = formatDate(new Date());
           var sql = "INSERT INTO chat (username, message, session_id, date) VALUES ('"+usr+"', '"+msg+"', '"+session_id+"', '"+date+"')";
           db_con.query(sql, function (err, result) {
               if (err) throw err;
               console.log("1 msg inserted");
           });
}

function db_connect() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "notepadDB"
    });
    return con;
}

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

app.get('/chat-logs/:session_id', function(req,res) {
    var session_id = req.params.session_id;
    db_con.query("SELECT * FROM chat WHERE session_id='"+session_id+"' order by id asc", function (err, result, fields) {
        var chatLogs = {'logs': result};
        var chatLogsJSONdata = JSON.stringify(chatLogs);
        res.send(chatLogsJSONdata);
    });
});

app.get('/chat-sessions', function(req,res) {
    db_con.query("SELECT * FROM session order by id asc", function (err, result, fields) {
        var chatSessions = {'sessions': result};
        var cchatSessionsJSONdata = JSON.stringify(chatSessions);
        res.send(cchatSessionsJSONdata);
    });
});