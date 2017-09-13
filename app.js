const express = require('express')
const app = express()
const PORT = process.env.PORT
const IP = process.env.IP
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const LocalStrategy = require('passport-local')
const Campground = require('./models/campground')
const Comment = require('./models/comment')
const User = require('./models/user')
const seedDB = require("./seeds")
mongoose.connect('mongodb://localhost/yelp_camp')
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
seedDB();

//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret:'denmarkisbetterthanswedenandfinland',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req,res) => {
    res.render("landing")
})

//INDEX ROUTE -- Show all campgrounds
app.get('/campgrounds', (req, res) => {
    //res.render('campgrounds', {campgrounds: campgrounds})
    //Get all campgrounds from db, then render
    Campground.find({}, (err, data) => {
        if(err) console.log(err)
        else{
            res.render('campgrounds/index', {campgrounds: data})
        }
    })
})

app.post('/campgrounds',(req,res) => {
    const {name, image, description}  = req.body;
    //Create a new cg and save to DB
    Campground.create({name: name, image: image, desc: description}, (err,data) =>{
        if(err) {
            console.log(err)
        }else{
           res.redirect('/campgrounds')
        }
    })
})

//NEW - Show form to create new campground
app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new.ejs')
})

//SHOW - Shows more info about one cg
app.get("/campgrounds/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log("Error returning the campground");
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

app.get('/campgrounds/:id/comments/new',isLoggedIn, (req,res) => {
    //Find campground by id
    Campground.findById(req.params.id, (err, cg) => {
        if(err){
            console.log(err)
        }else{
            res.render('comments/new', {campground: cg})
        }
    })
})

app.post('/campgrounds/:id/comments', (req,res) => {
    //lookup cg via id
    Campground.findById(req.params.id, (err, cg) => {
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }else{
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    console.log(err)
                }else{
                    cg.comments.push(comment)
                    cg.save()
                    res.redirect(`/campgrounds/${cg._id}`)
                }
            })
        }
    })
})

//AUTH ROUTES
app.get('/register', (req,res) => {
    res.render('register')
})
app.post('/register', (req,res) => {
    let newGuy = new User({username: req.body.username})
    User.register(newGuy, req.body.password, (err, user) => {
        if(err){
            console.log(err)
            return res.render('register')
        }
        passport.authenticate('local')(req,res, () => {
            res.redirect('/campgrounds')
        })
    })
})

//LOGIN LOGIC
app.get('/login',(req,res) => {
    res.render('login')
})
app.post('/login', passport.authenticate('local',
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login'
    }),(req,res) => {
    
})

//LOGOUT ROUTE
app.get('/logout', (req,res) => {
    req.logout()
    res.redirect('/campgrounds')
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

app.listen(PORT, IP, () => {
    console.log('Yelpcamp server has started.')
})