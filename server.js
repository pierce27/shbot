bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('./sh-game');
var https = require('https');
var querystring = require('querystring')
var Slack = require('slack-node');
slack = new Slack(process.env.SLACK_AUTH);	

var hitlerChannel = 'GAJBE9AFN';
var facsistChannel = 'GAHQZUC6Q';
var secretHitlerChannel = 'GAKDANLBG';

var gameInProgress = false;

var numberFascistOptions = [2,2,3,3,4,4];
var fascists = [];
var hitler = '';
var liberals = [];
var members = [];
var presidentIndex = 0;
var chancellor = '';


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	var message = req.body.event.text;
	var channel = req.body.event.channel;
	var user = req.body.event.user;

	message = message.replace(/.*>/, "")
	message = message.replace(/\s/, "")

	console.log(message)

	if (message == "new game") {

		if (gameInProgress == true){

		  slack.api('chat.postMessage', {
		  	channel: channel,
		  	text: 'Game In Progress'

		  }, function(err, response){

		  	console.log(response)

		  })				
		} else {
			gameInProgress == true;
		}

		
		// Get Member list
		slack.api('groups.info', {
		  // user:'D3H23DLBT',
		  channel:'GAKDANLBG'
		}, function(err, response){
		  console.log(response);

		  members = response.group.members

		  // Remove bot from members
		  members = members.filter(function( obj ) {
    		return obj.field !== 'UAJ290DDY';
		  });

		  liberals = members

		  // Set Fascists
		  while (fascists.length <= numberFascistOptions[members.length - 1]){
		  	fascistIndex = Math.floor(Math.random()*members.length);

		  	fascists.push(liberals[fascistIndex]);

		  	liberals = liberals.filter(function( obj ) {
    			return obj.field !== fascists[fascists.length -1];
		  	})
		  }


		  // Set Hitler
		  hitler = fascists[Math.floor(Math.random()*fascists.length)];

		  // Remove from fascists
		  fascists = fascists.filter(function( obj ) {
			return obj.field !== hitler;
		  })		  

		  // Invite Fascists
		  for (var i = fascists.length - 1; i >= 0; i--) {

			  slack.api('groups.invite', {
			  	user: fascists[i],
			  	channel: facsistChannel
			  }, function(err, response){

			  	console.log(response)

			  })		  	
		  }

		  // Invite Hitler
		  slack.api('groups.invite', {
		  	user: hitler,
		  	channel: hitlerChannel
		  }, function(err, response){

		  	console.log(response)

		  })


		  slack.api('chat.postMessage', {
		  	channel: secretHitlerChannel,
		  	text: 'President is now <@' + members[presidentIndex] + '>. Nominate a Chancelor!'

		  }, function(err, response){

		  	console.log(response)

		  })

		  console.log('MEMBERS: ' + members);
		  console.log('LIBERALS: ' + liberals);
		  console.log('FASCISTS: ' + fascists);
		  

		});		

	}



	// Invite user to secret hitler
	if (message == 'invite me'){

		if(gameInProgress == true){

		  slack.api('chat.postMessage', {
		  	channel: channel,
		  	text: 'Game In Progress'

		  }, function(err, response){

		  	console.log(response)

		  })			

		} else {

		  slack.api('groups.invite', {
		  	user: user,
		  	channel: secretHitlerChannel
		  }, function(err, response){

		  	console.log(response)

		  })				

		}

	}


	// End the game
	if (message == 'end game'){

		gameInProgress = false;


	}



	res.sendStatus(200);
  // res.send(req.body.challenge)
})







app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)