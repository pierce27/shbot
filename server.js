bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var https = require('https');
var querystring = require('querystring')
var Slack = require('slack-node');
var qs = require('qs');
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
var chancellors = [];
var failedResolutions = 0;

var yesVotes = [];
var noVotes = [];
var votesLeft = 0;

var policies = ['FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'FASCIST', 'LIBERAL', 'LIBERAL', 'LIBERAL', 'LIBERAL', 'LIBERAL', 'LIBERAL'];
var presidentialPolicyOptions = [];
var chancellorPolicyOptions = [];
var enactedPolicies = [];


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	if(req.body.event.subtype == 'bot_message' || req.body.event.subtype == 'message_changed'){
		res.sendStatus(200)
		return
	}

	var message = req.body.event.text.toLowerCase();
	var channel = req.body.event.channel;
	var user = req.body.event.user;

	// message = message.replace(/.*>\s/, "")
	// message = message.replace(/\s/, "")

	console.log(message)

	if (channel == secretHitlerChannel){


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
			fascists = [];
			hitler = '';
			liberals = [];
			members = [];
			presidentIndex = 0;
			president = '';
			chancellor = '';
			yesVotes = [];
			noVotes = [];
			votesLeft = 0;


		}


		// Nominate chancellor
		if (message.indexOf('i nominate') !== -1){

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
				chancellor = chancellor.toUpperCase()

				// slack.api('chat.postMessage', {
				// 	channel: secretHitlerChannel,
				// 	text: 'Vote if you would like <@' + chancellor +'> as chancellor by telling me I vote yes or I vote no'
				// }, function(err, response){

				// 	console.log(response)

				// })	


				var attachments = [
		        	{
		            "text": "Vote for chancellor",
		            "fallback": "You are unable to vote",
		            "callback_id": "chancellor_vote",
		            "color": "#3AA3E3",
		            "attachment_type": "default",
		            "actions": [
		                {
		                    "name": "game",
		                    "text": "YES",
		                    "type": "button",
		                    "value": "yes"
		                },
		                {
		                    "name": "game",
		                    "text": "NO",
		                    "type": "button",
		                    "value": "no"
		        		}
					]
					}
				]

				var attachmentString = JSON.stringify(attachments);

				slack.api('chat.postMessage', {
					"channel": secretHitlerChannel,
				    "text": "Would you like to nominate chancellor?",
				    "attachments": attachmentString
				}, function(err, response){

					console.log(response)

				})										

			}

		}


		// Vote for chancellor
		if (message.indexOf('i vote') !== -1 && req.body.event.type == 'message'){

			if(yesVotes.indexOf(user) == -1 && noVotes.indexOf(user) == -1){
				var vote = message.replace(/i vote /,'')

				if(vote == 'yes'){
					yesVotes.push(user);
				} else if (vote == 'no'){
					noVotes.push(user);
				} else {
					slack.api('chat.postMessage', {
						channel: secretHitlerChannel,
						text: 'Vote for <@' + chancellor +'> as chancellor by telling me "I vote yes" or "I vote no"'
					}, function(err, response){

						// console.log(response)

					})					
				}

				console.log('YES VOTES: ' + yesVotes);
				console.log('NO VOTES: ' + noVotes);

				var totalVotes = yesVotes.length + noVotes.length;

				if(totalVotes < members.length){


					
					slack.api('chat.postMessage', {
						channel: secretHitlerChannel,
						text:  votesLeft + ' votes remaining, ' + yesVotes.length + ' voted yes, ' + noVotes.length + ' voted no'
					}, function(err, response){

						// console.log(response)

					})					

				} else {

					if(noVotes.length > yesVotes.length){
						if(presidentIndex < members.length - 1){
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

							// console.log(response)
							failedResolutions = failedResolutions + 1;

						})

						slack.api('groups.invite', {
							user: president,
							channel: presidentChannel
						}, function(err, response){

							console.log(response)

						})	

						yesVotes = []
						noVotes = []										

					} else {

						slack.api('chat.postMessage', {
							channel: secretHitlerChannel,
							text: 'The resolution for <@' + chancellor + '> as chancellor has passed!!'
						}, function(err, response){

							// console.log(response)
							chancellors.push(chancellor);
							failedResolutions = 0;

						})

						// TODO Resolution logic
					    slack.api('groups.invite', {
					  	  user: chancellor,
					  	  channel: chancellorChannel
					    }, function(err, response){

					  	  console.log(response)

					    })	

					    // Determine options for president
					   var i = 0;
					   while(i < 3 ){

					   	policyIndex = Math.floor(Math.random()*policies.length);

					   	presidentialPolicyOptions.push(policies[policyIndex]);

					   	policies.splice(policyIndex, 1);

					   	i = i + 1;

					   	// Once options are set than notify president. 
					   	if (i == 3) {

							slack.api('chat.postMessage', {
								channel: presidentChannel,
								text: 'Choose between these policies ' + presidentialPolicyOptions + ' by typing policies you want chancellor to choose from separated by a space (ex. "fascist, liberal"'
							}, function(err, response){


							})		
									   		
					   	}

					   }	


					}
				}


			} else {

				slack.api('chat.postMessage', {
					channel: secretHitlerChannel,
					text: 'You already voted <@' + user + '>'
				}, function(err, response){

					// console.log(response)

				})			

			}
		}
	}

	if (channel == presidentChannel) {

		chancellorPolicyOptions = message.split(' ')

		if(chancellorPolicyOptions.length == 2 ){

		}

	}





	res.sendStatus(200);
  // res.send(req.body.challenge)
})






