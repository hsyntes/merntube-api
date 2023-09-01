const express = require("express");
const { getVideo } = require("../controllers/sourceController");

const router = express.Router();

router.get("/download/:sourceId", getVideo);

module.exports = router;
