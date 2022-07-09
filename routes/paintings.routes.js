process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0
// starter code in both routes/paintings.routes.js and routes/users.routes.js
const router = require("express").Router();

// require the Painting model

const Painting = require ('../models/Painting.model')

const User = require ('../models/User.model')

//require cloudinary

const fileUploader = require('../config/cloudinary.config');

const { isLoggedIn, isLoggedOut, isAdmirer } = require('../middleware/route-guard.js');

// 1. List all paintings / Read

// GET route to retrieve and display all the paintings

router.get('/paintings', (req, res, next) => {
    Painting.find()
    .populate("author")
    .then((allPaintingsFromDB) => {
        // console.log(allPaintingsFromDB)
        res.render('paintings/paintings.hbs', {paintings : allPaintingsFromDB})
    })
    .catch(err=>next(err))
})


// 2. Add new paintings / Create

// GET route to display the form

router.get('/paintings/create', isLoggedIn, (req, res) => {
  User.find()
  .then((dbUsers) => {
    res.render('paintings/new-painting.hbs', {dbUsers})
  })
  .catch((err) => console.log(`Err while displaying painting input page: ${err}`));
});

// POST route to save a new painting to the database in the paintings collection

router.post('/paintings/create', isLoggedIn, fileUploader.single('painting-image'), (req, res, next) => {
     //console.log(req.body);
    const { title, author, size, year, description, starting_bid } = req.body;

    if(!title || !year || !req.file) {
        res.render('paintings/new-painting.hbs', {errorMessage : "Please provide title, author, year and the painting image."});
    }
   //console.log(req.session.currentUser)
    Painting.create({ title, author: req.session.currentUser.id, size, year, description, starting_bid, imageUrl: req.file.path })
     
      .then((newlyCreatedPaintingFromDB) => {
        // Painting.findByIdAndUpdate(newlyCreatedPaintingFromDB.id, {author: req.session.currentUser.id })
        // res.redirect('/userProfile')
          return User.findByIdAndUpdate(author, { $push: { paintings: newlyCreatedPaintingFromDB._id } });
      })
     // .then(() => res.redirect('/userProfile'))
      .catch(err => {
        console.log(`ERROR creating Painting: ${err}`);
        res.redirect("/paintings/create");
        });
  });


  // 3. Updating paintings details / Update 

  //Get route to display and pre-fill the form

  router.get("/paintings/:id/edit", async (req, res, next) => {
    const { id } = req.params;
    try {
        const painting = await Painting.findById(id);
        res.render("paintings/update-painting", { painting });
      } catch (err) {
        console.log(`Error while getting a painting for edit: ${err}`);
        next(err);
      }
  })

  router.post('/paintings/:id/edit', fileUploader.single('painting-image'), (req, res, next) => {
    const { id } = req.params;
    const { title, author, size, year, description, starting_bid, existingImage } = req.body;

    let imageUrl;

    if(req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = existingImage;
    }
   
    Painting.findByIdAndUpdate(id, { title, author, size, year, description, starting_bid, imageUrl}, { new: true })
      .then(updatedPainting => res.redirect(`/paintings/${updatedPainting._id}`)) // go to the details page to see the updates
      .catch(error => {
        console.log(`Error while updating a painting: ${err}`);
        next(error);
        });
    });


  // 4. Delete a painting

  router.post("/paintings/:id/delete", (req, res, next) => {
    const { id } = req.params;
    Painting.findByIdAndRemove(id)
      .then(() => {
        res.redirect("/paintings");
      })
      .catch((err) => {
        console.log(`Error while deleting a painting: ${err}`);
        next(error);
      });
  });

  // 5. Each painting details page / Read

// GET route to retrieve and display details of a specific painting

router.get("/paintings/:id", (req, res, next) => {
    const { id } = req.params;
    Painting.findById(id)
      .populate('author')
      .then((painting) => {
        res.render("paintings/painting-details", { painting });
      })
      .catch((err) => {
        console.log(`Error while displaying painting details: ${err}`);
        next(error);
      });
  });

  module.exports = router;