app.post('/component', function(req,res){
	
	var payload = qs.parse(req.body.payload)
	console.log(payload)
	var actions = qs.parse(payload.actions)
	console.log(actions)
	var user = payload.user.id
	console.log(user)
	var vote = actions.value
	console.log(vote)
	

	// if (payload.callback_id == "chancellor_vote"){

	// 	if(vote == 'yes'){
	// 		yesVotes.push(user);
	// 	} else if (vote == 'no'){
	// 		noVotes.push(user);
	// 	} else {
	// 		slack.api('chat.postMessage', {
	// 			channel: secretHitlerChannel,
	// 			text: 'Vote for <@' + chancellor +'> as chancellor by telling me "I vote yes" or "I vote no"'
	// 		}, function(err, response){

	// 			// console.log(response)

	// 		})					
	// 	}

	// 	console.log('YES VOTES: ' + yesVotes);
	// 	console.log('NO VOTES: ' + noVotes);

	// 	var totalVotes = yesVotes.length + noVotes.length;

	// 	if(totalVotes < members.length){


			
	// 		slack.api('chat.postMessage', {
	// 			channel: secretHitlerChannel,
	// 			text:  votesLeft + ' votes remaining, ' + yesVotes.length + ' voted yes, ' + noVotes.length + ' voted no'
	// 		}, function(err, response){

	// 			// console.log(response)

	// 		})					

	// 	} else {

	// 		if(noVotes.length > yesVotes.length){
	// 			if(presidentIndex < members.length - 1){
	// 				presidentIndex = presidentIndex + 1;
	// 			} else {
	// 				presidentIndex = 0;
	// 			}

	// 			slack.api('groups.kick', {
	// 				user: president,
	// 				channel: presidentChannel
	// 			}, function(err, response){

	// 				console.log(response)

	// 			})						

	// 			president = members[presidentIndex];

	// 			slack.api('chat.postMessage', {
	// 				channel: secretHitlerChannel,
	// 				text: 'Resolution for <@' + chancellor + '> as chancellor not passed <@' + president + '> is now president. Nominate a chancellor!'
	// 			}, function(err, response){

	// 				// console.log(response)
	// 				failedResolutions = failedResolutions + 1;

	// 			})

	// 			slack.api('groups.invite', {
	// 				user: president,
	// 				channel: presidentChannel
	// 			}, function(err, response){

	// 				console.log(response)

	// 			})	

	// 			yesVotes = []
	// 			noVotes = []										

	// 		} else {

	// 			slack.api('chat.postMessage', {
	// 				channel: secretHitlerChannel,
	// 				text: 'The resolution for <@' + chancellor + '> as chancellor has passed!!'
	// 			}, function(err, response){

	// 				// console.log(response)
	// 				chancellors.push(chancellor);
	// 				failedResolutions = 0;

	// 			})

	// 			// TODO Resolution logic
	// 		    slack.api('groups.invite', {
	// 		  	  user: chancellor,
	// 		  	  channel: chancellorChannel
	// 		    }, function(err, response){

	// 		  	  console.log(response)

	// 		    })	

	// 		    // Determine options for president
	// 		   var i = 0;
	// 		   while(i < 3 ){

	// 		   	policyIndex = Math.floor(Math.random()*policies.length);

	// 		   	presidentialPolicyOptions.push(policies[policyIndex]);

	// 		   	policies.splice(policyIndex, 1);

	// 		   	i = i + 1;

	// 		   	// Once options are set than notify president. 
	// 		   	if (i == 3) {

	// 				slack.api('chat.postMessage', {
	// 					channel: presidentChannel,
	// 					text: 'Choose between these policies ' + presidentialPolicyOptions + ' by typing policies you want chancellor to choose from separated by a space (ex. "fascist, liberal"'
	// 				}, function(err, response){


	// 				})		
							   		
	// 		   	}

	// 		   }	


	// 		}
	// 	}
	// }

	

	// console.log(body.payload.actions[0])
	res.sendStatus(200)
})


app.listen(process.env.PORT || 3000)