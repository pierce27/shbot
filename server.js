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
var facists = [];
var hitler = '';


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

		gameInProgress == true;
		
		// Get Member list
		slack.api('groups.info', {
		  // user:'D3H23DLBT',
		  channel:'GAKDANLBG'
		}, function(err, response){
		  console.log(response);

		  var members = response.group.members

		  // Remove bot from members
		  members = members.filter(function( obj ) {
    		return obj.field !== 'UAJ290DDY';
		  });

		  // Set Fascists
		  while (facsists.length <= numberFascistOptions[members.length - 1]){
		  	fascistIndex = Math.floor(Math.random()*members.length);

		  	facsists[fascists.length-1](members[fascistIndex]);

		  	members = members.filter(function( obj ) {
    			return obj.field !== facsists[facsists.length -1];
		  	})
		  }


		  // Set Hitler
		  hitler = fascists[Math.floor(Math.random()*facsists.length)];

		  // Remove from fascists
		  fascists = fascists.filter(function( obj ) {
			return obj.field !== hitler;
		  })		  

		  // Invite Fascists
		  for (var i = facsists.length - 1; i >= 0; i--) {

			  slack.api('groups.invite', {
			  	user: members[fascists[i]],
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

		  


		});		

	}



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



	res.sendStatus(200);
  // res.send(req.body.challenge)
})

app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)