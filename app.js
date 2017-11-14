'use strict';

require('dotenv').load();
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('winston');
const morgan = require('morgan');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const csrf = require('csurf');
const favicon = require('serve-favicon');
const sha256 = require('crypto-js/sha256');
const base64 = require('crypto-js/enc-base64');
const app = express();
const sessionData = {
  name: 'gotmoney.sid',
  secret: process.env.SESSION_SECRET + Math.random().toString(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};
const staticData = {
  maxAge: 7 * 24 * 60 * 60 * 1000
};

logger.level = process.env.LOG_LEVEL;
sessionData.store = new MongoStore({
  url: [process.env.SESSION_PROTOCOL,
        process.env.SESSION_CREDENTIALS,
        process.env.SESSION_CLUSTERS,
        process.env.SESSION_DB,
        process.env.SESSION_PARAMETERS].join('')
});

// Clear all sessions when starting the app
sessionData.store.clear();

if (app.get('env') === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
  staticData.maxAge = 0;
}

app.enable('trust proxy');
app.use(helmet());
app.use(compression());
app.use(favicon(path.join(__dirname, 'public', 'webapp', 'images', 'favicon.ico')));
app.use(express.static('public', staticData));
app.use(cookieParser(sessionData.secret));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session(sessionData));
app.use(csrf());

require('./auth/authentication')(app);

app.use((req, res, next) => {
  res.set('X-Got-Money', base64.stringify(sha256([Math.random().toString(), new Date().toISOString()].join(''))));
  res.locals.csrftoken = req.csrfToken();
  res.locals.session = req.session;
  next();
});

app.use('/api', require('./routes/index'));

// Error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Production error handler no stacktraces leaked to user
app.use((err, req, res, next) => {
  const errorResponse = {
    message: err.message,
    messageCode: err.messageCode,
    error: (app.get('env') === 'development') ? err : {}
  };
  errorResponse.error = err.validationErrors || errorResponse.error;
  res.status(err.status || 500).json(errorResponse);
});

module.exports = app;
