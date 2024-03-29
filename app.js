const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const app = express();
const rateLimit = require('express-rate-limit');
const cors = require('cors');

require('dotenv/config');
require('./models/dbInit');

const templateFolder = path.join(__dirname, 'templates');
const mainLayout = path.join(templateFolder, 'main');
const partialsFolder = path.join(templateFolder, 'partials');

const staticFolder = path.join(__dirname, 'static');

app.set('views', path.join(__dirname, 'templates'));
app.engine(
  'html',
  hbs.engine({
      extname: '.html',
      defaultLayout: mainLayout,
      layoutsDir: templateFolder,
      partialsDir: partialsFolder,
  }),
);

app.set('view engine', 'html');

// var corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
app.use(cors())
// app.use(cors({
//     origin: process.env.ORIGIN_URL,
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }));
app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const authMiddleware = require('./middleware/authorize')

const scoreRoute = require('./routes/leaderboard');
const submitRoute = require('./routes/submit');
const mapRoute = require('./routes/mapdisplay');
const penaltyRoute = require('./routes/penalty');
const insertRoute = require('./routes/insert');
const quesRoute = require('./routes/question');
const playerdataRoute = require('./routes/playerdata');
const hintRoute = require('./routes/hint');
const hintPointsRoute = require('./routes/hintPoints');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});


app.use('/score', scoreRoute);
app.use("/submit", authMiddleware, apiLimiter, submitRoute);
app.use('/map', authMiddleware, mapRoute);
app.use('/penalty',authMiddleware, penaltyRoute);
app.use('/insert', authMiddleware, insertRoute);
app.use('/ques',authMiddleware , quesRoute);
app.use('/playerdata', authMiddleware, playerdataRoute);
app.use('/user', authMiddleware, playerdataRoute);
app.use('/hint',authMiddleware , hintRoute);
app.use('/hintpoints',authMiddleware , hintPointsRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
//app.use('/test', testRoute);

app.use('/static', express.static(staticFolder));

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(3001, () => {
    console.log('server started');
});