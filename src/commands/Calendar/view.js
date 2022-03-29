const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const {
	MessageEmbed
} = require('discord.js');
const {
	use
} = require('express/lib/application');
const calendar = require(`../../../google`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view')
		.setDescription('Views Events')
		.addSubcommand(subcommand => subcommand.setName('upcoming')
			.setDescription('Views upcoming events from now')
		)
		.addSubcommand(subcommand => subcommand.setName('today')
			.setDescription('Views events for today')
		)
		.addSubcommand(subcommand => subcommand.setName('calendar')
			.setDescription('Links the calendar')
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'upcoming') {
			console.log("view upcoming command triggered");
			calendar.viewEvents(true, async (items) => {
				const eventEmbed = new MessageEmbed()
					.setTitle('Upcoming Events')
					.setAuthor({
						name: 'Calendar Bot',
						iconURL: 'https://i.pinimg.com/474x/55/e0/76/55e07698bca8e4aa1761121600c818e0.jpg'
					});
				for (i = 0; i < items.length && i < 10; i++) {

					link = items[i].eventMeetLink || 'N/A';
					title = `${i+1}. ${items[i].eventTitle || '[UNDEFINED]'}`;
					start = calendar.parseDatetoString(items[i].eventStart, true, true);
					end = calendar.parseDatetoString(items[i].eventEnd, true, true);
					eventEmbed.addFields({
						name: title,
						value: ` Meet Link: ${link}\nStart: ${start}\nEnd: ${end}`
					})
				}
				await interaction.reply({
					embeds: [eventEmbed],
					ephemeral: true
				});
				console.log("Success!");
			})
		} else if (interaction.options.getSubcommand() === 'today') {
			console.log("view today command triggered");
			calendar.viewEvents(false, async (items) => {
				const eventEmbed = new MessageEmbed()
					.setTitle('Events Today')
					.setAuthor({
						name: 'Calendar Bot',
						iconURL: 'https://i.pinimg.com/474x/55/e0/76/55e07698bca8e4aa1761121600c818e0.jpg'
					});
				for (i = 0; i < items.length && i < 10; i++) {

					link = items[i].eventMeetLink || 'N/A';
					title = `${i+1}. ${items[i].eventTitle || '[UNDEFINED]'}`;
					start = calendar.parseDatetoString(items[i].eventStart, false, true);
					end = calendar.parseDatetoString(items[i].eventEnd, false, true);
					eventEmbed.addFields({
						name: title,
						value: ` Meet Link: ${link}\nStart: ${start}\nEnd: ${end}`
					})
				}
				await interaction.reply({
					embeds: [eventEmbed],
					ephemeral: true
				});
				console.log("Success!");
			})
		} else if (interaction.options.getSubcommand() === 'calendar') {
			console.log("view calendar command triggered");
			calendar.viewCalendar((id) => {
				interaction.reply({
					content: `Calendar Id: ${id}\nUse this ID to subscribe to the calendar`,
					ephemeral: true
				});
				console.log("Success!");
			})
		}

	},
};
