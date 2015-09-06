let mongoose = require('mongoose');

let BlogSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },    
    postId: {
        type: String,
        required: true
    },
    created: {
        type: Date
    }
});

module.exports = mongoose.model('Blog', BlogSchema);