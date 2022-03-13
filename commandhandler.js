const fs = require('fs');
const getFiles = require('./get-files');

module.exports = (client) => {
    const commands = {};

    const suffix = '.js';

    // const guild = client.guilds.cache.get(process.env.DISCORD_GUILDID);
    // let commandList;

    // if (guild) {
    //     commandList = guild.commands;
    // } else {
    //     commandList = client.application?.commands;
    // }


    const commandFiles = getFiles('./commands', suffix)
    console.log(commandFiles);

    for (const command of commandFiles) {
        let commandFile = require(command);
        if (commandFile.default) commandFile = commandFile.default;

        const split = command.replace(/\\/g, '/').split('/');
        const commandName = split[split.length - 1].replace(suffix, '');

        commands[commandName.toLowerCase()] = commandFile
    }

    console.log(commands)

    client.on('interactionCreate', (interaction) => {
        if (message.author.bot || !interaction.isCommand()) {
            return
        }
    })
}
