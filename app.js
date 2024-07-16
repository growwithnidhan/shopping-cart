var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');

var app = express();
var fileUpload = require('express-fileupload');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
var db = require('./config/connection');
var session = require('express-session');
const { ServerClosedEvent } = require('mongodb');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout',
  partialsDir: path.join(__dirname, '/views/partials'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.use((req, res, next) => {
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret: 'key', // Replace with a strong, secure key for session encryption
  cookie: { maxAge: 12000000 }, // Session expiry time in milliseconds (adjust as needed)
  resave: false,
  saveUninitialized: true,
  cookie:{secure:false}
}));

db.connect((err) => {
  if (err) console.log('connection error' + err);
  else console.log('Database connected to port');
});

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
