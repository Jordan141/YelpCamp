const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')

//INDEX ROUTE -- Show all campgrounds
router.get('/', (req, res) => {
    console.log(req.user)
    //res.render('campgrounds', {campgrounds: campgrounds})
    //Get all campgrounds from db, then render
    Campground.find({}, (err, data) => {
        if(err) console.log(err)
        else{
            res.render('campgrounds/index', {campgrounds: data, currentUser: req.user})
        }
    })
})

router.post('/',(req,res) => {
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
router.get('/new', (req,res) => {
    res.render('campgrounds/new.ejs')
})

//SHOW - Shows more info about one cg
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log("Error returning the campground");
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

module.exports = router