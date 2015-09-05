let mongoose = require('mongoose');

let PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    created: {
        type: Date
    },
    updated: {
        type: Date
    },
    userId: {
        type: String
    }
});

module.exports = mongoose.model('Post', PostSchema);
