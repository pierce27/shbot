bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('./sh-game');
var https = require('https');
var querystring = require('querystring')
var Slack = require('slack-node');
slack = new Slack('xoxb-357799394404-9JtY2e4zKynZJqQNhk1HerD7');


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	var message = req.body.event.text

	message = message.replace(/.*>/, "")
	message = message.replace(/\s/, "")

	console.log(message)

	if (message == "invite") {
		 
		slack.api('channels.invite', {
		  user:'D3H23DLBT',
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







		console.log("INVITE HIM!!!!!!!!!!!!!")

		var postData = querystring.stringify({
		    'token' : 'xoxb-357799394404-9JtY2e4zKynZJqQNhk1HerD7',
		    'channel': 'GAHQZUC6Q',
		    'user': 'D3H23DLBT'
		});

		var options = {
		  hostname: 'slack.com',
		  port: 443,
		  path: 'api/channels.invite',
		  method: 'POST',
		  headers: {
		        'Content-Type': 'application/x-www-form-urlencoded',
       			'Content-Length': postData.length
		     }
		};

		var req = https.request(options, (res) => {
		  console.log('statusCode:', res.statusCode);
		  console.log('headers:', res.headers);

		  res.on('data', (d) => {
		    process.stdout.write(d);
		  });
		});

		req.on('error', (e) => {
		  console.error(e);
		});

		req.write(postData);
		req.end();	
