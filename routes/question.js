var router = require('express').Router();
var Category = require('../models/category');
var Product = require('../models/products');
var Question = require('../models/questions');

router.get('/question', function(req, res) {
  if(!req.user) return res.redirect('/login');
  res.render('questions/question', {
    message: req.flash('success')
  })
});

router.post('/question', function(req, res, next) {
  if(!req.user) return res.redirect('/login');
  var ques = new Question();
  ques.question = req.body.question;
  ques.topics = req.body.topics;

  ques.save(function(err) {
    if (err) return next(err);
    req.flash('success','Successfully added your question');
    return res.redirect('/question');
  })
});

router.get('/questions', function(req, res, next){
  Question.find(function(err, ques) {
    if(err) return next(err);
    res.render('questions/questions', {
      question: ques });
  });
});


module.exports = router;
