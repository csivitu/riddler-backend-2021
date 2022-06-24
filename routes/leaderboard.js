const express = require("express");

const router = express.Router();
const user = require("../models/User");
const { logger } = require("../logs/logger");
const { error_codes, success_codes } = require("../tools/error_codes");
const { objectIdWithTimestamp } = require('../utils/objectId')

router.get("/all", async (req, res, next) => {
  try {
    const allUsers = await user.find({ _id: { $gt: objectIdWithTimestamp('2022/05/24') } }).sort({lastSolve: 1});
    allUsers.sort((a, b) => b.score - a.score);
    const responseJSON = allUsers.map(({ username, score }) => ({
      username,
      score,
    }));
    logger.warn(success_codes.S1);
    return res.status(200).json(responseJSON);
  } catch (e) {
    console.log(e);
    logger.error(error_codes.E0);
    return res.status(500).json({
      error: e,
      code: "E0",
    });
  }
});

module.exports = router;
