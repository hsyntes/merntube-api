const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const WebSocket = require("ws");
const { downloadVideo } = require("./controllers/sourceController");

// * Uncaught Exception Error
process.on("uncaughtException", (err) => {
  console.error(`${err.name}. Server is shutting down.`);
  console.error(err.message);
});

// * Configuration
dotenv.config({ path: "./config.env" });

// * Connection to the MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connecting to the database successfully.");
  } catch (e) {
    console.error(`Connecting to the database failed: ${e}`);
  }
})();

// * Starting the server
const server = http.createServer(app);

// * Listening to the server
server.listen(process.env.PORT, () =>
  console.log(`Server is running on PORT: ${process.env.PORT}`)
);

// * Starting the WebSocket
(() => {
  try {
    const webSocket = new WebSocket.Server({ server });

    webSocket.on("connection", (connection) => {
      console.log("WebSocket connection is started.");

      connection.on("message", (message) => {
        const { type, videoURL, title } = JSON.parse(message);
        console.log(type, videoURL, title);
        downloadVideo(type, videoURL, title, connection);
      });
    });
  } catch (e) {
    console.error(`WebSocket server initialization error: ${e}`);
  }
})();

// * Unhandled Rejection
process.on("unhandledRejection", (err) => {
  console.error(`${err.name} Server is shutting down.`);
  console.error(err.message);
  server.close(() => process.exit(1));
});
