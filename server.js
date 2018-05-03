bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('./sh-game')

app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	var message = req.body.event.text

	message = message.replace(/.*>/, "")

	console.log(message)

	if (message == "invite") {
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
		       'Content-Type': 'application/json'
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

	}
	res.sendStatus(200);
  // res.send(req.body.challenge)
})

app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)