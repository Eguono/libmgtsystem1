'use strict';

var path = process.cwd();
var userController = require(path + '/app/controllers/userController.server.js');
var User = require(path + '/app/models/users.js');
var bookController = require(path + '/app/controllers/bookController.server.js');
var book = require(path + '/app/models/book.js');
var fileupload = require('fileupload').createFileUpload(path + '/public/bookImages').middleware;
var borrowedBook = require(path + '/app/models/borrowedBooks.js')
var globalId
var globalId2
var bkObj;

module.exports = function (app, passport) {
	var userCtrl = new userController();
	var bookCtrl = new bookController();

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} 

		// otherwise redirect to login
		res.redirect('/login');
	}

	function isLoggedInAsAdmin (req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.local.isAdmin || req.user.google.isAdmin) {
	        	return next();
	    	}
	    }

    	// otherwise redirect to index
	    req.flash('error_msg', 'Unauthorised access');
	    res.redirect('/');
	}
	





	app.route('/')
		.get(function (req, res) {
			res.render('index', { title:'Readers Bay'});
		});

	app.route('/login')
		.get(function (req, res) {
			// res.sendFile(path + '/public/login.html');
			res.render('login', { title:'Account Login'});
		})
		.post(passport.authenticate('local',  {successRedirect: '/profile',
                                   failureRedirect: '/login',
                                   failureFlash: true }),
			function(req, res) {
			    // If this function gets called, authentication was successful.
			    // `req.user` contains the authenticated user.
			    req.flash('success_msg', 'You have been successfully logged in');
			    res.redirect('/profile');
			}
		);

	app.route('/register')
		.get(function (req, res) {
			res.render('register', { title:'Register'});
		})
		.post(function (req, res) {
			var name = req.body.name;
		    var username = req.body.username;
		    var email = req.body.email;
		    var password = req.body.password;

		    // Validation
		    req.checkBody('name', 'Name is required').notEmpty();
		    req.checkBody('email', 'Email is required').notEmpty();
		    req.checkBody('email', 'Email is not valid').isEmail();
		    req.checkBody('username', 'Username is required').notEmpty();
		    req.checkBody('password', 'Password is required').notEmpty();
		    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		    var errors = req.validationErrors();

		    if (errors) {
		        res.render('register', {
		            errors: errors
		        });
		    } else {
		        var newUser = new User();

		        newUser.local.name = name;
		        newUser.local.username = username;
		        newUser.local.email = email;
		        newUser.local.password = password;
		        newUser.local.isAdmin = false;

		        userCtrl.createUser(newUser, function (err) {
		            if (err) throw err;

		            req.flash('success_msg', 'You are registered and can now login');

		            res.redirect('/login');
		        });
		    }
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.render('profile', {title: 'User Profile', user: req.user });
		});

	app.route('/auth/google')
		.get(passport.authenticate('google', { scope : ['profile', 'email'] }));

	app.route('/auth/google/callback')
		.get(passport.authenticate('google', {
			successRedirect: '/profile',
			failureRedirect: '/login'
		}));

	app.route('/admin')
		.get(isLoggedInAsAdmin, function(req, res) {
			res.render('admin', { title: 'Dashboard' });
	});
	app.route('/book')
		.get(function (req, res) {
	res.render('book', { title:'book.js'});
    })
    .post(function (req, res) {
		    var bookName = req.body.bookName;
		    var imageUrl = req.body.imageUrl;
		    var bookDescription = req.body.bookDescription;
			var addedBy = req.body.addedBy;
			var author = req.body.author;
			var yearOfPublication = req.body.yearOfPublication;
			var copies = req.body.copies;
			/*var file = req.body.file;
			if (file !== null){
				form.on('error', function(err) {
             throw err;
             })

        this is where the renaming happens 
     .on ('fileBegin', function(file, fileupload){
             //rename the incoming file to the file's name
             fileupload.path = fileupload.uploadDir + fileupload.name;
      });
			}*/

		    // Validation
		    req.checkBody('bookName', 'bookName is required').notEmpty();
		   // req.checkBody('imageUrl', 'imageUrl is required').notEmpty();
		    req.checkBody('bookDescription', 'bookDescription is required').notEmpty();
		    req.checkBody('addedBy', 'addedBy is required').notEmpty();
			req.checkBody('author', 'author is required').notEmpty();
			req.checkBody('yearOfPublication', 'yearOfPublication is required').notEmpty();
			req.checkBody('copies', 'copies is required').notEmpty();
		   // req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		    var errors = req.validationErrors();

		    if (errors) {
		        res.render('book', {
		            errors: errors
		        });
		    } else {
		        var newBook = new book();

		        //newBook.local.bookId = bookId;
		        newBook.local.bookName = bookName;
				//newBook.local.imageUrl = imageUrl;
		        newBook.local.bookDescription = bookDescription;
		        newBook.local.addedBy = addedBy;
				newBook.local.author = author;
				newBook.local.yearOfPublication = yearOfPublication;
				newBook.local.copies = copies;
		        //newUser.local.isAdmin = false;
		        bookCtrl.createBooks(newBook, function (err) {
		            if (err) throw err;

		            req.flash('success_msg', 'You have successfully added a book');

		            res.redirect('/book');
		        });
		    }
			
		});

		app.route('/bookCatalog')
		.get(function (req, res) {
			bookCtrl.getListOfBooks(function(err, booklist){
				 if (err) throw err;
				 //console.log(booklist);
				 res.render('bookCatalog', { booklist : booklist});
			})
	
    })

	app.route('/bookUpdate')
		.get(function (req, res) {
			var id = req.query.id;
			
			//console.log(id)
			bookCtrl.getBookById(id, function(err, bookObject){
				 if (err) throw err;
				console.log(bookObject); 

				res.render('bookUpdate', { bookObject: bookObject});
			})
	
       })
	   .post(function (req, res) {
		    var bookId = req.query.Id;
		    var bookName = req.body.bookName;
		    var bookDescription = req.body.bookDescription;
			var author = req.body.author;
			var yearOfPublication = req.body.yearOfPublication;
			var copies = req.body.copies;
			/*var file = req.body.file;
			if (file !== null){
				form.on('error', function(err) {
             throw err;
             })

        this is where the renaming happens 
     .on ('fileBegin', function(file, fileupload){
             //rename the incoming file to the file's name
             fileupload.path = fileupload.uploadDir + fileupload.name;
      });
			}*/

		    // Validation
		    req.checkBody('bookName', 'bookName is required').notEmpty();
		   // req.checkBody('imageUrl', 'imageUrl is required').notEmpty();
		    req.checkBody('bookDescription', 'bookDescription is required').notEmpty();
		    //req.checkBody('addedBy', 'addedBy is required').notEmpty();
			req.checkBody('author', 'author is required').notEmpty();
			req.checkBody('yearOfPublication', 'yearOfPublication is required').notEmpty();
			req.checkBody('copies', 'copies is required').notEmpty();
		   // req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		    var errors = req.validationErrors();

		    if (errors) {
		        res.render('bookUpdate', {
		            errors: errors
		        });
		    } else {
		        var updatedBook = new book();

		        //newBook.local.bookId = bookId;
		        updatedBook.local.bookName = bookName;
				updatedBook.local.bookId = bookId;
				//newBook.local.imageUrl = imageUrl;
		        updatedBook.local.bookDescription = bookDescription;
		        //updatedBook.local.addedBy = addedBy;
				updatedBook.local.author = author;
				updatedBook.local.yearOfPublication = yearOfPublication;
				updatedBook.local.copies = copies;
		        //newUser.local.isAdmin = false;

				console.log("Before update ", updatedBook.local.bookId);

			
		       bookCtrl.updatedBooks(bookId, updatedBook, function (err, book) {
				
		            if (err) throw err;

					console.log("updated ", book);

		            req.flash('success_msg', 'You have successfully editted a book information');

		            res.redirect('/bookCatalog');
		        });
		    }
			
		});

		app.route('/bookDelete')
		.get(function (req, res) {
			var id = req.params.id;
			//console.log(id)
			bookCtrl.bookDelete(id, function(err, bookObject){
				 if (err) throw err; 

				 req.flash('success_msg', 'You have successfully deleted a book information');

		            res.redirect('/bookCatalog');
			});
	
       });
	   
	   app.route('/bookBorrowed')
		.get(function (req, res) {
			var id = req.param('id');
			globalId = id
			//console.log(id)
			bookCtrl.getBookById(id, function(err, bookObject){
				 if (err) throw err; 
				bkObj=bookObject;
	res.render('bookBorrowed', { bookObject: bookObject });
    })
		})
    .post(function (req, res) {
		    var id = req.param('id');
			var bookName = req.body.bookName;
		    var borrowerEmail = req.body.borrowerEmail;
		    var dateBorrowed = req.body.dateBorrowed;
		    var dueDate = req.body.dueDate;
			var dateReturned = req.body.dateReturned;
			var authorisedBy = req.body.authorisedBy;
			/*var file = req.body.file;
			if (file !== null){
				form.on('error', function(err) {
             throw err;
             })

        this is where the renaming happens 
     .on ('fileBegin', function(file, fileupload){
             //rename the incoming file to the file's name
             fileupload.path = fileupload.uploadDir + fileupload.name;
      });
			}*/

		    // Validation
		    req.checkBody('borrowerEmail', 'borrowerEmail is required').isEmail();
		    req.checkBody('bookName', 'bookName is required').notEmpty();
		    req.checkBody('dateBorrowed', 'dateBorrowed is required').notEmpty();
		    req.checkBody('dueDate', 'dueDate is required').notEmpty();
			//req.checkBody('dateReturned', 'dateReturned is required').notEmpty();
			req.checkBody('authorisedBy', 'authorisedBy is required').notEmpty();
			
		   // req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		    var errors = req.validationErrors();

		    if (errors) {
				 req.flash('error_msg', 'There was an error please fill in all details');


	res.render('bookBorrowed', { bookObject: bkObj });

		    } else {
		        var recentBorrow = new borrowedBook();

		        recentBorrow.local.bookId = id;
				recentBorrow.local.bookName = bookName;
		        recentBorrow.local.borrowerEmail = borrowerEmail;
				//newBook.local.imageUrl = imageUrl;
		        recentBorrow.local.dateBorrowed = dateBorrowed;
		        recentBorrow.local.dueDate = dueDate;
				recentBorrow.local.dateReturned = dateReturned;
				recentBorrow.local.authorisedBy = authorisedBy;
		        //newUser.local.isAdmin = false;
		        bookCtrl.borrowBooks(recentBorrow, function (err) {
		            if (err) throw err;

		            req.flash('success_msg', 'You have successfully borrowed a book');
					
				
					res.redirect('/bookRedir');
				});
			}

		   });

     app.route('/borrowedBookCatalog')
		.get(function (req, res) {
			bookCtrl.getListOfBorrowedBooks(function(err, booklist){
				 if (err) throw err;
				 //console.log(booklist);
				 res.render('borrowedBookCatalog', { booklist : booklist});
			})
	
     })
	 	app.route('/bookReturned')
		.get(function (req, res) {
			var id = req.params.id;
			globalId2 = id;
			//console.log(id)
			bookCtrl.returnBook(id, function(err, bookObject){
				 if (err) throw err; 

				 req.flash('success_msg', 'You have successfully returned a book');

		            res.redirect('/borrowedBookCatalog');
			});
	
       });

