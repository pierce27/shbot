bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('./sh-game');
var https = require('https');
var querystring = require('querystring')
var Slack = require('slack-node');
slack = new Slack('xoxb-358077013474-1q4oD2JVr4WMbid3huglPILX');

// slack.api('apps.permission.request', {
//   user:'D3H23DLBT',
//   channel:'GAHQZUC6Q'
// }, function(err, response){
//   console.log(response);
// });		


app.post('/', function (req, res) {
  // res.send('hello world')
	console.log(req.body)

	// var message = req.body.event.text

	// message = message.replace(/.*>/, "")
	// message = message.replace(/\s/, "")

	// console.log(message)

	// if (message == "invite") {
		 
	// 	slack.api('channels.invite', {
	// 	  user:'D3H23DLBT',
	// 	  channel:'GAHQZUC6Q'
	// 	}, function(err, response){
	// 	  console.log(response);
	// 	});		

	// }
	res.sendStatus(200);
  // res.send(req.body.challenge)
})

app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)