require("dotenv").config();
const fs = require('fs');
const {
  Client,
  Intents,
  Collection,
  MessageEmbed
} = require('discord.js');
const calendar = require('../google');

//Webserver initialization and port
const express = require("express");
const axios = require("axios").default;
const app = express();
const port = 3000;

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const commandFolder = fs.readdirSync("./src/commands");
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));

//initialize client with necesssary intents
const client = new Client({
  intents: [
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

client.on('ready', () => {
  //When server receives POST request, send details to discord
  app.post("/", (req, res) => {

    console.log(`Request incoming:
    ${req.body}`);

    const {
      eventTitle,
      eventLink
    } = req.body;

    if (eventTitle) {
      client.channels.cache.get(process.env.DISCORD_CHANNELID).send({
        content: `Hello @everyone\n${eventTitle} is starting soon!\nMeet Link: ${eventLink}`
      });
      res.status(200).send();
      console.log(`Successfully sent event to channel`);
    } else {
      res.status(400).send('Invalid Title')
      console.error(`Invalid Title request`)
    }
  })

})

app.use(express.json());

app.get("/", (req, res) => res.send(`
      <html>
      <head><title>Success!</title></head>
      <body>
      <h1>You did it!</h1>
      <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Cool kid doing thumbs up" />
      </body>
      </html>`));


app.use((error, req, res, next) => {
  res.status(500)
  res.send({
    error: error
  })
  console.error(error.stack)
  next(error)
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);