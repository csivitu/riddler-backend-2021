const express = require('express');

const app = express();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

require('dotenv/config');
require('./utils/resetPenaltyPoints');

app.use(cors());
app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const authMiddleware = require('./middleware/authorize')

const testRoute = require('./routes/testroute');
const scoreRoute = require('./routes/leaderboard');
const submitRoute = require('./routes/submit');
const mapRoute = require('./routes/mapdisplay');
const penaltyRoute = require('./routes/penalty');
const insertRoute = require('./routes/insert');
const quesRoute = require('./routes/question');
const playerdataRoute = require('./routes/playerdata');
const hintRoute = require('./routes/hint');


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});

app.use('/test', testRoute);
app.use('/score', apiLimiter, scoreRoute);
app.use('/submit',authMiddleware, apiLimiter, submitRoute);
app.use('/map', authMiddleware, apiLimiter, mapRoute);
app.use('/penalty',authMiddleware, apiLimiter, penaltyRoute);
app.use('/insert',authMiddleware , apiLimiter, insertRoute);
app.use('/ques',authMiddleware , apiLimiter, quesRoute);
app.use('/playerdata',authMiddleware , apiLimiter, playerdataRoute);
app.use('/hint',authMiddleware , apiLimiter, hintRoute);

app.get('/', (req, res) => {
    res.send('homepage');
});

// Connection to the database
mongoose.connect(
    process.env.DB_CONNECTION,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    },
);

mongoose.connection
    .once('open', () => {
        console.log('Connection to mongoDB established');
    })
    .on('error', (err) => {
        console.log('Error connecting to mongoDB:', err);
    });

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: ({
            message: error.message,
        }),
    });
});

app.listen(3001, () => {
    console.log('server started');
});
