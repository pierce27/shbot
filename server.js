bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('./sh-game');
var https = require('https');
var querystring = require('querystring')
var Slack = require('slack-node');
slack = new Slack(process.env.SLACK_AUTH);	


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	var message = req.body.event.text

	message = message.replace(/.*>/, "")
	message = message.replace(/\s/, "")

	console.log(message)

	if (message == "invite") {
		
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

		  // Invite randomn member to facsists
		  slack.api('groups.invite', {
		  	user: members[Math.floor(Math.random()*members.length)],
		  	channel: 'GAHQZUC6Q'
		  }, function(err, response){

		  	console.log(response)

		  })

		});		

	}
	res.sendStatus(200);
  // res.send(req.body.challenge)
})

app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)