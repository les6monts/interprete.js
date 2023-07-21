const ffmpeg = require("fluent-ffmpeg");

function convertOggToMp3(inputFilePath, outputFilePath) {
	return new Promise((resolve, reject) => {
		ffmpeg(inputFilePath)
			.toFormat("mp3")
			.output(outputFilePath)
			.on("end", () => {
				console.log("Conversion terminée !");
				resolve();
			})
			.on("error", (err) => {
				console.error("Erreur lors de la conversion :", err);
				reject(err);
			})
			.run();
	});
}

module.exports = convertOggToMp3;
