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

 function scrollToBottom(){
     $('#chat_msgs_sect').animate({
      scrollTop: $('#chat_msgs_sect')[0].scrollHeight
    }, 1000);
  }
