const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const passport = require('passport');
const passportUtil = require('./utils/passport');

const config = require('./config/server');

const models = require('./models');
models.sequelize.sync({ force: config.dbReset }).then(() => {
    console.log('✓ DB connection success.');
}).catch(err => {
    console.error(err);
    console.log('✗ DB connection error. Please make sure DB is running.');
    process.exit();
});

const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
}));
app.use(cors());
app.use(session({
    secret: '~!@#$%^&*()_+RiVaToR~!@#$%^&*()_+',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결
passportUtil();

app.use('/sign', require('./routes/sign'));
app.use('/users', require('./routes/user'));
app.use('/portfolios', require('./routes/portfolio'));

app.use('/courses', require('./routes/course'));
app.use('/course-managers', require('./routes/course-manager'));
app.use('/course-reviews', require('./routes/course-review'));

app.use('/projects', require('./routes/project'));
app.use('/project-managers', require('./routes/project-manager'));

app.use('/contests', require('./routes/contest'));
app.use('/contest-managers', require('./routes/contest-manager'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(200).json({
        status: { success: (err.status || 500), message: err.message }
    }).end();
});

module.exports = app;
