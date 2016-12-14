var util = require('util');
var express = require('express');
var morgan = require('morgan'); // used for logging the data to the console like get orr post req.
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //Used to read form data
var expressValidator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var flash = require('express-flash');
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');
var secret = require('./config/secret');
var User = require('./models/user');
var Category = require('./models/category');
var Questions = require('./models/questions');
var app = express();

//connect to mongoose
mongoose.connect(secret.database, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

//app.use to run a middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(bodyParser.json()); // Could parse json data format from req of the bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 2628000000 },
  secret: secret.secretKey,
  // unset: 'destroy',
  store: new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

//Custom error function for routing
app.use(function(err,req,res,next) {
  console.log(err.stack);
  res.status(500).send("Something went wrong");
});

app.engine('ejs', engine); //use ejs-locals for all ejs templates
app.set('view engine', 'ejs'); //so you can render ejs template directly for your html


// sub-route
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRouter = require('./routes/admin');
var apiRoutes = require('./api/api');
var questionRoutes = require('./routes/question');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRouter);
app.use('/api' ,apiRoutes);
app.use(questionRoutes);

var server = app.listen(secret.port, (err) => {
  var host = server.address().address;
  var port = server.address().port;
  if (err) throw err;
  console.log("Server is running on " + host +'Post no' + port);
});
