const express = require("express");

const router = express.Router();
const user = require("../models/User");
const map = require("../models/GameState");
const { quesSchema } = require("../utils/validation_schema");
const validator = require("express-joi-validation").createValidator({});
const { logger } = require("../logs/logger");
const {
  error_codes,
  logical_errors,
  success_codes,
} = require("../tools/error_codes");

router.post("/", validator.body(quesSchema), async (req, res) => {
  try {
    const { quesId } = req.body;
    const { username } = req.participant;

    const nodeInfo = await map.findOne({ username: username });
    const player = await user.findOne({ username: username });

    if (!nodeInfo || !player) {
      logger.error(error_codes.E3);
      return res.json({
        code: "E3",
      });
    }

    if (!(quesId === nodeInfo.lockedNode)) {
      logger.error(logical_errors.L3);
      return res.json({
        code: "L3",
      });
    }
    if (nodeInfo.hintQues.includes(quesId)) {
      logger.warn(logical_errors.L9);
      return res.json({
        code: "L9",
      });
    }
    if (player.score < process.env.HINT_PENALTY) {
      logger.error(logical_errors.L2);
      return res.json({
        code: "L2",
      });
    }
    player.score -= process.env.HINT_PENALTY; //assuming 5 points are reduced in using a hint
    nodeInfo.hintQues.push(quesId);
    player.save();
    nodeInfo.save();
    logger.warn(success_codes.S4);
    return res.json({
      code: "S4",
    });
  } catch (e) {
    logger.error(error_codes.E0);
    return res.status(500).json({
      code: "E0",
      error: e,
    });
  }
});

module.exports = router;
