process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0
// starter code in both routes/paintings.routes.js and routes/users.routes.js
const router = require("express").Router();

// require the Painting model

const Painting = require ('../models/Painting.model')
const User = require('../models/User.model')

//require cloudinary

const fileUploader = require('../config/cloudinary.config');

// 1. List all paintings / Read

// GET route to retrieve and display all the paintings

router.get('/paintings', (req, res, next) => {
    Painting.find()
    .then((allPaintingsFromDB) => {
        // console.log(allPaintingsFromDB)
        res.render('paintings/paintings.hbs', {paintings : allPaintingsFromDB})
    })
    .catch(err=>next(err))
})


// 2. Add new paintings / Create

// GET route to display the form

router.get('/paintings/create', (req, res) => res.render('paintings/new-painting.hbs'));

// POST route to save a new painting to the database in the paintings collection

router.post('/paintings/create', fileUploader.single('painting-image'), (req, res, next) => {
    // console.log(req.body);
    const { title , size, year, description, starting_bid } = req.body;

    if(!title || !year || !req.file) {
        res.render('paintings/new-painting.hbs', {errorMessage : "Please provide the title, the author, the year and the painting."});
    }
    console.log(req.session)
    Painting.create({ title, author: req.session.currentUser.id , size, year, description, starting_bid, imageUrl: req.file.path })
      // .then(paintingFromDB => console.log(`New painting created: ${paintingFromDB.title}.`))
      .then((newlyCreatedPaintingFromDB ) => {
            // find the user that has the id req.session.currentUser frim the db and populate with the paintings
      User.findById(req.session.currentUser.id)
        .populate("paintings")
        .then (()=> res.redirect('users/user-profile'))
      return User.findByIdAndUpdate()
      })
      .catch(err => {
        console.log(`ERROR creating Painting: ${err}`);
        res.redirect("/paintings/create");
        });
  });


  // 3. Updating paintings details / Update 

  //Get route to display the form

  router.get("/paintings/:id/edit", async (req, res, next) => {
    const { id } = req.params;
    try {
        const painting = await Painting.findById(id);
        res.render("paintings/edit-painting", { painting });
      } catch (err) {
        return next(err);
      }
  })

  router.post('/paintings/:id/edit', (req, res, next) => {
    const { id } = req.params;
    const { title, author, size, year, description, starting_bid } = req.body;
   
    Painting.findByIdAndUpdate(id, { title, author, size, year, description, starting_bid }, { new: true })
       
      .then(updatedPainting => res.redirect(`/paintings/${updatedPainting._id}`)) // go to the details page to see the updates
      .catch(error => {
        return next(error)
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
        return next(err);
      });
  });

  // 5. Each painting details page / Read

// GET route to retrieve and display details of a specific painting

router.get("/paintings/:id", (req, res, next) => {
    const { id } = req.params;
    Painting.findById(id)
      .then((painting) => {
        res.render("paintings/painting-details", { painting });
      })
      .catch((err) => {
        return next(err);
      });
  });

  module.exports = router;
