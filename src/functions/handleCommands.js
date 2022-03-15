const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');

module.exports = (client) => {
    
    const clientId = process.env.DISCORD_CLIENTID;
    const guildId = process.env.DISCORD_GUILDID;

    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        for (folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/${path}/${folder}`).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }
        
        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId), {
                        body: client.commandArray
                    },
                );

                console.log('Successfully reloaded application (/) commands.');
            
            } catch (error) {
                console.error(error);
            }
        })();
    };
};

// COMMANDS HERE

/*
  Commands to add
  /event delete {number} 
*/