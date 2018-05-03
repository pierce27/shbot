app = require('express')();

app.post('/', function (req, res) {
  // res.send('hello world')
  console.log(req)
  res.send('challenge')
})

app.get('/', function(req,res){
	res.send('hellow world')
})

app.listen(process.env.PORT || 3000)