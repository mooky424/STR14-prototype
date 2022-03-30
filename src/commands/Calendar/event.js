const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const {
	MessageEmbed
} = require('discord.js');
const calendar = require(`../../../google`);

const monthIntegerArray = [
	['January', 0],
	['February', 1],
	['March', 2],
	['April', 3],
	['May', 4],
	['June', 5],
	['July', 6],
	['August', 7],
	['September', 8],
	['October', 9],
	['November', 10],
	['December', 11],
]

const hourIntegerArray = [];

for (i = 0; i <= 23; i++) {
	hourIntegerArray.push([`${i}`, i])
}

let title = null;
let description = null;
let start = null;
let end = null;
let eventWizardState = false;

function resetValues() {
	title = null;
	description = null;
	start = null;
	end = null;
	eventWizardState = false;
}

const checkState = async function (interaction, state, callback) {
	if (state) {
		callback(interaction)
	} else {
		interaction.reply({
			content: 'No ongoing event creation',
			ephemeral: true
		});
	}
}

const eventEmbed = new MessageEmbed()
	.setTitle(`Event Wizard`)
	.setAuthor({
		name: 'Calendar Bot',
		iconURL: 'https://i.pinimg.com/474x/55/e0/76/55e07698bca8e4aa1761121600c818e0.jpg'
	})
	.addFields({
		name: 'Title',
		value: 'use /event create'
	}, {
		name: 'Description',
		value: 'use /event description'
	}, {
		name: 'Start Time',
		value: 'use /event start',
		inline: true
	}, {
		name: 'End Time',
		value: 'use /event end',
		inline: true
	});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Creates events for the calendar')
		.addSubcommand(subcommand => subcommand.setName('create')
			.setDescription('Creates event creation wizard')
			.addStringOption(option => option.setName('title').setDescription('Event Title').setRequired(true))
		)
		.addSubcommand(subcommand => subcommand.setName('cancel')
			.setDescription('Cancels the current event creation wizard')
		)
		.addSubcommand(subcommand => subcommand.setName('review')
			.setDescription('Reviews the current event creation wizard')
		)
		.addSubcommand(subcommand => subcommand.setName('description')
			.setDescription('Sets the event description')
			.addStringOption(option => option.setName('description').setDescription('Event Desc.').setRequired(true))
		)
		.addSubcommand(subcommand => subcommand.setName('start')
			.setDescription('Sets the event start')
			.addIntegerOption(option => option.setName('month').setDescription('Event Start Month').setRequired(true).setChoices(monthIntegerArray))
			.addIntegerOption(option => option.setName('day').setDescription('Event Start Day').setRequired(true))
			.addIntegerOption(option => option.setName('year').setDescription('Event Start Year').setRequired(true))
			.addIntegerOption(option => option.setName('hour').setDescription('Event Start Hour').setChoices(hourIntegerArray))
			.addIntegerOption(option => option.setName('minute').setDescription('Event Start Minute'))
		)
		.addSubcommand(subcommand => subcommand.setName('end')
			.setDescription('Sets the event end')
			.addIntegerOption(option => option.setName('month').setDescription('Event Start Month').setRequired(true).setChoices(monthIntegerArray))
			.addIntegerOption(option => option.setName('day').setDescription('Event Start Day').setRequired(true))
			.addIntegerOption(option => option.setName('year').setDescription('Event Start Year').setRequired(true))
			.addIntegerOption(option => option.setName('hour').setDescription('Event Start Hour').setChoices(hourIntegerArray))
			.addIntegerOption(option => option.setName('minute').setDescription('Event Start Minute'))
		)
		.addSubcommand(subcommand => subcommand.setName('confirm')
			.setDescription('Add event to clendar')
		),
	async execute(interaction, client) {
		if (interaction.options.getSubcommand() === 'create') {

			console.log(`event create command triggered!`);

			if (!eventWizardState) { //Check if ongoing event wizard\

				eventWizardState = true; //Initiates event wizard

				title = interaction.options.getString('title')
				eventEmbed.spliceFields(0, 1, {
					name: 'Title',
					value: title
				})

				await interaction.reply({
					embeds: [eventEmbed],
					ephemeral: true
				});
			} else await interaction.reply({
				content: 'Ongoing event creation wizard (Use /event cancel to quit or /event review to complete)',
				ephemeral: true
			});

		} else if (interaction.options.getSubcommand() === 'cancel') {

			console.log(`event cancel command triggered!`);

			await checkState(interaction, eventWizardState, async () => {
				resetValues();
				await interaction.reply({
					content: 'Event creation cancelled',
					ephemeral: true
				})
			})

		} else if (interaction.options.getSubcommand() === 'review') {

			console.log(`event review command triggered!`);

			await checkState(interaction, eventWizardState, async () => {
				await interaction.reply({
					embeds: [eventEmbed],
					ephemeral: true
				})
			})

		} else if (interaction.options.getSubcommand() === 'description') {

			console.log(`event description command triggered!`);

			await checkState(interaction, eventWizardState, async () => {
				description = interaction.options.getString('description');
				eventEmbed.spliceFields(1, 1, {
					name: 'Description',
					value: description
				})
				await interaction.reply({
					embeds: [eventEmbed],
					ephemeral: true
				})
			})

		} else if (interaction.options.getSubcommand() === 'start') {

			console.log(`event start command triggered!`);

			await checkState(interaction, eventWizardState, async () => {
				const month = interaction.options.getInteger('month');
				const day = interaction.options.getInteger('day');
				const year = interaction.options.getInteger('year');
				const hour = interaction.options.getInteger('hour') || 0;
				const minute = interaction.options.getInteger('minute') || 0;

				start = new Date(year, month, day, hour, minute);

				eventEmbed.spliceFields(2, 1, {
					name: 'Start Time',
					value: start.toString()
				});
				await interaction.reply({
					embeds: [eventEmbed],
					ephemeral: true
				});
			})
		} else if (interaction.options.getSubcommand() === 'end') {

			console.log(`event end command triggered!`);

			await checkState(interaction, eventWizardState, async () => {
				const month = interaction.options.getInteger('month');
				const day = interaction.options.getInteger('day');
				const year = interaction.options.getInteger('year');
				const hour = interaction.options.getInteger('hour') || 0;
				const minute = interaction.options.getInteger('minute') || 0;

				end = new Date(year, month, day, hour, minute);

				if (start > end) {
					await interaction.reply({
						content: `The date you inputted is earlier than the starting date. Please Try Again`,
						ephemeral: true
					})
				} else {
					eventEmbed.spliceFields(3, 1, {
						name: 'End Time',
						value: end.toString()
					});
					await interaction.reply({
						embeds: [eventEmbed],
						ephemeral: true
					});
				}
			})
		} else if (interaction.options.getSubcommand() === 'confirm') {

			console.log(`event confirm command triggered!`);

			await checkState(interaction, eventWizardState, async () => {

				if (start && end) {

					const reportStart = start.toString();
					const reportEnd = end.toString();
					const reportEmbed = new MessageEmbed()
						.setTitle(title)
						.setDescription(description || '[UNDEFINED]')
						.addFields({
							name: 'Start Time',
							value: reportStart
						}, {
							name: 'End Time',
							value: reportEnd
						});

					await interaction.deferReply({
						ephemeral: true
					})

					// calendar.addEvent(title, description, start, end).then(async () => {
					// 	resetValues();
					// })

					resetValues();

					await interaction.editReply({
						content: `Succesfully inserted the event:`,
						embeds: [reportEmbed],
						ephemeral: false
					})

				} else {
					await interaction.reply({
						content: `There are no valid dates inputted. Please try again`,
						ephemeral: true
					})
				}


			})
		}
	},
};