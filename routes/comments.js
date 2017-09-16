const express = require('express')
const router = express.Router({mergeParams: true})
const Campground = require('../models/campground')
const Comment = require('../models/comment')

router.get('/new',isLoggedIn, (req,res) => {
    //Find campground by id
    Campground.findById(req.params.id, (err, cg) => {
        if(err){
            console.log(err)
        }else{
            res.render('comments/new', {campground: cg})
        }
    })
})

router.post('/', (req,res) => {
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
                    comment.author.id = req.user._id
                    comment.author.username = req.user.username
                    console.log(req.user)
                    comment.save()
                    cg.comments.push(comment)
                    cg.save()
                    console.log(comment)
                    res.redirect(`/campgrounds/${cg._id}`)
                }
            })
        }
    })
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

module.exports = router