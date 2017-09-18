const Campground = require('../models/campground')
const Comment = require('../models/comment')
//all the middleware goes here
let middlewareObj = {}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err){
                req.flash('error', 'Campground not found')
                res.redirect('back')
            }else{
                if(foundCampground.author.id.equals(req.user._id)){
                    next()
                } else {
                    req.flash('error', 'You don\'t have permission to do that')
                    res.redirect('back')
                }
            }
        })   
    } else {
       res.redirect('back')
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, comment) => {
            if(err){
                res.redirect('back')
            }else{
                if(comment.author.id.equals(req.user._id)){
                    next()
                } else {
                    req.flash('error', 'You don\'t have permission to do that')
                    res.redirect('back')
                }
            }
        })   
    } else {
        req.flash('error', 'You need to be logged in to do that!')
       res.redirect('back')
    }
}

middlewareObj.isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next()
    }
    req.flash('error','You need to be logged in to do that')
    res.redirect('/login')
}

module.exports = middlewareObj