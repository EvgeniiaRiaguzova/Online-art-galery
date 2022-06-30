const mongoose = require('mongoose')
const {Schema, model} = mongoose;

const paintingSchema = new Schema (
    {
        title: String,
        author: String,
        size: string, //40x50x3 cm (w/h/d)
        year: number,
        starting_bid: String, // € 50
    }
)

const Painting = model('Painting', paintingSchema)
module.exports = Painting