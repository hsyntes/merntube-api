const ErrorProvider = require("../classes/ErrorProvider");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const Source = require("../models/Source");

// * Downloading & Converting the YouTube source
exports.downloadVideo = (type, videoURL, title, connection) => {
  const fileExtension = type === "Video" ? "mp4" : "mp3";

  const fileName = `merntube - ${title}.${fileExtension}`;
  const downloadsDir = path.join(__dirname, "../downloads");

  try {
    // * Create the source path to download if it doesn't exist.
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const sourceDir = path.join(downloadsDir, fileName);

    // * Configuration for the YouTube source
    const videoStream = ytdl(videoURL, {
      quality: "highest",
      filter: fileExtension === "mp4" ? "videoandaudio" : "audioonly",
    });

    const fileStream = fs.createWriteStream(sourceDir);

    videoStream.on("progress", (chunkLength, downloaded, total) => {
      const progress = (downloaded / total) * 100;
      // * Send progress to the WebSocket
      connection.send(JSON.stringify({ progress }));
    });

    // * Transfer data from one source to another
    videoStream.pipe(fileStream);

    // * When transfer is completed
    videoStream.on("end", async () => {
      // * Create a MongoDB document
      const source = await Source.create({
        url: videoURL,
        path: `downloads/${fileName}`,
      });

      // * Send the completion status to WebSocket
      await connection.send(
        JSON.stringify({
          status: "success",
          progress: 100,
          message: "Conversion completed!",
          id: source._id,
        })
      );
    });
  } catch (e) {
    console.error("File system error: ", e);
    next(e);
  }
};

// * Downloading video for the client
exports.getVideo = async (req, res, next) => {
  if (!req.params.sourceId) {
    return next(
      new ErrorProvider(403, "fail", "Please specify a valid video source.")
    );
  }

  const { sourceId } = req.params;

  const source = await Source.findById(sourceId);

  const filePath = path.join(__dirname, "../downloads/", source.path);

  res.download(filePath);
};
