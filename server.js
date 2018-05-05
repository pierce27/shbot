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
var presidentChannel = 'GAHVAAB5E';
var chancellorChannel = 'GAJDQ3PM2';
var botUser = 'UAJ290DDY';

var gameInProgress = false;

var numberFascistOptions = [1,1,1,1,2,2,3,3,4,4];
var fascists = [];
var hitler = '';
var liberals = [];
var members = [];
var presidentIndex = 0;
var president = '';
var chancellor = '';

var yesVotes = [];
var noVotes = [];
var votesLeft = 0;


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	var message = req.body.event.text;
	var channel = req.body.event.channel;
	var user = req.body.event.user;

	// message = message.replace(/.*>\s/, "")
	// message = message.replace(/\s/, "")

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
		  var botIndex = members.indexOf('UAJ290DDY');
		  if (botIndex >= 0) {
     		  members.splice( botIndex, 1 );
	      }		  

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

		  president = members[presidentIndex];

     	  slack.api('groups.invite', {
			user: president,
			channel: presidentChannel
		  }, function(err, response){

			console.log(response)

		  })			  

		  slack.api('chat.postMessage', {
		  	channel: secretHitlerChannel,
		  	text: 'President is now <@' + president + '>. Nominate a Chancelor by @Secret Hitler Bot "I nominate @user" !'

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


	// Nominate chancellor
	if (message.indexOf('I nominate') !== -1 && req.body.event.type == 'message'){

		if (user !== president){

			slack.api('chat.postMessage', {
				channel: secretHitlerChannel,
				text: 'You cannot nominate chancellor, you are not President!'
			}, function(err, response){

				console.log(response)

			})


		} else {
			chancellor = message.replace(/.*<@/, '')
			chancellor = chancellor.replace(/>/, '')
			chancellor = chancellor.replace(/\s/, '')

			slack.api('chat.postMessage', {
				channel: secretHitlerChannel,
				text: 'Vote if you would like <@' + chancellor +'> as chancellor by telling me I vote yes or I vote no'
			}, function(err, response){

				console.log(response)

			})						

		}

	}


	// Vote for chancellor
	if (message.indexOf('I vote') !== -1 && req.body.event.type == 'message'){

		if(yesVotes.indexOf(user) == -1 && noVotes.indexOf(user) == -1){
			var vote = message.replace(/I vote /,'')

			if(vote == 'yes'){
				yesVotes.push(user);
			} else if (vote == 'no'){
				noVotes.push(user);
			} else {
				slack.api('chat.postMessage', {
					channel: secretHitlerChannel,
					text: 'Vote for <@' + chancellor +'> as chancellor by telling me "I vote yes" or "I vote no"'
				}, function(err, response){

					console.log(response)

				})					
			}

			console.log('YES VOTES: ' + yesVotes);
			console.log('NO VOTES: ' + noVotes);

			var totalVotes = yesVotes.length + noVotes.length;

			if(totalVotes < members.length){


				
				slack.api('chat.postMessage', {
					channel: secretHitlerChannel,
					text:  votesLeft + ' votes remaining, ' + yesVotes.length + ' voted yes, ' + noVotes.length + 'voted no'
				}, function(err, response){

					console.log(response)

				})					

			} else {

				if(noVotes.length > yesVotes.length){
					if(presidentIndex < members.length){
						presidentIndex = presidentIndex + 1;
					} else {
						presidentIndex = 0;
					}

					slack.api('groups.kick', {
						user: president,
						channel: presidentChannel
					}, function(err, response){

						console.log(response)

					})						

					president = members[presidentIndex];

					slack.api('chat.postMessage', {
						channel: secretHitlerChannel,
						text: 'Resolution for <@' + chancellor + '> as chancellor not passed <@' + president + '> is now president. Nominate a chancellor!'
					}, function(err, response){

						console.log(response)

					})

					slack.api('groups.invite', {
						user: president,
						channel: presidentChannel
					}, function(err, response){

						console.log(response)

					})											
				} else {

					slack.api('chat.postMessage', {
						channel: secretHitlerChannel,
						text: 'The resolution for <@' + chancellor + '> as chancellor has passed!!'
					}, function(err, response){

						console.log(response)

					})

					// TODO Resolution logic
				}
			}


		} else {

			slack.api('chat.postMessage', {
				channel: secretHitlerChannel,
				text: 'You already voted <@' + user + '>'
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