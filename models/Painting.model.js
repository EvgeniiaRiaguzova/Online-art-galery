const mongoose = require('mongoose')
const {Schema, model} = mongoose;

const paintingSchema = new Schema (
    {
        title: {
            type: String,
            required: [true, 'Title is required.'],
        },

        author: {
            type: String,
            required: [true, 'Author is required.'],
        },

        size: String, //40x50x3 cm (w/h/d)

        year: {
            type: Number,
            required: [true, 'Year is required.'],
        },
        
        description: String,

        starting_bid: String, // € 50

        imageUrl: {
            type: String,
            required: [true, 'Painting photo is required.'],
        },
    },
    {
        timestamps: true
    }
)

const Painting = model('Painting', paintingSchema)
module.exports = Painting