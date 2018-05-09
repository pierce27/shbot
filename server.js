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
var enactedLiberalPolicies = [];
var enactedFascistPolicies = [];


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


		if (message == "new game" && user == 'U1EG6PYPR') {

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
				return obj !== hitler;
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
			  	text: 'President is now <@' + president + '>. President will nominate a chancellor from his secret president channel'

			  }, function(err, response){

			  	console.log(response)

			  })

				var attachments = [
					{
				    "text": "Nominate a chancellor",
				    "fallback": "You are unable to nominate a chancellor",
				    "callback_id": "president_nomination",
				    "color": "#3AA3E3",
				    "attachment_type": "default",
				    "actions": []
					}
				]

				attachments[0].actions = createActions(members, true);				

				var attachmentString = JSON.stringify(attachments);

				var text = "Your options for nomination are ";

				for (var i = 0; i < members.length; i++) {
					// if(members[i] !== president){
						text = text + i + ". <@"+members[i] + "> "
					// }
				}

				slack.api('chat.postMessage', {
					"channel": presidentChannel,
				    "text": text,
				    "attachments": attachmentString
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
		if (message == 'end game' && user == 'U1EG6PYPR'){

			endGame()


		}


	}

	res.sendStatus(200);

})






app.post('/component', function(req,res){
	

	var payload = JSON.parse(req.body['payload']);

	console.log(payload);

	var vote = payload.actions[0].value;

	var user = payload.user.id;

	var callbackId = payload.callback_id;

	res.sendStatus(200)

	if(callbackId == 'president_nomination'){

		

		chancellor = members[payload.actions[0].value]


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
                    "text": "Ja",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "game",
                    "text": "Nein",
                    "type": "button",
                    "value": "no"
        		}
			]
			}
		]

		var attachmentString = JSON.stringify(attachments);

		slack.api('chat.postMessage', {
			"channel": secretHitlerChannel,
		    "text": "President has nominated <@"+ chancellor + "> as chancellor. Would you like them to be chancellor?",
		    "attachments": attachmentString
		}, function(err, response){

			console.log(response)

		})							
	}	

	if (callbackId == "chancellor_vote"){

		if(vote == 'yes'){
			yesVotes.push(user);		
		} else if (vote == 'no'){
			noVotes.push(user);	
		} 

		console.log('YES VOTES: ' + yesVotes);
		console.log('NO VOTES: ' + noVotes);

		var totalVotes = yesVotes.length + noVotes.length;

		if(totalVotes < members.length){

			slack.api('chat.postMessage', {
				"channel": secretHitlerChannel,
			    "text": "<@"+user+"> has voted "+vote+". Vote count: "+yesVotes.length+" yes votes and "+noVotes.length+" no votes"
			}, function(err, response){

				console.log(response)
				

			})						

			
			// slack.api('chat.postMessage', {
			// 	channel: secretHitlerChannel,
			// 	text:  votesLeft + ' votes remaining, ' + yesVotes.length + ' voted yes, ' + noVotes.length + ' voted no'
			// }, function(err, response){

			// 	// console.log(response)

			// })					

		} else {

			if(noVotes.length >= yesVotes.length){
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
					text: 'Resolution for <@' + chancellor + '> as chancellor not passed by a vote of ' + noVotes.length + ' to ' + yesVotes.length + ' <@' + president + '> is now president. Nominate a chancellor!'
				}, function(err, response){

					// console.log(response)
					

				})

				failedResolutions = failedResolutions + 1;

				if (failedResolutions == 3){

					// Pick randomn policy
					policyIndex = Math.floor(Math.random()*policies.length);

				   	randomPolicy = policies[policyIndex]
				   	
				   	if(randomPolicy == 'FASCIST'){
				   		enactedFascistPolicies.push(randomPolicy)
				   	} else {
				   		enactedLiberalPolicies.push(randomPolicy)
				   	}

				   	policies.splice(policyIndex, 1);					
	
					slack.api('chat.postMessage', {
						channel: secretHitlerChannel,
						text: 'CHAOS!!! A ' + randomPolicy + ' has been enacted. There are ' + enactedFascistPolicies.length + ' FASCIST policies and '
						+ enactedLiberalPolicies.length + ' LIBERAL policies enacted' 
					}, function(err, response){

						// console.log(response)
						failedResolutions = 0;

					})					

				}

				slack.api('groups.invite', {
					user: president,
					channel: presidentChannel
				}, function(err, response){

					console.log(response)

					var attachments = [
						{
					    "text": "Nominate a chancellor",
					    "fallback": "You are unable to nominate a chancellor",
					    "callback_id": "president_nomination",
					    "color": "#3AA3E3",
					    "attachment_type": "default",
					    "actions": []
						}
					]

					attachments[0].actions = createActions(members, true);				

					var attachmentString = JSON.stringify(attachments);

					var text = "Your options for nomination are ";

					for (var i = 0; i < members.length; i++) {
						// TODO
						// if(members[i] !== president){
							text = text + i + ". <@"+members[i] + "> "
						// }
					}

					slack.api('chat.postMessage', {
						"channel": presidentChannel,
					    "text": text,
					    "attachments": attachmentString
					}, function(err, response){

						console.log(response)

					})						

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

						var attachments = [
				        	{
				            "text": "Choose between these policies",
				            "fallback": "You are unable to choose",
				            "callback_id": "presidential_policy_choice",
				            "color": "#3AA3E3",
				            "attachment_type": "default",
				            "actions": []
							}
						]

						// console.log(actions)

						attachments[0].actions = createActions(presidentialPolicyOptions, false);

						var attachmentString = JSON.stringify(attachments);

						console.log(attachments)
						console.log(attachmentString)

						slack.api('chat.postMessage', {
							"channel": presidentChannel,
						    "text": "Select 2 policies for the chancellor",
						    "attachments": attachmentString
						}, function(err, response){

							console.log(response)

						})	
								   		
				   	}

			   }	


			}
		}

		return
	}

	if(callbackId == 'presidential_policy_choice'){

		console.log(payload)

		var presidentialPolicyChoiceIndex = payload.actions[0].value

		chancellorPolicyOptions.push(presidentialPolicyOptions[presidentialPolicyChoiceIndex])

		presidentialPolicyOptions.splice(presidentialPolicyChoiceIndex, 1)	

		console.log(presidentialPolicyOptions)			

		// originalMessage.actions[0] = JSON.stringify(originalAttachments)

		if (presidentialPolicyOptions.length > 1){

			var attachments = [
	        	{
	            "text": "Choose between these policies",
	            "fallback": "You are unable to choose",
	            "callback_id": "presidential_policy_choice",
	            "color": "#3AA3E3",
	            "attachment_type": "default",
	            "actions": []
				}
			]

			attachments[0].actions = createActions(presidentialPolicyOptions, false)

			var attachmentString = JSON.stringify(attachments);

			slack.api('chat.postMessage', {
				"channel": presidentChannel,
			    "text": "Select 1 more policy for the chancellor",
			    "attachments": attachmentString
			}, function(err, response){

				console.log(response)
				

			})			
			
		} else {
			policies.push(presidentialPolicyOptions[0])

			presidentialPolicyOptions = []

			var attachments = [
	        	{
	            "text": "Choose between these policies",
	            "fallback": "You are unable to choose",
	            "callback_id": "chancellor_policy_callback",
	            "color": "#3AA3E3",
	            "attachment_type": "default",
	            "actions": []
				}
			]

			console.log(chancellorPolicyOptions)
			attachments[0].actions = createActions(chancellorPolicyOptions, false)
			console.log(attachments)
			console.log(attachments[0].actions)

			var attachmentString = JSON.stringify(attachments);



			slack.api('chat.postMessage', {
				"channel": chancellorChannel,
			    "text": "President has given you these policies. Select a policy to enact.",
			    "attachments": attachmentString
			}, function(err, response){

				console.log(response)
				

			})	

			slack.api('chat.postMessage', {
				"channel": secretHitlerChannel,
			    "text": "President has given the Chancellor policies to choose from"
			}, function(err, response){

				console.log(response)
				

			})							

		}

		
		
		

	}

	if(callbackId == 'chancellor_policy_callback'){


		

		var chancellorPolicyChoiceIndex = payload.actions[0].value;
		chancellorPolicyChoice = chancellorPolicyOptions[chancellorPolicyChoiceIndex]

		if (chancellorPolicyChoice == 'FASCIST'){
			enactedFascistPolicies.push(chancellorPolicyChoice)
		} else {
			enactedLiberalPolicies.push(chancellorPolicyChoice)
		}
		
		chancellorPolicyOptions.splice(chancellorPolicyChoiceIndex, 1);
		policies.push(chancellorPolicyOptions[0]);
		chancellorPolicyOptions = [];



		if (enactedFascistPolicies.length == 6){
			fascistsWin(false);
		} else if (enactedLiberalPolicies.length == 6) {
			liberalsWin(false);
		} else {
			newRound();
		}
		

		slack.api('chat.postMessage', {
			"channel": secretHitlerChannel,
		    "text": "A "+ chancellorPolicyChoice + " policy has been enacted! There are " + enactedLiberalPolicies.length +
		    " LIBERAL policies and " + enactedFascistPolicies.length + " FASCIST policies enacted. The new president is <@" + president + ">, nominate a chancellor!!"
		}, function(err, response){

			console.log(response)
			

		})	

		var attachments = [
			{
		    "text": "Nominate a chancellor",
		    "fallback": "You are unable to nominate a chancellor",
		    "callback_id": "president_nomination",
		    "color": "#3AA3E3",
		    "attachment_type": "default",
		    "actions": []
			}
		]

		attachments[0].actions = createActions(members, true);				

		var attachmentString = JSON.stringify(attachments);

		var text = "Your options for nomination are ";

		for (var i = 0; i < members.length; i++) {
			// TODO
			// if(members[i] !== president){
				text = text + i + ". <@"+members[i] + "> "
			// }
		}

		slack.api('chat.postMessage', {
			"channel": presidentChannel,
		    "text": text,
		    "attachments": attachmentString
		}, function(err, response){

			console.log(response)

		})					



	}


	
})

