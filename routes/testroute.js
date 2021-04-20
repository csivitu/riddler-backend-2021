const express = require('express');

const router = express.Router();

const user = require('../models/User');
const question = require('../models/Question');
const map = require('../models/Map');

router.get('/', (req, res) => {
  res.redirect('/map');
});

router.post('/send', async (req, res) => {
  try {
    console.log(req.body);
    const resp = await user.create(req.body);
    res.send(resp);
  } catch (e) {
    console.log(e);
  }
});

router.post('/post1', async (req, res) => {
  try {
    console.log(req.body);
    const resp = await question.create(req.body);
    res.send(resp);
  } catch (e) {
    console.log(e);
  }
});

router.post('/post2', async (req, res) => {
  try {
    console.log(req.body);
    const resp = await map.create(req.body);
    res.send(resp);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
