
	host = "localhost";
	var clientId = '621146298370.apps.googleusercontent.com';
	//var clientId = '710021508757-0ucnlmjioeldhogvkdun797upfr7868d.apps.googleusercontent.com';
	var scopes = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive';
	
	function handleClientLoad() 
	{		
        window.setTimeout(checkAuth,1);
    }

	function checkAuth() 
	{		
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);		
    }

	function handleAuthResult(authResult) 
	{						
		console.log(authResult);	       
        if (authResult && !authResult.error) 
		{			
			acToken = authResult['access_token'];
			getUserInfo();
			
        } 
		else 
		{			
			document.location.href = "http://"+host+"/se/home.html";			
        }
    }
	
	function getUserInfo() 
	{
        $.ajax({
            url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + acToken,
            data: null,
            success: function(resp) 
			{
                var user    =   resp;
				emailid = user['email'];
				username = user['name'];
				console.log(username);
				initChat();
				//$("#divProfile").html(user['name']);			
				$("#divProfile").html(user['name']+'&nbsp&nbsp<span onclick = "logout()" style = "cursor:pointer">Logout</span>');
                console.log(user);                
            },
            dataType: "jsonp"
        });
    }

getToken();

	function logout()
	{	
		//change the url when deploying
		document.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://"+ host +"/se/home.html";
	}
	
var config = {
    openSocket: function (config) {
        var channel = config.channel || uniqueToken || location.hash.replace('#', '') || 'video-oneway-broadcasting';
        var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function (data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRemoteStream: function (htmlElement) 
	{
		//alert("added");
		htmlElement.style.width = "100%";
		htmlElement.style.height = "100%";		
        htmlElement.setAttribute('controls', true);
        divShowBroadcast.appendChild(htmlElement);
        htmlElement.play();        	
		
    },
    onRoomFound: function (room) 
	{				
            /* auto join privately shared room */
			divShowBroadcast.style.display = "block";
            config.attachStream = null;
            broadcastUI.joinRoom({
                roomToken: room.roomToken,
                joinUser: room.broadcaster,
                isAudio: room.isAudio
            });
          //  hideUnnecessaryStuff();        
    },
	onNewParticipant: function(participants)
	{
		//alert(participants);
		/*
		var numberOfParticipants = document.getElementById('number-of-participants');
		if(!numberOfParticipants) return;
		numberOfParticipants.innerHTML = participants + ' room participants';
		*/
	}
};


function captureUserMedia(callback) {
    var constraints = null;
    window.option = broadcastingOption ? broadcastingOption.value : '';
	if (option === 'Audio + Video') {
		constraints = {
            audio: true,
            video: true
        };
	}
    if (option === 'Only Audio') {
        constraints = {
            audio: true,
            video: false
        };		
    }
    if (option === 'Screen') {
        var video_constraints = {
            mandatory: {
                chromeMediaSource: 'screen'
            },
            optional: []
        };
        constraints = {
            audio: false,
            video: video_constraints
        };
    }

	var divShowBroadcast = document.getElementById("divShowBroadcast");
    var htmlElement = document.createElement(option === 'Only Audio' ? 'audio' : 'video');
	divShowBroadcast.appendChild(htmlElement);
	var divOptions = document.getElementById("divOptions");
	
	divOptions.style.display = "none";
	divShowBroadcast.style.display = "block";
	
	htmlElement.style.width = "100%";
	htmlElement.style.height = "100%";
	
    htmlElement.setAttribute('autoplay', true);
    htmlElement.setAttribute('controls', true);
	
    //participants.insertBefore(htmlElement, participants.firstChild);

    var mediaConfig = {
        video: htmlElement,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            htmlElement.setAttribute('muted', true);
            //rotateInCircle(htmlElement);
        },
        onerror: function () {
            alert('unable to get access to your webcam');
        }
    };
    if (constraints) mediaConfig.constraints = constraints;
    getUserMedia(mediaConfig);
}


function init()
{
	handleClientLoad();
	/* on page load: get public rooms */	
	broadcastUI = broadcast(config);
	divShowBroadcast = document.getElementById("divShowBroadcast");
	divEnterOptions = document.getElementById("divEnterOptions");
	roomsList = document.getElementById('rooms-list');
	
	
	
	populateDisplay('frame1');
	
	/* UI specific */
	//participants = document.getElementById("participants") || document.body;
	//startConferencing = document.getElementById('start-conferencing');	
	
	

	//broadcastingOption = document.getElementById('broadcasting-option');
	//document.getElementById("divChat").innerHTML = uniqueToken;	
			
	//if (startConferencing) startConferencing.onclick = createButtonClickHandler;
}

/*
function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
}
*/

function rotateInCircle(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}


function getToken()
{
	var eventId = $.QueryString["eventId"];
	$.ajax({
		 async: false,
		 type: 'GET',
		 url: 'db/get.php?mode=getEventDetails&eventId='+eventId,
		 success: function(data) 
		 {
			var eventDetails = JSON.parse(data);							
			uniqueToken = eventDetails['broadcastToken'];
			fileId = eventDetails['fileId'];
			
			//alert(uniqueToken);
		 }
		});	 
	if(!uniqueToken)
	{
		uniqueToken = "";
	}	
	
}

function populateDisplay(id) 
{		
		var ifrm = document.getElementById(id);		
		path = "http://docs.google.com/file/d/"+fileId+"/preview";
		ifrm.src = path;		
		ifrm.style.display="block";
	
}

function populateIframe(id) 
{
	
		if(typeof fileId == "undefined")
			return;
		var ifrm = document.getElementById(id);
		path = "http://drive.google.com/uc?export=download&id="+fileId;
		ifrm.src = path;		
		
}