var newRound = function(){

	slack.api('groups.kick', {
		user: president,
		channel: presidentChannel
	}, function(err, response){

		console.log(response)

	})					

	slack.api('groups.kick', {
		user: chancellor,
		channel: chancellorChannel
	}, function(err, response){

		console.log(response)

	})									

	if(presidentIndex < members.length - 1){
		presidentIndex = presidentIndex + 1;
	} else {
		presidentIndex = 0;
	}

	president = members[presidentIndex];
	chancellor = '';
	yesVotes = [];
	noVotes = [];
	chancellorPolicyChoice = '';
	chancellorPolicyChoiceIndex = 0;
	presidentialPolicyOptions = [];
	presidentialPolicyChoiceIndex = 0;	
}

var createActions = function(options, memberActions){
	
	var actionsArray = []




	for (var i = 0; i < options.length; i++) {
		var option = 	{
		    "name": "policy",
		    "text": '',
		    "type": "button",
		    "value": ''
		}		
		option.name = options[i];
		if(memberActions){
			option.text = i;	
		} else {
			option.text = options[i];				
		}
		
		option.value = i;

		actionsArray.push(option);
		console.log('TEXT!!!: '+ option.text)
		console.log('OPTION!!:' + options[i])
	}

	// console.log('ARRAY!!'+ actionsArray)
	return actionsArray	
}


