const express = require('express')
let router = express.Router()
const Campground = require('../models/campground')
let {isLoggedIn, checkCampgroundOwnership} = require('../middleware')
const geocoder = require('geocoder')

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//INDEX ROUTE -- Show all campgrounds
router.get('/', (req, res) => {
    if(req.query.search && req.xhr) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
              console.log(err);
           } else {
              res.status(200).json(allCampgrounds);
           }
        })
    } else {
        Campground.find({}, (err, campgrounds) => {
            res.render('campgrounds/index', {campgrounds, currentUser: req.user, page: 'campgrounds'})
        })
    }
})

//CREATE ROUTE
router.post('/', isLoggedIn, (req,res) => {
    const {name, cost, image, description}  = req.body;
    const author = {id: req.user._id, username: req.user.username}

    geocoder.geocode(req.body.location, (err, data) => {
        let {lat, lng} = data.results[0].geometry.location
        let location = data.results[0].formatted_address

        Campground.create({name, image, cost, description, author, location, lat, lng}, err => {
            if(err){
                throw err;
            }
            res.redirect('/campgrounds')
        })
    })
})

//NEW - Show form to create new campground
router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new.ejs')
})

//SHOW - Shows more info about one campground
router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err, campground) => {
        if(err){
            return err
        }
        res.render("campgrounds/show", {campground});
    })
})

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', checkCampgroundOwnership, (req,res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            return err
        }
        res.render('campgrounds/edit', {campground})
    })
})
//UPDATE CAMPGROUND ROUTE
router.put('/:id', checkCampgroundOwnership, (req,res) => {

    geocoder.geocode(req.body.location, (err, data) => {
        let {lat, lng} = data.results[0].geometry.location
        let location = data.results[0].formatted_address
        let newData = {...req.body.campground, location, lat, lng}
        Campground.findByIdAndUpdate(req.params.id, {$set: newData} , err => {
            if(err){
                throw err
            }
            req.flash("success","Successfully Updated!")
            res.redirect('/campgrounds/' + req.params.id)
        })
    })
})

//DESTROY CAMPGROUND ROUTE
router.delete('/:id',checkCampgroundOwnership, (req,res) => {
    Campground.findByIdAndRemove(req.params.id, err => {
        if(err){
            return err
        }
        res.redirect('/campgrounds')
    })
})

module.exports = router