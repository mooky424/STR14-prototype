require("dotenv").config();
const express = require("express");
const fs = require('fs');
const axios = require("axios").default;
const { Client, Intents, Collection } = require('discord.js');
const calendar = require('../google');

const functions = fs.readdirSync("./src/functions").filter( file => file.endsWith(".js"));
const commandFolder = fs.readdirSync("./src/commands");
const eventFiles = fs.readdirSync("./src/events").filter( file => file.endsWith(".js"));

//Webserver initialization and port
const app = express();
const port = 3000;

//initialize client with necesssary intents
const client = new Client({
  intents:[
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

client.commands = new Collection();

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }

  client.handleEvents(eventFiles, "./events");
  client.handleCommands(commandFolder, "./commands")
  client.login(process.env.DISCORD_TOKEN);

})();

// client.on('ready', () => {
//   console.log('The bot is ready');
  
//   //When server receives POST request, send details to discord
//   app.post("/", (req, res) => {
//     const { eventTitle } = req.body;
//     client.channels.cache.get(process.env.DISCORD_CHANNELID).send(eventTitle);
//     res.status(200).send();
//   })
 
// })


app.use(express.json());

app.get("/", (req, res) => res.send(`
  <html>
    <head><title>Success!</title></head>
    <body>
      <h1>You did it!</h1>
      <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Cool kid doing thumbs up" />
    </body>
  </html>
`));

app.use((error, req, res, next) => {
  res.status(500)
  res.send({error: error})
  console.error(error.stack)
  next(error)
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