var fascistsWin = function(chancellorIsHitler){
	
	if (chancellorIsHitler){
		console.log("HITLER IS Chancellor!! fascistsWin")

		slack.api('chat.postMessage', {
			"channel": secretHitlerChannel,
		    "text": "HITLER IS CHANCELLOR!! FASCISTS WIN!!!"
		}, function(err, response){

			console.log(response)
			

		})			
	} else {
		console.log("Fascist policies enacted!!")
		slack.api('chat.postMessage', {
			"channel": secretHitlerChannel,
		    "text": "FASCISTS POLICIES ENACTED!! FASCISTS WIN!!"
		}, function(err, response){

			console.log(response)
			

		})			
	}

	endGame()
}

var liberalsWin = function(hitlerIsKilled){
	
	if (hitlerIsKilled){
		console.log("YOU Killed HItler!")
		slack.api('chat.postMessage', {
			"channel": secretHitlerChannel,
		    "text": "YOU KILLED HITLER!! LIBERALS WIN!!"
		}, function(err, response){

			console.log(response)
			

		})				
	} else {
		console.log("liberal Policies enacted!!")
		slack.api('chat.postMessage', {
			"channel": secretHitlerChannel,
		    "text": "Liberal Policies Enacted!! Liberals Win!!"
		}, function(err, response){

			console.log(response)
			

		})				

	}

	endGame()
}

var endGame = function(){
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
	var enactedLiberalPolicies = [];
	var enactedFascistPolicies = [];
}

app.listen(process.env.PORT || 3000)