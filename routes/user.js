var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConfig = require('../config/passport');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var async = require('async');

router.get('/login', (req,res) => {
  if (req.user) return res.redirect('/');
  res.render('accounts/login', {
    message: req.flash('success'),
    reset: req.flash('reset_password')
  });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  badRequestMessage: 'Missing username or password',
  passReqToCallback : true,
  failureFlash: true
}));

router.get('/profile', (req,res) => {
  User.findOne({_id: req.user._id}, function(err, user) {
    if (err) return next(err);
    res.render('accounts/profile', {
      user: user,
      success: req.flash('success')
      });
  });
});

router.get('/signup', (req,res, next) => {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req,res,next) {
  async.waterfall([
    function(done) {
      var user = new User();
      user.profile.name = req.body.username;
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.email = req.body.email;
      user.password = req.body.password
      user.topics = req.body.topics;
      user.website = req.body.website;
      user.about = req.body.about;
      user.profile.picture = user.gravatar();

      User.findOne({email: req.body.email}, function(err, email) {
        if(email) {
          console.log("error occured");
          return res.redirect('/signup');
        } else {
          user.save(function(err, user) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              if (err) return next(err);
              req.flash('success', 'Successfully signed up for ' + req.headers.host);
            })
          })
        }
        done(err, user);
      })
    },
    function(user, done) {
      var smtp = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: 'apikey', //username here,
          pass: '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'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nirajgeorgian01@gmail.com',
        subject: 'You have just signed up for' + req.headers.host,
        text: 'Hello,\n\n' +
          'You have just signed up for ' + req.headers.host + ' with email address as ' + user.email + ' \n' +
          'Please login at http://' + req.headers.host +'/login'
      };
      smtp.sendMail(mailOptions, function(err, info) {
        if(err) {
          return console.log(err);
        } else {
        //req.flash('success', "Successfully updated password");
        console.log(info.message);
      }
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/profile');
  });
});

router.get('/logout', function(req,res, next) {
  req.flash('success', 'successfully logged out');
  req.logout();
  res.redirect('/');
  next();
});

router.get('/edit-profile', function(req,res,next) {
  res.render('accounts/edit-profile', {message: req.flash('success')});
});

router.post('/edit-profile', function(req,res,next) {
  User.findOne({_id: req.user._id}, function(err, user) {
    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;
    if (req.body.firstname) user.firstname = req.body.firstname;
    if (req.body.lastname) user.lastname = req.body.lastname;
    if (req.body.about) user.about = req.body.about;
    if (req.body.address) user.address = req.body.address;
    if (req.body.place) user.place = req.body.place;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Successfully updated profile information');
      return res.redirect('/profile');
    });
  });
});

router.get('/forgot', function(req,res,next) {
  res.render('accounts/forgot_password', {
    user: req.user,
    message: req.flash('success'),
    errors: req.flash('error')
  });
});

router.post('/forgot', function(req,res,next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({email: req.body.email}, function(err, user) {
        if(!user) {
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user,done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: 'apikey', //username here,
          pass: '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'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nirajgeorgian01@gmail.com',
        subject: 'Reset Your password',
        text: 'Your reset password code is here\n'+
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              "Thank you - nirajgeorgian"
      };
      smtpTransport.sendMail(mailOptions, function(err, info) {
        if (err) {
          return console.log(err);
        } else {
          console.log(info.message);
          //req.flash('success', 'Successfully sended password reset token'); successfully sended password reset message to email
        }
        done(err, 'done');
        console.log('Message sent: ' + info.message);
      });
    }
  ], function(err) {
    if (err) return next(err);
    req.flash('reset_password', "Successfully sended reset email verification");
    res.redirect('/login');
  });
});

router.get('/reset/:token', function(req,res) {
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user) {
    if(!user) {
      req.flash('error', 'Password reset token is invalid or expired');
      return res.redirect('/forgot');
    }
    res.render('accounts/reset', {
      user: req.user,
      message: req.flash('error')
    });
  });
});

router.post('/reset/:token', function(req,res, next) {
  async.waterfall([
    function(done) {
      User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user) {
        if(!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save((err, user) => {
          if (err) return console.log("after save "+ err);;
          req.logIn(user, function(err) {
            req.flash('success', 'Successfully updated password');
            if (err) return console.log("after login " +err);;
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtp = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: 'apikey', //username here,
          pass: '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'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nirajgeorgian01@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtp.sendMail(mailOptions, function(err) {
        if(err) {
          return console.log(err);
        } else {
        //req.flash('success', "Successfully updated password");
      }
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

module.exports = router;
