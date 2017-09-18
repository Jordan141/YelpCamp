const express = require('express')
const router = express.Router({mergeParams: true})
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const {isLoggedIn, checkCommentOwnership} = require('../middleware')


router.get('/new',isLoggedIn, (req,res) => {
    Campground.findById(req.params.id, (err, cg) => {
        if(err){
            console.log(err)
        }else{
            res.render('comments/new', {campground: cg})
        }
    })
})
//CREATE COMMENT
router.post('/', (req,res) => {
    //lookup cg via id
    Campground.findById(req.params.id, (err, cg) => {
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }else{
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    req.flash('error', 'Oops! Something went wrong, please contact your web admin')
                    console.log(err)
                }else{
                    comment.author.id = req.user._id
                    comment.author.username = req.user.username
                    comment.save()
                    cg.comments.push(comment)
                    cg.save()
                    res.redirect(`/campgrounds/${cg._id}`)
                }
            })
        }
    })
})
//COMMENTS - EDIT ROUTE
router.get('/:comment_id/edit', checkCommentOwnership, (req,res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if(err){
            console.log(err)
            res.redirect('back')
        } else {
            res.render('comments/edit', {campground_id: req.params.id, comment})
        }
    })
})
//COMMENT UPDATE ROUTE
router.put('/:comment_id', checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err){
            console.log(err)
            res.redirect('back')
        }else {
            res.redirect(`/campgrounds/${req.params.id}`)
        }
    })
})

//COMMENT DELETE ROUTE
router.delete('/:comment_id', checkCommentOwnership, (req,res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if(err){
            console.log(err)
            res.redirect('back')
        } else {
            req.flash('success', 'Comment deleted')
            res.redirect(`/campgrounds/${req.params.id}`)
        }
    })
})

module.exports = router