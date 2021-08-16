const express = require("express");

const router = express.Router();
const user = require("../models/User");
const map = require("../models/GameState");
const { authPenaltySchema } = require("../utils/validation_schema");
const validator = require("express-joi-validation").createValidator({});
const { logger } = require("../logs/logger");
const {
  error_codes,
  logical_errors,
  success_codes,
} = require("../tools/error_codes");

// ------------------------------Penalty Route----------------------------------------
router.post("/", validator.body(authPenaltySchema), async (req, res) => {
  try {
    console.log("penalty route");
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

    if (quesId === nodeInfo.lockedNode && nodeInfo.lockedNode !== 0) {
      if (player.currentPenaltyPoints >= 10) {
        player.currentPenaltyPoints -= 10;
        player.save();
        nodeInfo.lockedNode = 0;
        nodeInfo.save();
        logger.notice(success_codes.S3);
        return res.json({
          code: "S3",
        });
      } else {
        logger.error(logical_errors.L4);
        return res.json({
          code: "L4",
        });
      }
    } else {
      logger.error(logical_errors.L3);
      return res.json({
        code: "L3",
      });
    }
  } catch (e) {
    logger.error(error_codes.E0);
    return res.status(500).json({
      code: "E0",
      error: e,
    });
  }
});
// ------------------------------Penalty Route----------------------------------------

module.exports = router;
