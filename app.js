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
//const csrf = require('csurf');
const favicon = require('serve-favicon');
const app = express();
const sessionData = {
  name: 'gotmoney.sid',
  secret: '#Xurupita@Farms!X1',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

logger.level = process.env.LOG_LEVEL || 'debug';

if (app.get('env') === 'production') {
  sessionData.cookie.secure = true;
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(compression());
app.use(express.static('public'));
app.use(favicon(path.join(__dirname, 'public', 'webapp', 'images', 'favicon.ico')));
app.use(cookieParser(sessionData.secret));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session(sessionData));

require('./auth/authentication')(app);

app.use('/api', require('./routes/index'));

// Error handlers
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
