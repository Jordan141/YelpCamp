const mongoose = require('mongoose'),
      Campground = require('./models/campground'),
      Comment = require('./models/comment')

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tempus urna elit, eu efficitur justo placerat et. Cras vitae erat id mi semper volutpat. Suspendisse at dapibus nisi. Vivamus tortor diam, elementum eu nulla vitae, finibus semper leo. Aliquam augue magna, tincidunt elementum nulla commodo, vulputate dignissim massa. Vivamus quis pharetra nunc. Sed quis nibh id tortor faucibus tempus quis id turpis. '

const data = [
    {
        name: 'Cloud\'s Rest',
        image: 'https://farm8.staticflickr.com/7252/7626464792_3e68c2a6a5.jpg',
        description: lorem
    },
    {
        name: 'Mountain Creek',
        image: 'https://farm6.staticflickr.com/5181/5641024448_04fefbb64d.jpg',
        description: lorem
    },
    {
        name: 'Granite Hill',
        image: 'https://farm5.staticflickr.com/4137/4812576807_8ba9255f38.jpg',
        description: lorem
    },
    {
        name: 'Eagle Rock',
        image: 'https://farm5.staticflickr.com/4153/4835814837_feef6f969b.jpg',
        description: lorem
    },
    {
        name: 'Steele Valley',
        image: 'https://farm4.staticflickr.com/3270/2617191414_c5d8a25a94.jpg',
        description: lorem
    }
]
function seedDB (){
    Campground.remove({}, err => {
        if(err) console.log(err)
        console.log('Removed campgrounds!')
        
        data.forEach(seed => Campground.create(seed, (err, campground) => {
            if(err) console.log(err)
            console.log('Added a campground')
            //create a comment
            Comment.create(
                {
                    text: 'This place is great, but I wish there was internet!',
                    author: 'Homer'
                },
                (err, comment) => {
                    if(err){
                        console.log(err)
                    }
                    else
                    {
                    campground.comments.push(comment)
                    campground.save()
                    console.log('Created new comment')
                    }
                })
        }))
    })
}

module.exports = seedDB;