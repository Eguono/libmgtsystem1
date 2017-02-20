var book = require('../models/book');
var borrowedBooks = require('../models/borrowedBooks')


function bookController () {
    this.createBooks = function (newBook, callback) {        
                newBook.save(callback);
    };
    this.borrowBooks = function (borrow, callback ){
                borrow.save(callback);
    };

    this.getBookByBookname = function (bookName, callback) {
        var query = {"local.bookName": bookName};
        book.findOne(query, callback);
    };

    this.getBookById = function (bookId, callback) {
        book.findById(bookId, callback);
    };

     this.bookDelete = function (bookId, callback) {
       // var query = {"local.bookName": bookName}
        book.findOneAndRemove(bookId, callback);
    };
    this.returnBook = function (bookId, callback) {
       // var query = {"local.bookName": bookName}
        borrowedBooks.findOneAndRemove(bookId, callback);
    };
    this.getListOfBooks = function (callback) {
        book.find(callback);
    };
    this.getListOfBorrowedBooks = function (callback) {
        borrowedBooks.find(callback);
    };
    this.updatedBooks = function ( bookId, newBook, callback){
        // getListOfBooks(function(err, bookObject){
            console.log(newBook._id);
    book.findByIdAndUpdate({ _id: bookId },{ $set:
                    {
                            "local.copies": newBook.local.copies,
                            "local.yearOfPublication": newBook.local.yearOfPublication,
                            "local.author":newBook.local.author,
                            "local.bookDescription":newBook.local.bookDescription,
                            "local.bookName":newBook.local.bookName
                        }
                    }, callback);
        // })
      
        
    };

   /* this.borrowBook = function(bookId, newBook, callback){
        var  numberOfCopies = newBook.local.copies;
            book.findByIdAndUpdate({ _id: bookId },{ $set:
                    {

                        
                            "local.copies": function(numberOfCopies){
                                if (numberOfCopies > 0 ) 
                                {return numberOfCopies - 1;}
                            }
                    }
                }, callback);
    }*/
    
};

module.exports = bookController;