//=============



		  app.route('/bookRedir')
			  .get(function (req, res) {
				  var bookId = globalId;
				  bookCtrl.getBookById(bookId, function (err, bookObject) {

					  bookObject.local.copies = Number(bookObject.local.copies - 1)


					  //=============================

					  bookCtrl.updatedBooks(bookId, bookObject, function (err, book) {

						  // if (err) throw err;

						  // console.log("updated ", book);

						  // req.flash('success_msg', 'You have successfully editted a book information');

						  res.redirect('/bookCatalog');
					  });

					  //=============================				
				  })

			  })
//========

		 /* app.route('/bookRedir2')
			  .get(function (req, res) {
				  var bookId = globalId2;
				  bookCtrl.getBookById(bookId, function (err, bookObject) {

					  bookObject.local.copies = Number(bookObject.local.copies + 1)


					  //=============================

					  bookCtrl.updatedBooks(bookId, bookObject, function (err, book) {

						  // if (err) throw err;

						  // console.log("updated ", book);

						  // req.flash('success_msg', 'You have successfully editted a book information');

						  res.redirect('/borrowedBookCatalog');
					  });

					  //=============================				
				  })

			  })*/




};
/*
var  bookObject = new book();
bookCtrl.getBookById(req.param('id'), function(err, bookObject){
					if(bookObject ==null){
						 req.flash('error_msg', 'its null');
					}
				//var copies = bookObject.local.copies
				//bookObject.local.copies = copies - 1

					

					})


bookCtrl.updatedBooks(req.param('id'), bookObject, function (err, book) {

						if (err) throw err;
						
					}); */




	
		  