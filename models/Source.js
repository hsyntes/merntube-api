const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "A video source is required."],
      trim: true,
    },

    path: {
      type: String,
      required: [true, "A video must have a path."],
      trim: true,
    },
  },
  { versionKey: false }
);

const Source = mongoose.model("Source", sourceSchema);

module.exports = Source;
