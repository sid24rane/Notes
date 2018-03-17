// dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const cors = require('cors');
const passport = require('passport');
const helmet = require('helmet');
const logger = require('morgan');
const express_validator = require('express-validator');
const jade = require('jade');
const babel = require('jade-babel');

jade = babel({}, jade);

//csurf bakiye

// intializing express application
var app = express();

// setting some values
app.set('port',3000);
app.set('views','./views');
app.set('view engine','jade');

// intializing middlewares
app.use(express.static('public'));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(logger('dev'));
app.use(session({
	cookieName:"sessionid",
	secret:'siddheshranerocks',
	duration:5*60*60*1000 // 5hrs
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express_validator());

// routes
app.use('/',require('./controllers/index'));

app.listen(app.get('port'),()=>{
	console.log(`Express server is listening at port 3000`);
});