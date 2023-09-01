const ErrorProvider = require("../classes/ErrorProvider");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const Source = require("../models/Source");

exports.downloadVideo = (type, videoURL, title, connection) => {
  const fileExtension = type === "Video" ? "mp4" : "mp3";

  const fileName = `merntube - ${title}.${fileExtension}`;
  const downloadsDir = path.join(process.cwd(), "downloads");

  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

  const sourceDir = path.join(downloadsDir, fileName);

  const videoStream = ytdl(videoURL, {
    quality: "highest",
    filter: fileExtension === "mp4" ? "videoandaudio" : "audioonly",
  });

  const fileStream = fs.createWriteStream(sourceDir);

  videoStream.on("progress", (chunkLength, downloaded, total) => {
    const progress = (downloaded / total) * 100;
    connection.send(JSON.stringify({ progress }));
  });

  videoStream.pipe(fileStream);

  videoStream.on("end", async () => {
    const source = await Source.create({
      url: videoURL,
      path: `downloads/${fileName}`,
    });

    await connection.send(
      JSON.stringify({
        status: "success",
        progress: 100,
        message: "Download completed!",
        id: source._id,
      })
    );
  });
};

exports.getVideo = async (req, res, next) => {
  if (!req.params.sourceId)
    return next(
      new ErrorProvider(403, "fail", "Please specify a valid video source.")
    );

  const { sourceId } = req.params;

  const source = await Source.findById(sourceId);

  res.download(path.join(__dirname, "..", source.path));
};
