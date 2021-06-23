const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
    posts: [{
        text: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        x: Number,
        y: Number

    }],

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    editors: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    }]
});

const Board = mongoose.model('Board', BoardSchema);

module.exports = Board;
