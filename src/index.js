require("dotenv").config();
const fs = require('fs');
const {
  Client,
  Intents,
  Collection
} = require('discord.js');
const calendar = require('../google');

//Webserver initialization and port
const express = require("express");
const {
  baremetalsolution
} = require("googleapis/build/src/apis/baremetalsolution");
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

  //get all roles in server once ready

  const sections = [];

  guild = client.guilds.cache.get(process.env.DISCORD_GUILDID);
  roles = guild.roles.fetch().then(res => {
    res.each(role => {
      sections.push({
        name: role.name,
        id: role.id
      })
    })
  })


  //When server receives POST request, send details to discord
  app.post("/", (req, res) => {

    console.log(`Request incoming with body:`);
    console.log(req.body);

    const {
      eventTitle,
      eventLink
    } = req.body;

    let eventMessage = `Hello `;

    if (eventTitle) {
      eventMessage += checkRoles(eventTitle, sections);
      eventMessage += `\n**${eventTitle}** is starting soon!`;
      if (eventLink) {
        eventMessage += `\nMeet Link: ${eventLink}`;
      }
      console.log(`Sending message:\n${eventMessage}`);
      client.channels.cache.get(process.env.DISCORD_CHANNELID).send({
        content: eventMessage
      }).then(() => {
        console.log(`Successfully sent event to channel`);
        res.status(200).send();
      });
    } else {
      res.status(400).send('Invalid Title')
      console.error(`Invalid Title request`)
    }
  })

})

app.use(express.json());

// Test server is working if html page has loaded

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

function checkRoles(title, sections) {

  //Whole batch meetings convert to appropriate titles for matching

  switch (title) {
    case 'Research 1':
      title = 'Grade 10';
      break;
    case 'Research 2':
      title = 'Grade 11';
      break;
    case 'Research 3':
      title = 'Grade 12';
      break;
    case 'Mathematics 6':
      title = 'Grade 12';
      break;
    default:
      title = title;
  }

  for (i = 0; i < sections.length; i++) {
    const pattern = new RegExp(`${sections[i].name}`, 'i'); //make a regular expression (case insensitive) to match to title later
    if (title.search(pattern) >= 0) {
      return `<@&${sections[i].id}>`;
    }
  }
  return `everyone`
}