const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    required: [true, 'Username is required.'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    // this match will disqualify all the emails with accidental empty spaces, missing dots in front of (.)com and the ones with no domain at all
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    unique: true,
    lowercase: true,
    trim: true
  },
  status: 
  {
   type: String,
   required: [true, 'Status is required.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.']
  },
  imageUrl: {
    type: String
  },
  description: String,
  paintings: [{type: Schema.Types.ObjectId, ref: "Painting"}]
});

const User = model("User", userSchema);

module.exports = User;
