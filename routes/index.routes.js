const router = require("express").Router();

const Painting = require ('../models/Painting.model')

/* GET home page */
router.get("/", (req, res, next) => {
  // res.render("index", paintings);
  Painting.find()
     .populate('author')
    .then((allPaintingsFromDB) => {
        //console.log(allPaintingsFromDB)
        res.render('index', {paintings : allPaintingsFromDB})
    })
    .catch(err=>next(err))
});

module.exports = router;
