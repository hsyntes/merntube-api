const express = require("express");
const cors = require("cors");
const compression = require("compression");
const expressRateLimit = require("express-rate-limit");
const expressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const sourceRouters = require("./routers/sourceRouter");
const ErrorProvider = require("./classes/ErrorProvider");
const errorController = require("./controllers/errorController");

const app = express();

// * Allowed origins
const origins = ["https://merntube.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (origins.includes(origin) || !origin) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// * Compression for production
app.use(compression());

// * API limit requests
const limit = expressRateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: "Too many requests.",
  standartHeaders: true,
  legacyHeaders: false,
});

// * Security
app.use(express.json({ limit }));
app.use(expressMongoSanitize());
app.use(helmet());
app.use(hpp());
app.use(xss());

// * Root router
app.get("/", (req, res) => res.send("Welcome to MernTube API!"));

// * Routes
app.use("/merntube/sources", sourceRouters);

// * Unsupported routes
app.all("*", (req, res, next) =>
  next(new ErrorProvider(404, "fail", `Unsupported URL: ${req.originalUrl}`))
);

// * Global error handling
app.use(errorController);

module.exports = app;
