var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var app = express();

const webpush = require('web-push');
var fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));


var vapid_keys = JSON.parse(fs.readFileSync('secrets.json','utf8'));
console.log(vapid_keys)

webpush.setVapidDetails(
   'mailto:matthew.robbins@gmail.com',
   vapid_keys.publicKey,
   vapid_keys.privateKey
);

//app.set("views", path.join(__dirname, "views"))

const db = new sqlite3.Database('./subscriptions.db', (err) => {
   if (err) {
      console.error("coulnt't open db")
   }
})

app.get('/subscriptions', function (req, res) {
   db.all('SELECT * FROM subscriptions', (err,rows) => {
      if (err) {
         res.status(400).json({"error":err.message})
         return;
      }
      res.status(200).json({rows})
   })
})

app.get('/', (req, res) => {
   res.send("Hello there.")
})

app.post('/subscribe', (req, res) => {
   console.log(req.body)
   var ep = req.body.endpoint;
   var sub = req.body.subscription;
   db.run("INSERT INTO subscriptions VALUES (?,?)", [ep,sub], function(err) {
      if (err) {
         return console.log(err.message);
      }
      console.log(`subscription inserted with rowid ${this.lastID}`)
   })
   res.send({'okay': true})
});

var server = app.listen(8081, '0.0.0.0', function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
});
