'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var borrowedBooks = new Schema({
    local: {
        bookId: {
            type: String
        },
        bookName: {
            type:String
        },
        borrowerEmail: {
            type: String,
            index: true
        },
        dateBorrowed: {
            type: String
        },
        dueDate: {
            type: String
        },
        authorisedBy: {
            type: String
           
        },
        dateReturned:{
            type: String
        },
        copies: {
            type: String
        }
       
    }
    
    
});

module.exports = mongoose.model('borrowedBooks', borrowedBooks);
