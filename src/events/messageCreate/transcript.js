const fs = require("fs");
const streamPipeline = require("util").promisify(require("stream").pipeline);
const fetch = require("node-fetch");
const convertOggToMp3 = require("../../utils/oggToMp3");

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = async (client, message) => {
	if (message.author.bot) return;

	const attachment = message.attachments.first();
	if (!attachment) return;

	console.log("Message vocal détecté : " +message.id);

	const attachmentName = attachment.name;
	const attachmentExtension = attachmentName.split(".").pop();

	if (!["ogg", "mp3"].includes(attachmentExtension)) return;

	//le bot commence à écrire pour indiquer qu'il est en train de traiter le message
	message.channel.sendTyping();

	const response = await fetch(attachment.url);

	if (!response.ok)
		throw new Error(`Unexpected response ${response.statusText}`);

	const fichierAudio = message.id + "." + attachmentExtension;
	await streamPipeline(response.body, fs.createWriteStream(fichierAudio));

	// Convertir le fichier audio en mp3
	const fichierAudioMp3 = message.id + ".mp3";

	try {
		await convertOggToMp3(fichierAudio, fichierAudioMp3);
	} catch (err) {
		throw new Error("Erreur lors de la conversion du fichier audio.");
	}

	let prompt_perso = `Transcription du message vocal de ${
		message.author
	} : tu es un bot qui va transcrire le message vocal en texte.
    Tu es sur le serveur ${message.guild.name}.
    Les membres principaux du serveur sont : ${message.guild.members.cache
			.map((member) => member.user.username)
			.join(", ")}.
    Il y a un running gag sur le meme 'T'as les cramptés' 'quoicoubeh' et 'apagnan'.`;

	try {
		let resp = await openai.createTranscription(
			fs.createReadStream(fichierAudioMp3),
			"whisper-1",
			(prompt = prompt_perso)
		);
		console.log(resp.data.text);
		if (resp.data.text.trim() === "")
			return;

		let transcription = resp.data.text;

		//On supprime le point final de la transcription, pour être plus naturel
		transcription = transcription.replace(/\.$/, "");

		message.reply({
			content : transcription,
			allowedMentions: {
				repliedUser: false
		}});
	} catch (err) {
		message.reply({
			content : "Erreur lors de la transcription du message vocal.",
			allowedMentions: {
				repliedUser: false 
		}});
		throw new Error("Erreur lors de la transcription du message vocal.");
	} finally {
		await fs.unlinkSync(fichierAudio);
		await fs.unlinkSync(fichierAudioMp3);
	}
};
