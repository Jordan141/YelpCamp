const express =     require('express'),
      app =         express(),
      PORT =        process.env.PORT,
      IP =          process.env.IP,
      bodyParser =  require('body-parser'),
      mongoose =    require('mongoose'),
      flash =       require('connect-flash'),
      passport =    require('passport'),
      passportLocalMongoose = require('passport-local-mongoose'),
      LocalStrategy = require('passport-local'),
      methodOverride = require('method-override'),
      Campground =  require('./models/campground'),
      Comment =     require('./models/comment'),
      User =        require('./models/user'),
      seedDB =      require("./seeds")

const commentRoutes =       require('./routes/comments'),
      campgroundRoutes =    require('./routes/campgrounds'),
      authRoutes =          require('./routes/index')

mongoose.connect('mongodb://localhost/yelp_camp')
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
//seedDB() //seed the db

//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret:'denmarkisbetterthanswedenandfinland',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(flash())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Checks if user is currently logged in or not and provides current user
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next()
    }
)

app.use('/', authRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)

app.listen(PORT, IP, () => {
    console.log('Yelpcamp server has started.')
})