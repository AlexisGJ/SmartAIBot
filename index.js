var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

var randomResponses = [
    "okok",
    "tyl",
    "nice dude",
    "decalis",
    "no comprendo",
    "lol",
    "je comprends pas man",
    "intéressant",
    "ahhh, non",
    "k"
];
var daysOfWeek = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
var months = ["janvier","février","mars","avril","may","juin","juillet","août","septembre","octobre","novembre","décembre"];

var historyString = " history: ";

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            var responseText = "";
            var userText = event.message.text.toLowerCase();
            if (userText.includes("hello")) {
              responseText = "tyl";
            } else if (userText.includes("date")) {
              var d = new Date();
              responseText = "on est " + daysOfWeek[d.getDay()] + " le " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
            } else if (userText.includes("time")) {
              var d = new Date();
              responseText = "live yé " + (d.getHours()-5) + "h" + d.getMinutes();
            } else if (userText.includes("weather")) {
              sendMessage(event.sender.id, {text: "2 sec dude"});
              responseText = "fuck off";
            } else if (userText.includes("suce")) {
              responseText = "oui je suce toi?";
            } else if (userText.includes("lol") || userText.includes("xd") || userText.includes("ha")) {
              responseText = "hihi";
            } else {
              var randomNumber = Math.floor((Math.random() * 10));
              responseText = randomResponses[randomNumber];
            }

            historyString += responseText;
            sendMessage(event.sender.id, {text: responseText + historyString});
        }
    }
    res.sendStatus(200);
});


// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
