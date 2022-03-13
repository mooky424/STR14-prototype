module.exports = (client) => {
    client.handleEvents = async (eventFiles, path) => {
        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            client.on (event.name, (...args) => event.execute(...args, client));
        }
    };
}