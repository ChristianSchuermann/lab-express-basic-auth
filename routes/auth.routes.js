const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard');
saltRounds = 10;

router.get('/signup', isLoggedOut, (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', isLoggedOut, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.render('auth/signup', {
      errorMessage: 'Username and password are required',
    });
    return;
  }

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      console.log(hashedPassword);
      return User.create({
        username,
        email,
        passwordHash: hashedPassword,
      });
    })
    .then((currentUser) => {
      res.render("auth/profile", req.session.currentUser );
    })
    .catch((error) => console.log(error));
});

router.get('/login', isLoggedOut, (req, res, next) => res.render('auth/login'));

router.post('/login', isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.session);

  if (!username || !password) {
    res.render('auth/login', {
      errorMessage: 'Username and password are required',
    });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        res.render('auth/login', {
          errorMessage: 'Username not found',
        });
        return;
      } else if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.redirect('/profile');
      } else {
        res.render('auth/login', {
          errorMessage: 'Incorrect password',
        });
      }
    })
    .catch((err) => next(err));
});

router.get('/profile', isLoggedIn, (req, res) =>
  res.render('auth/profile', req.session.currentUser)
);

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect('/');
  });
});

router.get('/main', isLoggedIn, (req, res) =>
  res.render('auth/main', req.session.currentUser )
);

router.get('/private', isLoggedIn, (req, res) =>
  res.render('auth/private', req.session.currentUser )
);


module.exports = router;