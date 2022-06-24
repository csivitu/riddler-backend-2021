const express = require("express");
const router = express.Router();
const user = require("../models/User");
const hbs = require("express-handlebars");
const map = require("../models/GameState");
const { logger } = require("../logs/logger");
const {
  logical_errors,
  success_codes,
  error_codes,
} = require("../tools/error_codes");
const jwt = require("jsonwebtoken");

const hb = hbs.create({
  extname: ".hbs",
  partialsDir: ".",
});

router.get("/", async (req, res) => {
  res.render("register");
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password){
    logger.error("No username or password");
    return res.render('register', {
      data: 'Please enter both username and password'
    })
  }

  const playerInfo = {
    username: username,
  };
  const userExists = await user.exists({ username: username });
  if (userExists) {
    logger.error(error_codes.E3, playerInfo);
    return res.render('register', {
      data: 'Username already exists'
    })
  }
  const userToEnter = new user({
    username: username,
    password: password,
    score: 0,
    currentTrack: [0, 0],
    currentPenaltyPoints: 2,
  });

  let stateToEnter = new map({
    username: username,
    unlockedNodes: [37, 38, 39],
    solvedNodes: [],
    portalNodes: [
      {
        9: {
          ans: [],
        },
        20: {
          ans: [],
        },
        32: {
          ans: [],
        },
      },
    ],
    currentPosition: 0,
    lockedNode: 0,
    hintQues: [],
  });

  stateToEnter.save();

  userToEnter.save();
  logger.warn(success_codes.S5, playerInfo);
  res.redirect(
    `${process.env.CLIENT_URL}?token=${jwt.sign(
      { username: username },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    )}`
  );
});

module.exports = router;
