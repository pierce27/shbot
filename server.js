app = require('express')();

app.get('/', function (req, res) {
  // res.send('hello world')
  console.log(req)
  res.send('hello wolrd')
})

app.listen(process.env.PORT || 3000)