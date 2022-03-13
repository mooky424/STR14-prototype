require("dotenv").config();
const express = require("express");
const axios = require("axios").default;
const { Client, Intents, WebhookClient } = require('discord.js');

const app = express();
const port = 3000;

const client = new Client({
  intents:[
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

client.on('ready', () => {
  console.log('The bot is ready');
  
  //When server receives POST request, send details to discord
  app.post("/", (req, res) => {
    const { eventTitle } = req.body;
    client.channels.cache.get(process.env.DISCORD_CHANNELID).send(eventTitle);
    res.status(200).send();
  })

  const guild = client.guilds.cache.get(process.env.DISCORD_GUILDID);
  let commands;

  if (guild){
    commands = guild.commands;
  } else {
    commands = client.application?.commands;
  }

  /*
  Commands to add
  /event add {title} {date} {timeStart} {timeEnd}
  /event delete {number} 
  /event upcoming - Shows upcoming 10 events
  /event today - Shows events today
  /calendar view - Links id of calendar
  */

  commands?.create({
    name: 'eventadd',
    description: 'Adds an event to calendar'
  })

})

client.on('interactionCreate', async (interaction) => {
  if(!interaction.isCommand){
    return
  }
  console.log(interaction);
  const { commandName, options } = interaction;

  if (commandName === 'eventadd') {
    interaction.reply({
      content: 'Event added'
    })
  }
})

client.login(process.env.DISCORD_TOKEN);

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

