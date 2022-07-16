const express = require('express');
const router = express.Router();
 
// **** require User model in order to use it ****
const User = require('../models/User.model');
 
// ********* require fileUploader in order to use it *********
const fileUploader = require('../config/cloudinary.config');

//////////// ARTISTS-LIST ///////////

router.get('/users-list', (req, res) => {
    User.find({status: "artist"})
      .then(usersFromDB => {
      //console.log(usersFromDB);
      res.render('users/users-list.hbs', {users: usersFromDB });
      })
      .catch(err => console.log(`Error while getting the users from the DB: ${err}`));
  });

  //////////// USERS UPDATE ///////////

  router.get('/users/:id/edit', (req, res) => {
    const { id } = req.params;
   
    User.findById(id)
      .then(userToEdit => res.render('users/user-edit', userToEdit))
      .catch(error => console.log(`Error while getting a single user for edit: ${error}`));
  });

  router.post('/users/:id/edit', fileUploader.single('userAvatar'), (req, res) => {
    const { id } = req.params;
    const { username, email, existingPassword, status, existingImage, description } = req.body;
   
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = existingImage;
    }

    let password;
    if (!password) {
      password = existingPassword;
    }
   
    User.findByIdAndUpdate(id, { username, email, password, status, imageUrl, description }, { new: true })
      .then((user) => {req.session.currentUser = user;
      res.redirect('/userProfile')})
      .catch(error => console.log(`Error while updating a single user: ${error}`));
  });  

  ////// ROUTE /users/:id/paintings

  router.get('/users/:id/paintings', (req, res) => {
    const { id } = req.params;

    User.findById(id)
    .populate('paintings')
    .then((user) => {
      res.render('users/user-paintings', {user})
    })
  });

    //////////// USERS DELETE ///////////

    router.post('/users/:id/delete', (req, res, next) => {
      
      const { id } = req.params;
      //console.log(id)
      User.findByIdAndRemove(id)
        .then((user) => {
          
          res.redirect('/signup')
          //return res.redirect('/logout');
        })
        .catch(error => next(error));
    });

 
module.exports = router;