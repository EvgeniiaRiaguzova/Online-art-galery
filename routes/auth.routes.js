const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/User.model');
const mongoose = require('mongoose');
const { isLoggedIn, isLoggedOut, isAdmirer } = require('../middleware/route-guard.js');
const fileUploader = require('../config/cloudinary.config'); 

//////////// S I G N U P ///////////

// GET route ==> to display the signup form to users
router.get('/signup', isLoggedOut, (req, res) => res.render('auth/signup'));
// POST route ==> to process form data
router.post('/signup',[isLoggedOut, fileUploader.single('userAvatar')] , (req, res, next) => {
   console.log(req.file);
  const { username, email, password, status, description} = req.body;
    if (!username || !email || status =="" || !password) {
        res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email, status and password.' });
        return;
      }
      const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      if (!regex.test(password)) {
        res
          .status(500)
          .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
        return;
      }

  bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
        return User.create({
            username,
            email,
            // passwordHash => this is the key from the User model
            //     ^
            //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
            password: hashedPassword,
            status,
           imageUrl: req.file.path,
            description
          });
        })
        .then(userFromDB => {
          console.log('Newly created user is: ', userFromDB);
          res.redirect('/login');
        })
        .catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
              res.status(500).render('auth/signup', { errorMessage: error.message });
            } else if (error.code === 11000) {
              res.status(500).render('auth/signup', {
                 errorMessage: 'Username and email need to be unique. Either username or email is already used.'
              });
            } else {
              next(error);
            }
          }) // close .catch()
      }) 

//////////// L O G I N ///////////
 
// GET route ==> to display the login form to users
router.get('/login', isLoggedOut, (req, res) => res.render('auth/login'));

// POST login route ==> to process form data
router.post('/login', isLoggedOut, (req, res, next) => {
  //console.log('SESSION =====> ', req.session);
   
  const { email, password } = req.body;
   
    if (email === '' || password === '') {
      res.render('auth/login', {
        errorMessage: 'Please enter both, email and password to login.'
      });
      return;
    }
   
    User.findOne({ email })
      .then(user => {
        if (!user) {
          res.render('auth/login', { errorMessage: 'Email is not registered. Try with other email.' });
          return;
        } else if (bcryptjs.compareSync(password, user.password)) {
          req.session.currentUser = user; //******* SAVE THE USER IN THE SESSION ********//
          res.redirect('userProfile');
        } else {
          res.render('auth/login', { errorMessage: 'Incorrect password.' });
        }
      })
      .catch(error => next(error));
  });

  //////////// U S E R  P R O F I L E ///////////

  router.get('/userProfile', [isLoggedIn, isAdmirer], (req, res) => {
    //console.log(req.session.currentUser)
    res.render('users/user-profile', { userInSession: req.session.currentUser });
  });

  //////////// L O G O U T ///////////

  router.post('/logout', isLoggedIn, (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.redirect('/');
    });
  });
module.exports = router;   