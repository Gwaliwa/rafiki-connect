var socket  = io.connect('/');

var loginBtn = document.getElementById('login');

loginBtn.addEventListener('click', function(){
    authenticateUser();
});

function authenticateUser() {
    var req = new XMLHttpRequest();
    var username = $('#username').val();
    var password = $('#password').val();
    var url = '/login/'+username+'/'+password;

    req.open('GET',url,true);
    req.addEventListener('load',onLoad);
    req.addEventListener('error',onError);

    req.send();

    function onLoad() {
        var responseTxt = this.responseText;
        console.log("....receioved..."+responseTxt);
        if(responseTxt == "error"){
            $('#invalidCredWarning').fadeIn(1000);
            $('#invalidCredWarning').fadeOut(1000);
        }else{
            var response = JSON.parse(responseTxt);
            if(response[0].id > 0){
                window.location.replace('/home.html');
            }else{
                $('#invalidCredWarning').fadeIn(1000);
                $('#invalidCredWarning').fadeOut(1000);
            }
        }
    }

    function onError() {
        // handle error here, print message perhaps
        console.log('error receiving async AJAX call');
    }

}


