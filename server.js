bodyParser = require('body-parser');
app = require('express')();
app.use(bodyParser.json());
shgame = require('sh-game')

app.post('/', function (req, res) {
  // res.send('hello world')
	shgame.invite
	res.send(200)  
  // res.send(req.body.challenge)
})

app.get('/', function(req,res){
	res.send('hellow world')
})


app.listen(process.env.PORT || 3000)


https://hooks.slack.com/services/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