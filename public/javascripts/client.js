// Let's all wait on page load!
$(document).ready(function(){
//-----------------------------------------------------------------------------------------
// Inicialización de los titulos, socket, y los puntos.
	var socket = io();
	var lobbyList = $("#lobby-list");
	var lobbyCount = $("#lobby-count");
	var header = $("#header");
	var notify = $("#notify");
	var points = $("#points");
	var lobbytitle = $("#lobbytitle");
	var stats = $("#stats");
//-----------------------------------------------------------------------------------------
// Variables de manejo de ganadores y perdedores, con sus respectivos gifs.
	var winner = $(".winner");
	var win = $("#win");
	var loser = $(".loser");
	var lose = $("#lose");
	var party = $("#party");
	var travolta = $("#travolta");
//-----------------------------------------------------------------------------------------

	var playgroundTitle = $("#playground-title");
	var playgroundInvitee = $("#playground-opponent");
	var playgroundCards = $("#playground-cards");
	var $usernameInput = $('.usernameInput');

//-----------------------------------------------------------------------------------------
	var gif = false;
	var usuario = $("#usuario");
	var gameid = $("#gameid");
	var jugador1 = $("#jugador1");
	var jugador2 = $("#jugador2");
	var turnoCurrent = $("#turnoCurrent");
	var meE=$("#meE");
	var me;
	var other;
	var miGame;
	var idopo;    
	var turno;
	var cartaSelect;
//-----------------------------------------------------------------------------------------
// Variables encargadas de la mesa del juego, en cuanto a sus botone y muestras de turnos.
	var botonplay = $("#botonplay");
	var $jugar=$('.jugar');
	var $action=$('.action');

	var transitions = [];
	var  misTR = $('#misTR');
	
	var $buttonGround=$('.buttonGround');
	var $muestraTurno=$('.muestraTurno');
	var $playGround=$('.playGround');
	var $showr=$('.showr');
	var selecAction=$('#selecAction');
	var actionOpo = $("#actionOpo");
	var ep=$('#ep');
//-----------------------------------------------------------------------------------------
// Variables booleanas de las banderas de truco, retruco, valecuatro de cada jugador.
	var f_t = false;
	var f_rt =false;
	var f_v4 =false;

	var op_f_t = false;
	var op_f_rt =false;
	var op_f_v4 =false;

	var okplayCard= false;
	var historial=[];
//-----------------------------------------------------------------------------------------
// Variables relacionadas con las cartas, ya sea el arreglo donde van a ser almacenadas y
// eventualmente recorridas, como también sus clases e ids para ser trabajadas en JADE.
	var cartas = [];
	var indice;

	var misCartas = $('#misCartas');
	var $carta=$('.carta');

	var carta1=$('#carta1');
	var carta2=$('#carta2');
	var carta3=$('#carta3');

	var $carta1class=$('.carta1class');
	var $carta2class=$('.carta2class');
	var $carta3class=$('.carta3class');

	var c1op=$('#c1op');
	var c2op=$('#c2op');
	var c3op=$('#c3op');

	var c1j=$('#c1j');
	var c2j=$('#c2j');
	var c3j=$('#c3j');
//-----------------------------------------------------------------------------------------
// Variables para manejar la lectura
	var sacc="none";
	var $ac_pc =$('.ac-pc');
	var $ac_q =$('.ac-q');
	var $ac_nq =$('.ac-nq');
	var $ac_e =$('.ac-e');
	var $ac_t =$('.ac-t');
	var $ac_rt =$('.ac-rt');
	var $ac_vc =$('.ac-vc');
	var $ac_ee =$('.ac-ee');
	var $ac_re =$('.ac-re');
	var $ac_er =$('.ac-er');
	var $ac_eer =$('.ac-eer');
	var $ac_eef =$('.ac-eef');
	var $ac_erf =$('.ac-erf');
	var $ac_eerf =$('.ac-eerf');
	var $ac_rf =$('.ac-rf');
	var $ac_ef =$('.ac-ef');
	var $ac_fe =$('.ac-fe');
	var $ac_m=$('.ac-m');

//-----------------------------------------------------------------------------------------
// Capturadoras de las acciones de los botones.
	$ac_pc.click(function(){sacc = $ac_pc.val();});
	$ac_q.click(function(){sacc = $ac_q.val();});
	$ac_nq.click(function(){sacc = $ac_nq.val();});
	$ac_e.click(function(){sacc = $ac_e.val();});
	$ac_t.click(function(){sacc = $ac_t.val();});
	$ac_rt.click(function(){sacc = $ac_rt.val();});
	$ac_vc.click(function(){sacc = $ac_vc.val();});
	$ac_ee.click(function(){sacc = $ac_ee.val();});
	$ac_re.click(function(){sacc = $ac_re.val();});
	$ac_er.click(function(){sacc = $ac_er.val();});
	$ac_eer.click(function(){sacc = $ac_eer.val();});
	$ac_eef.click(function(){sacc = $ac_eef.val();});
	$ac_erf.click(function(){sacc = $ac_erf.val();});
	$ac_eerf.click(function(){sacc = $ac_eerf.val();});
	$ac_rf.click(function(){sacc = $ac_rf.val();});
	$ac_ef.click(function(){sacc = $ac_ef.val();});
	$ac_fe.click(function(){sacc = $ac_fe.val();});
	$ac_m.click(function(){
		var ult=historial[historial.length-1];
		sacc=(ult=="playcard"|| (historial.length==0)||ult=="quiero"||ult=="no-quiero")?"mazo":"no-quiero"
	});

//-----------------------------------------------------------------------------------------
// Función del click para poder setear y restringir jugadas realizadas.
	$jugar.click(function(){
		var actionok = false;
		for(var i in transitions){
			 if(sacc==transitions[i] || sacc=="mazo"){
				actionok = true;
			 }
		}
		if(!actionok&& sacc=="none"){
			 notifyUser("Acción no válida.");   
		}else{
			if (sacc=="playcard"){
				var aux = cartaSelect;
				if(me.username == turno){
					if (indice == 0){ carta1.html(""); }
					if (indice == 1){ carta2.html(""); }
					if (indice == 2){ carta3.html(""); }
					socket.emit("jugando",miGame,me,sacc,idopo, aux);
					sacc="none";
				}else{
					notifyUser("No es tu turno.");
				}
			}else{
				if(me.username == turno){
					socket.emit("jugando",miGame,me,sacc,idopo);
					if (sacc=="truco") {   f_t = true;  };
					if (sacc=="retruco") {  f_rt = true;   };
					if (sacc=="valecuatro") {f_v4 =true;   };
					sacc="none";
				}else{
					notifyUser("No es tu turno.");
				}
			}
			actionOpo.html("");
			ocultaOpciones(transitions);   
		}
	});
//-----------------------------------------------------------------------------------------
// Selección de cada carta a través de un click, asignando un indice para cada una.
	$carta1class.click(function(){
		if(okplayCard == true){
			indice =  0;
			sacc="playcard";
			cartaSelect = cartas[indice].number + "-"+ cartas[indice].suit;
		}  
	});    

	$carta2class.click(function(){
		if(okplayCard == true){
			indice =  1;
			sacc="playcard";
			cartaSelect = cartas[indice].number + "-"+ cartas[indice].suit;
		}
	});    

	$carta3class.click(function(){
		if(okplayCard == true){
			indice =  2;
			sacc="playcard";
			cartaSelect = cartas[indice].number + "-"+ cartas[indice].suit;
		}  
	});
//-----------------------------------------------------------------------------------------
// Socket encargado de la muestra del juego, de las opciones, las jugadas, las cartas,
// y la mesa en general.
	socket.on('muestra', function(game,gid,oponente, t, tr,accion,opname){
		sacc="none";
		$("body").css("background-image", "url(/images/fondoplay.jpg)").show("fast");
		$("#uc").fadeOut("fast");
		lobbytitle.html("");
		transitions = [];
		for(var i in tr){
			transitions.push([tr[i]]);
		}
		misTR.html(transitions + "");
		okplayCard= false;
		if (accion=="quiero") {   okplayCard= true;  };
		if (accion=="no-quiero") {  okplayCard = true;   };
		if (accion=="playcard") { okplayCard =true;   };
		if (accion=="init") { okplayCard =true;   };
		if (accion=="primer-carta") { okplayCard =true;   };
		if (accion=="played-card") { okplayCard =true;   };
		if (accion==undefined && opname==undefined){
			actionOpo.html("");
			okplayCard= true;
		}else{

			if (accion=="playcard") {  
				actionOpo.html(opname + " ha jugado una carta "); 
			};
			if (accion=="mazo") { 
				actionOpo.html(opname + " se fue al mazo "); 
			};
			if (accion=="truco") {   
				op_f_t = true;  
				actionOpo.html(opname + " cantó truco"); 
			};
			if (accion=="retruco") {  
				op_f_rt = true;  
				actionOpo.html(opname + " cantó re truco"); 
			};
			if (accion=="valecuatro") { 
				op_f_v4 =true;   
				actionOpo.html(opname + " cantó vale cuatro"); 
			};

			if (accion=="quiero") { actionOpo.html(opname + " dijo quiero"); };
			if (accion=="no-quiero") { actionOpo.html(opname + " dijo  no quiero"); };

			if (accion=="envido") { actionOpo.html(opname + " cantó envido"); };
			if (accion=="envido-envido") { actionOpo.html(opname + " cantó  envido-envido"); };
			if (accion=="real-envido") { actionOpo.html(opname + " cantó  real-envido"); };
			if (accion=="envido-real") { actionOpo.html(opname + " cantó  real-envido" ); };
			if (accion=="envido-envido-real") { actionOpo.html(opname + " cantó  real-envido"); };

			if (accion=="envido-envio-falta") { actionOpo.html(opname + " cantó falta-envido"); };
			if (accion=="envio-real-falta") { actionOpo.html(opname + " cantó falta-envido"); };
			if (accion=="envido-envido-real-falta") { actionOpo.html(opname + " cantó falta-envido"); };
			if (accion=="real-envido-falta") { actionOpo.html(opname + " cantó falta-envido"); };
			if (accion=="envido-falta") { actionOpo.html(opname + " cantó falta-envido"); };
			if (accion=="falta-envido"){ actionOpo.html(opname + " cantó  falta-envido"); };

		}
		$("#selecAction").html("<p>Bienvenido<strong>"+me.username+"</strong></p>");
		$( ".playGround" ).show( "slow" );
		turnoCurrent.html("Espera la jugada de " + t);
		if(me.username == t){
			$( ".muestraTurno").fadeOut("fast");
			$( ".buttonGround" ).show( "fast" );
			$("#actionOpo").show("slow");
			muestraOpciones(transitions);
		}else{
			$( ".muestraTurno").show("fast");
			$( ".buttonGround" ).fadeOut( "fast" );
		}
		miGame = gid;
		idopo = oponente;
		turno = t;
	});
//-----------------------------------------------------------------------------------------
// Socket encargada de obtener los puntos para ser mostrados en el titulo de la pagina.
	socket.on("getPoints", function(score1,score2, namep1,namep2,envp,w){
		points.html(namep1 + ": "+ score1 +" - "+ namep2 +": " + score2);
		points.show("fast");
		ep.html("Puntos de envido " + envp);
		ep.show("fast");
		if (w){
			f_t = false;
			f_rt =false;
			f_v4 =false;
			op_f_t = false;
			op_f_rt =false;
			op_f_v4 =false;
			okplayCard= false;
			actionOpo.html("");
		}
	});
//-----------------------------------------------------------------------------------------
// 

//-----------------------------------------------------------------------------------------
// Socket que se encarga de avisar al ganador y perdedor con sus respectivos gifs.
	socket.on("winner", function(name){
		if(!gif){
			gif = true;
			$( ".playGround" ).fadeOut("slow");
			winner.show("fast");
			win.html("Has ganado " + name);
			party.show("fast").css("display", "block");
			socket.emit("statsUser", me.socket, name, true);
		}	
	});

	socket.on("loser", function(name){
		if(!gif){
			gif = true;
			$( ".playGround" ).fadeOut("slow");
			loser.show("fast");
			lose.html("Has perdido " + name);	
			travolta.show("fast").css("display", "block");
			socket.emit("statsUser", me.socket, name, false);		
		}	
	});

//-----------------------------------------------------------------------------------------
// Socket encargado de enviar las cartas a la vista.
	socket.on('sendCards', function(imCards, imTable, otherTable ){;
		cartas = imCards; 
		carta1.html("");
		carta2.html("");
		carta3.html("");
		for(var i in imCards){
			cartas.push([ JSON.stringify(imCards[i])]);
				if (i == 0){ 
					var c1 = "/images/"+cartas[0].number + "-"+ cartas[0].suit+".png";
					carta1.html(' <input type="image" src='+c1+' style="width="128", height="165">');
				}
				if (i == 1){ 
					var c2 = "/images/"+cartas[1].number + "-"+ cartas[1].suit+".png";
					carta2.html(' <input type="image" src='+c2+' style="width="128", height="165">');
				}
				if (i == 2){ 
					var c3 = "/images/"+cartas[2].number + "-"+ cartas[2].suit+".png";
								carta3.html(' <input type="image" src='+c3+' style="width="128", height="165">');
				}
		}
		misCartas.html(cartas);
//-----------------------------------------------------------------------------------------
// Mesa del jugador oponente.
		c1op.html(' <input type="image" src="/images/MA.png" style="width="67"; height="85";">');
		c2op.html(' <input type="image" src="/images/MA.png" style="width="67"; height="85";">');
		c3op.html(' <input type="image" src="/images/MA.png" style="width="67"; height="85";">');	
		for(var i in otherTable){
			if (i == 0){ 
				var c1 = "/images/"+otherTable[0].number + "-"+ otherTable[0].suit+".png";
				c1op.html(' <input type="image" src='+c1+' style="width="67"; height="85";">');
			}
			if (i == 1){ 
				var c2 = "/images/"+otherTable[1].number + "-"+ otherTable[1].suit+".png";
				c2op.html(' <input type="image" src='+c2+' style="width="67"; height="85";">');
			}
			if (i == 2){ 
				var c3 = "/images/"+otherTable[2].number + "-"+ otherTable[2].suit+".png";
				c3op.html(' <input type="image" src='+c3+' style="width="67"; height="85";">');
			}
		}
//-----------------------------------------------------------------------------------------
// Mesa del jugador actual.
		c1j.html("");
		c2j.html("");
		c3j.html("");
		for(var i in imTable){
			if (i == 0){ 
				var c1 = "/images/"+imTable[0].number + "-"+ imTable[0].suit+".png";
				c1j.html(' <input type="image" src='+c1+' style="width="67"; height="85";">');
			}
			if (i == 1){ 
				var c2 = "/images/"+imTable[1].number + "-"+ imTable[1].suit+".png";
				c2j.html(' <input type="image" src='+c2+' style="width="67"; height="85";">');
			}
			if (i == 2){ 
				var c3 = "/images/"+imTable[2].number + "-"+ imTable[2].suit+".png";
				c3j.html(' <input type="image" src='+c3+' style="width="67"; height="85";">');
			}
		}
	});

//-----------------------------------------------------------------------------------------	 
// JQuery para el manejo de la invitación a jugar.
	$(document).on( "click", ".invite-link", function(){
		var player = $(this).parent().attr("name");
		socket.emit("send_invite", player);
		return false;
	});
//-----------------------------------------------------------------------------------------
// Socket para emitir una notificación con algún mensaje.
	socket.on('notify', function(msg){
		notifyUser(msg);
	});
//-----------------------------------------------------------------------------------------
// Socket de bienvenida, con el usuario que se conecta,
	socket.on("welcome", function(user, users) {
		$("#welcome").html("Bienvenido <strong>"+user.username+"</strong>");
		me = user;
		meE.html(me.username);
		updateUsers(users);
	});
//-----------------------------------------------------------------------------------------
// Socket encargada del historial de cada acción generada en una ronda, reinicia una vez 
// terminada con el socket borraHistorial.
	socket.on('agregaAlHistorial',function (acc) {
		historial.push(acc);
	});
	
	socket.on('borraHistorial',function () {
		historial=[];
	});
//-----------------------------------------------------------------------------------------	
// Al conectar un usuario, agrega uno más a la cuenta y la lista.
	socket.on('user_joined', function(user) {
		if (user.socket != socket.id) {
			lobbyCount.text(Number(lobbyCount.text()) + 1);
			lobbyList.append(userEntry(user));
		}
	});
//-----------------------------------------------------------------------------------------
// Socke para la cuenta de usuarios al desconectar.
	socket.on('user_left', function(socket) {
		lobbyCount.text(Number(lobbyCount.text()) - 1);
		$("#" +socket).remove();      
	});
//-----------------------------------------------------------------------------------------
// Socket de invitación recibida, esto para que confirme o no, emitiendo un notificación.
	socket.on('receive_invite', function(player,user) {
		if (confirm(player.username + " quiere jugar contigo "+  user.username + ", aceptas?")) {
			socket.emit("accept_invite", player.socket, user.socket);
			console.log("i got invited and accepted");
		} else {
			socket.emit("decline_invite", player.socket, user.socket);
		}
	});
//-----------------------------------------------------------------------------------------
// Socket encargado de avisar por consola de recibida la invitación.
	socket.on('invite_accepted', function(player){
		console.log("invite_accepted");
	});
//-----------------------------------------------------------------------------------------
	socket.on('broadcast',function(data){
		var element = document.getElementById("header");
		element.innerHTML = data.description;
	});
//-----------------------------------------------------------------------------------------
// Manejo de desconexión de un usuario.
	socket.on('game_crash', function(username) {
		notifyUser("El oponente "+ username + " se ha ido.");
		misCartas.empty();
	});
//-----------------------------------------------------------------------------------------
// Función encargada de la conexión de usuarios y vista la lista.
	function userEntry(user) {
		if(me.socket != user.socket){
			var link = (user.socket != socket.id) ? '<button class="invite-link btn btn-primary btn-xs">Invitar</button> ' : '';
			return '<li style="list-style-type: none;" id="'+user.socket+'" , name="'+user.socket+'">'+link+user.username+'</li><p></p>';            
		}else{
			return '';
		}
	}
//-----------------------------------------------------------------------------------------
// Función de updateo de los usuarios cuando se conecta uno.
	function updateUsers(users) {
		var list = "";
		var count = 0;
		$.each(users, function(i){
			list += userEntry(users[i]);
			count++; // users has no length attr
		});
		count--;
		lobbyCount.text(count);
		lobbyList.empty().append(list);
	}
//-----------------------------------------------------------------------------------------
// Función de muestra de opciones de botones de cada acción permitida.
	function muestraOpciones(array){
		for(var e in array){
			if (array[e]=="quiero") {$ac_q.show("slow");};
			if (array[e]=="no-quiero") {$ac_nq.show("slow");};
			if (array[e]=="envido"&& !pertenece("envido")) {$ac_e.show("slow");};
			if (array[e]=="envido-envido") {$ac_ee.show("slow");};
			if (array[e]=="real-envido"&& !pertenece("real-envido")) {$ac_re.show("slow");};
			if (array[e]=="envido-real"&&pertenece("envido")) {$ac_er.show("slow");};
			if (array[e]=="envido-envido-real"&&pertenece("envido-envido")) {$ac_eer.show("slow");};
			if (array[e]=="envido-envio-falta"&&pertenece("envido-envido")) {$ac_eef.show("slow");};
			if (array[e]=="envio-real-falta"&&pertenece("envido-real")) {$ac_erf.show("slow");};
			if (array[e]=="envido-envido-real-falta"&&pertenece("envido-envido-real")) {$ac_eerf.show("slow");};
			if (array[e]=="real-envido-falta"&&pertenece("real-envido")) {$ac_rf.show("slow");};
			if (array[e]=="envido-falta"&&pertenece("envido")) {$ac_ef.show("slow");};
			if (array[e]=="falta-envido"&& !pertenece("falta-envido")&& !pertenece("envido")&& !pertenece("real-envido")) {$ac_fe.show("slow");};
			
			if (array[e]=="truco" ){
				if ( (f_t == false && op_f_t == false) && (f_rt == false && op_f_rt == false) && (f_v4== false && op_f_v4== false)){
					$ac_t.show("slow");
				};
			};
			if (array[e]=="retruco"){
					 if( (f_rt == false && op_f_rt ==false) && (f_v4== false && op_f_v4== false) && (f_t == false && op_f_t == true)  ){
							$ac_rt.show("slow");
					 };
				};
			if (array[e]=="valecuatro"){ 
				if( (f_v4== false && op_f_v4== false) && (f_rt == false  && op_f_rt == true ) ){ 
					$ac_vc.show("slow");
				};
			};	
		};
		$ac_m.show("slow");
	}
//-----------------------------------------------------------------------------------------
// Función que permite reconocer si una acción está en el historial cargado.
	function pertenece(str) {
		for(var i in historial){
			if(str==historial[i]) {
				return true
			}
		};
		return false;
	}
//-----------------------------------------------------------------------------------------
// Ocultamiento de opciones de cada acción.
	function ocultaOpciones(array){
		for(var e in array){
			if (array[e]=="playcard") {$ac_pc.fadeOut("fast");};
			if (array[e]=="quiero") {$ac_q.fadeOut("fast");};
			if (array[e]=="no-quiero") {$ac_nq.fadeOut("fast");};
			if (array[e]=="envido") {$ac_e.fadeOut("fast");};
			if (array[e]=="truco") {$ac_t.fadeOut("fast");};
			if (array[e]=="retruco") {$ac_rt.fadeOut("fast");};
			if (array[e]=="valecuatro") {$ac_vc.fadeOut("fast");};
			if (array[e]=="envido-envido") {$ac_ee.fadeOut("fast");};
			if (array[e]=="real-envido") {$ac_re.fadeOut("fast");};
			if (array[e]=="envido-real") {$ac_er.fadeOut("fast");};
			if (array[e]=="envido-envido-real") {$ac_eer.fadeOut("fast");};
			if (array[e]=="envido-envio-falta") {$ac_eef.fadeOut("fast");};
			if (array[e]=="envio-real-falta") {$ac_erf.fadeOut("fast");};
			if (array[e]=="envido-envido-real-falta") {$ac_eerf.fadeOut("fast");};
			if (array[e]=="real-envido-falta") {$ac_rf.fadeOut("fast");};
			if (array[e]=="envido-falta") {$ac_ef.fadeOut("fast");};
			if (array[e]=="falta-envido") {$ac_fe.fadeOut("fast");};
		}
	}
//-----------------------------------------------------------------------------------------
// Función de las notificaciones que se ocultan después de tres segundos.
	function notifyUser(msg) {
		notify.html(msg).show();
		setTimeout(function(){
			notify.slideUp(800, function(){
				$(this).empty();
			});
		}, 3000);
	} 
});