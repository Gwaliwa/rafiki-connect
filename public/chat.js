var socket  = io.connect('/');
// var socket  = io.connect('http://localhost:4000/');

// Query DOM
var message = document.getElementById('message'),
      user = document.getElementById('user'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback');

// Emit events
btn.addEventListener('click', function(){
  socket.emit('chat', {
      message: message.value,
      user: user.value,
      session_id: $('#session_id').val()
  });
  message.value = "";
});

message.addEventListener('keyup', function(){
  socket.emit('typing', {
      message: message.value,
      user: user.value,
      session_id: $('#session_id').val()
  });
});

// Listen for events
socket.on('chat', function(data){
    if(data.session_id == $('#session_id').val()) {
        feedback.innerHTML = '';
        output.innerHTML += '<p><strong>' + data.user + ': </strong>' + data.message + '</p>';
    }
    scrollToBottom();
});

socket.on('typing', function(data){
    if(data.session_id == $('#session_id').val()){
        feedback.innerHTML = '<p><em>' + data.user + ': '+ data.message +'</em></p>';
        scrollToBottom();
    }
});

$('.btn_email_to').on("click", function(){
    var from = $('#user').val();
    var to = $('.email_to').val();
    var msg_logs = $('#output').html();
    socket.emit('send-email', {
      email_from: from,
      email_to: to,
      msg_logs: msg_logs
  });
});

socket.on('email-sent', function(data){
    if(data.email_from == $('#user').val()){
        alert("Email sent successfully!");
    }
});

$('.btn_link_share').on("click", function(){
    var from = $('#user').val();
    var to = $('.email_to').val();
    var url = window.location.href;
    socket.emit('share-link', {
      email_from: from,
      email_to: to,
      url: url
  });
});

socket.on('link_shared', function(data){
    if(data.email_from == $('#user').val()){
        alert("Link shared successfully!");
    }
});


 function scrollToBottom(){
     $('#chat_msgs_sect').animate({
      scrollTop: $('#chat_msgs_sect')[0].scrollHeight
    }, 1000);
  }
