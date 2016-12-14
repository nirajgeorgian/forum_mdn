var router = require('express').Router();
var User = require('../models/user');
var Category = require('../models/category');
var Product = require('../models/products');
var Question = require('../models/questions');


router.post('/search', function(req,res,next) {
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req,res,next) {
  if(req.query.q) {
    res.json(res.query.q);
    // //this is working
    // Product.search({
    //   query_string: {
    //     query: req.query.q
    //   }
    // }, function(err, results) {
    //   if (err) return next(err);
    //   console.log(results);
    //   var data = results.hits.hits.map(function(hit) {
    //     console.log(hit);
    //     return hit;
    //   });
    //   res.render('main/search-result', {
    //     query: req.query.q,
    //     data: data
    //   });
    // });
  }
});

router.use((req,res, next) => {
  console.log(req.method, req.url);
  next();
});

router.get('/', (req,res) => {
  if(req.user) {
    return res.redirect('/questions');
  }
  res.render('main/home', {
    message: req.flash('success')
  });
});

router.get('/aruhi', (req,res) => {
  res.render('main/aruhi');
});


router.get('/about', (req,res) => {
  res.render('main/about');
});

// router.get('/products/:id', function(req, res, next) {
//   Product
//   .find({category: req.params.id})
//   .populate('category')
//   .exec(function(err, products) {
//     if (err) return next(err);
//     res.render('main/category', {
//       products: products
//     });
//   });
// });
//
// router.get('/product/:id', function(req,res,next) {
//   Product.findById({_id: req.params.id}, function(err, product) {
//     if (err) return next(err);
//     res.render('main/product', {
//       product: product
//     });
//   })
// })

router.get('/user/:para', function(req,res,next) {
  User.findOne({_id: req.user._id}, function(err, user) {
    if (err) return next(err);
    res.render('accounts/profile', {
      user: user,
      success: req.flash('success')
      });
    });
  });




module.exports = router;
