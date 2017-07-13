var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

var async = require('async');

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_list', { title: 'BookInstance List', bookinstance_list: list_bookinstances });
    });
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_detail', { title: 'BookInstance:', bookinstance: bookinstance });
    });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
  Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
    });
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = function(req, res, next) {
  req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
  
  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();   
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();
  
  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint, 
    status: req.body.status,
    due_back: req.body.due_back
  });

  var errors = req.validationErrors();
  if (errors) {
      
    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, errors: errors, bookinstance:bookinstance, book_list : books });
    });
    return;
  } 
  else {
  // Data from form is valid
  
    bookinstance.save(function (err) {
      if (err) { return next(err); }
      //successful - redirect to new book-instance record.
      res.redirect(bookinstance.url);
    }); 
  }
};

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance: bookinstance });
    });
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, next) {
  req.checkBody('instanceid', 'Instance id must exist').notEmpty();

  BookInstance.findByIdAndRemove(req.body.instanceid, function deleteInstance(err) {
    if (err) { return next(err); }
    res.redirect('/catalog/bookinstances');
  });
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res) {
  async.parallel({
    bookinstance: callback => {
      BookInstance.findById(req.params.id)
        .populate('book')
        .exec(callback);
    },
    books: callback => {
      Book.find({},'title')
        .exec(callback);
    },
  }, (err, rs) => {
    if (err) return next(err);
    rs.bookinstance.book = rs.bookinstance.book._id;
    res.render('bookinstance_form', { title: 'Update BookInstance', bookinstance: rs.bookinstance, book_list: rs.books });
  });
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res) {
  //Sanitize id passed in. 
  req.sanitize('id').escape();
  req.sanitize('id').trim();
  
  req.checkBody('book', 'Book must be specified').notEmpty();
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
  
  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();   
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();
  
  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint, 
    status: req.body.status,
    due_back: req.body.due_back,
    _id:req.params.id //This is required, or a new ID will be assigned!
  });

  var errors = req.validationErrors();
  if (errors) {
    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      res.render('bookinstance_form', { title: 'Update BookInstance', book_list : books, errors: errors, bookinstance:bookinstance, book_list : books });
    });
    return;
  } 
  else {
    BookInstance.findByIdAndUpdate(req.params.id, bookinstance, (err) => {
      if (err) return next(err);
      res.redirect(bookinstance.url);
    }); 
  }
};