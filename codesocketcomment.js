script(type='text/javascript').
	var name = "#{user}";
	var socket = io();
	var userList = [];
	socket.on('update', function (users){
		userList = users;
		$('#user').empty();
		for(var i=0; i<userList.length; i++) {
			var username = JSON.stringify(userList[i].username).split('"').join('');
			if( username != name ){
				$('#user').append("<p><a id='username'>" + username + "</a></p>");
				$( "a#username" ).unbind().click(function() {				
					console.log("Hiciste click en: " + $( this ).text());
					var oponente = $(this).text();
					socket.on('challenge', oponente); 					
				});
			}
		}
	});	