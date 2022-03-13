const { SlashCommandBuilder } = require('@discordjs/builders');
const calendar = require(`../../../google`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eventadd')
		.setDescription('Adds event to calendar'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};