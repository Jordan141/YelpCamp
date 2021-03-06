const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const Campground = require('../models/campground')
const {isLoggedIn, checkCommentOwnership} = require('../middleware')

router.get('/', (req, res) => {
    res.render("landing")
})

router.get('/register', (req, res) => {
    res.render('register', {page: 'register'})
})

router.post('/register', (req, res) => {
    
    let newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName : req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar,
        bio: req.body.bio
    })

    if(req.body.adminCode === 'secretsecretcode123'){//CHANGE THIS IN PRODUCTION{
        newUser.isAdmin = true
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash('error', err.message)
            return res.render('register')
        }
        passport.authenticate('local', {
            successRedirect: '/campgrounds',
            failureRedirect: '/login'}), (req,res, () => {
                req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username)
            }
        )
    })
})


router.get('/login', (req, res) => {
    res.render('login', {page: 'login'})
})
router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }
))

router.get('/logout', (req, res) => {
    req.logout()
    req.flash("success", "See you later!");
    res.redirect('/campgrounds')
})

//User profiles route
router.get('/users/:id', isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            req.flash('error', 'Oops! Something went wrong!')
            res.redirect('/')
        }
        Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
            if(err){
                req.flash('error', 'Oops! Something went wrong!')
                res.redirect('/')
            }
            res.render('users/show', {user: foundUser, campgrounds})
        })
    })
})

//user - EDIT ROUTE
router.get("/users/:id/edit", isLoggedIn, (req, res) => {
     User.findById(req.params.id, (err, foundUser) => { 
        if(err){
          res.redirect("back")
        } else {
        res.render("users/edit", {user: foundUser})
        }
     })
})

//Update ROUTE
router.put("/users/:id", isLoggedIn, (req, res) => {
    const newData = {firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, avatar: req.body.avatar, bio: req.body.bio};
    User.findByIdAndUpdate(req.params.id, {$set: newData}, (err, user) => {
        if(err){
             res.redirect("back")
        } else {
            req.flash("success","Profile Updated!")
            res.redirect("/users/" + user._id)
    }
  })
})


module.exports = router