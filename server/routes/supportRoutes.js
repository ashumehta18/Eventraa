const express = require("express");
const router = express.Router();
const { submitSupportRequest } = require("../controllers/supportController");

router.post("/", submitSupportRequest);

module.exports = router;
