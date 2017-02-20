'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var book = new Schema({
    local: {
        bookId: {
            type: String
        },
        bookName: {
            type: String,

        },
        imageUrl: {
            type: String
        },
        bookDescription: {
            type: String
        },
        addedBy: {
            type: String   
        },
        author:{
            type: String
        },
        yearOfPublication:{
            type: String
        },
        copies: {
            type: String
        }
    }
    
    
});

module.exports = mongoose.model('book', book);
