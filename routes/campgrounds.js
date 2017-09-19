const express = require('express')
let router = express.Router()
const Campground = require('../models/campground')
let {isLoggedIn, checkCampgroundOwnership} = require('../middleware')

//INDEX ROUTE -- Show all campgrounds
router.get('/', (req, res) => {
    Campground.find({}, (err, campgrounds) => {
        res.render('campgrounds/index', {campgrounds, currentUser: req.user})
    })
})

//CREATE ROUTE
router.post('/', isLoggedIn, (req,res) => {
    const {name, price, image, description}  = req.body;
    const author = {id: req.user._id, username: req.user.username}
    //Create a new cg and save to DB
    Campground.create({name, price, image, description, author}, err => {
        if(err){
            return err
        }
        res.redirect('/campgrounds')
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
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, err => {
        if(err){
            return err
        }
        res.redirect('/campgrounds/' + req.params.id)
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