const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')

//INDEX ROUTE -- Show all campgrounds
router.get('/', (req, res) => {
    console.log(req.user)
    //res.render('campgrounds', {campgrounds: campgrounds})
    //Get all campgrounds from db, then render
    Campground.find({}, (err, campgrounds) => {
        if(err) console.log(err)
        else{
            res.render('campgrounds/index', {campgrounds, currentUser: req.user})
        }
    })
})

//CREATE ROUTE
router.post('/',isLoggedIn, (req,res) => {
    const {name, image, description}  = req.body;
    const author = {id: req.user._id, username: req.user.username}
    //Create a new cg and save to DB
    Campground.create({name, image, description, author}, (err,data) => {
        if(err) {
            console.log(err)
        }else{
            console.log('New CG:', data)
           res.redirect('/campgrounds')
        }
    })
})

//NEW - Show form to create new campground
router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new.ejs')
})

//SHOW - Shows more info about one cg
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            console.log("Error returning the campground");
        } else {
            console.log(campground);
            res.render("campgrounds/show", {campground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', (req,res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err){
            res.redirect('/campgrounds')
        }else{
            res.render('campgrounds/edit', {campground: foundCampground})
        }
    })
})
//UPDATE CAMPGROUND ROUTE
router.put('/:id', (req,res) => {
    //Find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err){
            res.redirect('/campgrounds')
        } else {
            res.redirect('/campgrounds/' + req.params.id)
        }
    })
    //redirect somewhere
})

//DESTROY CAMPGROUND ROUTE
router.delete('/:id', (req,res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => res.redirect('/campgrounds'));
})


//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

module.exports = router