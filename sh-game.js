var https = require('https');


exports.invite = function(req,res){

	var message = req.body.event.text

	message = message.replace(/.*>/, "")

	if (message == invite) {

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
}
