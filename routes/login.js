const express = require("express");
const router = express.Router();
const user = require("../models/User");
const hbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const {
  logical_errors,
  success_codes,
  error_codes,
} = require("../tools/error_codes");
const { logger } = require("../logs/logger");

const hb = hbs.create({
  extname: ".hbs",
  partialsDir: ".",
});

router.get("/", async (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
    console.log(req.body);
  const { username, password } = req.body;
  const playerInfo = {
    username: username,
  };

  if (!username || !password){
    logger.error("No username or password");
    return res.render('login', {
      data: 'Please enter both username and password'
    })
  }

  const userExists = await user.exists({ username: username });
  if (!userExists) {
    logger.error(error_codes.E3, playerInfo);
    return res.render('login', {
      data: 'User doesn\'t exist'
    })
  }
  const userToEnter = await user.findOne({ username: username });
  if (userToEnter.password !== password) {
    logger.error(error_codes.E3, playerInfo);
    return res.render('login', {
      data: 'Incorrect Password'
    })
  }
  logger.warn(success_codes.S5, playerInfo);

  res.redirect(
    `${process.env.CLIENT_URL}?token=${jwt.sign(
      { username: username },
      process.env.JWT_SECRET
    )}`
  );
});

module.exports = router;
