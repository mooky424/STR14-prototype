const { Client } = require('discord.js');
const fs = require('fs');
const getFiles = require('./get-files');

module.exports = (client) => {
    const commands = {};
    
    const suffix = '.js';

    const commandFiles = getFiles('./commands', suffix)
    console.log(commandFiles);

    for (const command of commandFiles) {
        let commandFile = require(command);
        if (commandFile.default) commandFile = commandFile.default;
    }
}