const express = require('express'),
mongoose = require('mongoose'),
passport = require('passport'),
bodyParser = require('body-parser'),
LocalStrategy = require('passport-local'),
passportLocalMongoose = require('passport-local-mongoose'),
User = require('./models/user'),
app = express();

mongoose.connect('mongodb://localhost/auth_demo_app')

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(require('express-session')({
    secret: 'denmarkisbetterthansweden',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


/*
 ROUTES
*/

app.get('/', (req,res) => {
    res.render('home')
})

app.get('/secret', isLoggedIn, (req,res) => {
    res.render('secret')
})

/*
 AUTHENTICATION ROUTES
*/
app.get('/register', (req,res) => {
    res.render('register')
})
app.post('/register', (req,res) => {
    const {username, password} = req.body
    User.register(new User({username: username}), password, (err,user) => {
        if(err){
            console.log(err)
            return res.render('register')
        }
        passport.authenticate('local')(req,res, () => {
            res.redirect('/secret')
        })
    })
})
//LOGIN LOGIC
app.get('/login', (req,res) => {
    res.render('login')
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}),(req,res) => {
    
})

//LOGOUT LOGIC
app.get('/logout', (req,res) => {
    req.logout()
    res.redirect('/')
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
app.listen(process.env.PORT, process.env.IP, () => {
    console.log('Server started')
})