require("dotenv").config();

const {
	Client,
	IntentsBitField,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
} = require("discord.js");

const { Configuration, OpenAIApi } = require("openai");

const eventHandler = require("./handlers/eventHandler");

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessageReactions,
	],
});

eventHandler(client);

client.login(process.env.DISCORD_TOKEN);
