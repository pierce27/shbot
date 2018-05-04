bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('./sh-game');
var https = require('https');
var querystring = require('querystring')
var Slack = require('slack-node');
slack = new Slack('xoxp-2151341983-48550814807-359125055207-56deb3121be0bf240837ca49c5d96d40');	


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	var message = req.body.event.text

	message = message.replace(/.*>/, "")
	message = message.replace(/\s/, "")

	console.log(message)

	if (message == "invite") {
		 
		slack.api('groups.info', {
		  // user:'D3H23DLBT',
		  channel:'GAHQZUC6Q'
		}, function(err, response){
		  console.log(response);
		});		

	}
	res.sendStatus(200);
  // res.send(req.body.challenge)
})

app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)