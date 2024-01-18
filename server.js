var express = require('express');
const sqlite3 = require('sqlite3').verbose();
const webpush = require('web-push');
var fs = require('fs');
const mqtt = require('mqtt');

// create Express web app
var app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));

// get VAPID keys from file and set up the webpush module
var vapid_keys = JSON.parse(fs.readFileSync('secrets-vapid.json','utf8'));

webpush.setVapidDetails(
   vapid_keys.email,
   vapid_keys.publicKey,
   vapid_keys.privateKey
);

// connect to the db for subscriptions
// CREATE TABLE subscriptions (endpoint VARCHAR, subscription, VARCHAR);

const db = new sqlite3.Database('./subscriptions.db', (err) => {
   if (err) {
      console.error("coulnt't open db")
   }
})

function pushIt() {
   db.all('SELECT * FROM subscriptions', (err,rows) => {
      if (err) {
         res.status(400).json({"error":err.message})
         return;
      }

      rows.forEach((row) => {
         webpush.sendNotification(JSON.parse(row.subscription), "hi").catch((err) => {
            console.log("couldn't send notification")
            console.log(row.subscription);
            db.run("DELETE FROM subscriptions WHERE subscription = ?;", [row.subscription], function(err) {
               console.log(err)
            });
            
         })
       });
   });
}

//
// SET UP Express URL handlers
//

app.get('/vapid_public', function(req,res) {
   res.send(vapid_keys.publicKey);
});

app.get('/subscriptions', function (req, res) {
   db.all('SELECT * FROM subscriptions', (err,rows) => {
      if (err) {
         res.status(400).json({"error":err.message})
         return;
      }
      res.status(200).json({rows})
   })
});

app.get('/push', function (req, res) {
   pushIt()
   res.status(200).json({"result":"ok"})
   
});

app.get('/', (req, res) => {
   res.send("Hello there.")
})

app.post('/subscribe', (req, res) => {
   console.log(req.body)
   var ep = req.body.endpoint;
   var sub = JSON.stringify(req.body);
   db.run("INSERT INTO subscriptions VALUES (?,?)", [ep,sub], function(err) {
      if (err) {
         return console.log(err.message);
      }
      console.log(`subscription inserted with rowid ${this.lastID}`)
   })
   res.send({'okay': true})
});

//
// Start Server running
//

var server = app.listen(8081, '0.0.0.0', function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
});

//
// connect to MQTT broker and process messages, trigger web push when recieved
//

var mqtt_creds = JSON.parse(fs.readFileSync('secrets-mqtt.json','utf8'));

const client = mqtt.connect(mqtt_creds.host, { 
  username: mqtt_creds.user,
  password: mqtt_creds.pass
});

client.subscribe('water/#');

client.on('message', (topic, message) => {
   //console.log(`Received message on topic ${topic}: ${message}`);
   if ((topic === "water/binary_sensor/water/state") && (message.toString() == "ON")) {
      console.log("pushin it!")
      pushIt()
   }
 });