const express = require("express");
const { getVideo } = require("../controllers/sourceController");

const router = express.Router();

// * Routers
router.get("/download/:sourceId", getVideo); // Downloading the file

module.exports = router;
