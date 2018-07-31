// var socket  = io.connect('/');
var socket  = io.connect('http://localhost:4000/');

// Query DOM
var newSessionBtn = document.getElementById('btn-new-session');
var viewSessionBtn = document.getElementById('btn-view-session');

newSessionBtn.addEventListener('click', function(){
    var newSession = $('#new-session').val();
    socket.emit('new-session', newSession);
});

socket.on('home-redirect', function(data){
    window.location.replace('/notepad.html?session_id='+data);
});

viewSessionBtn.addEventListener('click', function(){
    var session_id = $('#session-id').val();
    window.location.replace('/notepad.html?session_id='+session_id);
});