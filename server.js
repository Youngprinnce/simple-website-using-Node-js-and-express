const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const createError = require('http-errors');
const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

// Class instance
const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const routes = require('./routes');

// Instance of Express
const app = express();
const port = 8080;

// Initializing EJS template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.locals.siteNmae = 'ROUX Meetups';

app.set('trust proxy', 1);

// Initialize Session
app.use(
  cookieSession({
    name: 'session',
    keys: ['hdgs66242', '87239grbhe8'],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define path our static files
app.use(express.static(path.join(__dirname, './static')));

app.use(async (req, res, next) => {
  try {
    const names = await speakersService.getNames();
    res.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

// initializing routes middleware
app.use('/', routes({ feedbackService, speakersService }));

app.use((req, res, next) => {
  return next(createError(404, 'File not found'));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  console.error(err);
  const status = err.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render('error');
  return next();
});

app.listen(port, () => {
  console.log(`server running on port ${port}!`);
});
