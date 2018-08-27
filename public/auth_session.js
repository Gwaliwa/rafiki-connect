var socket  = io.connect('/');

var loginBtn = document.getElementById('login');
/*var usrnm = $('#username').val();
var pass = $('#password').val();*/

loginBtn.addEventListener('click', function(){
    window.location.replace('/home.html');
});


