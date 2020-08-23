const mongoose = require('mongoose');

const carImage = new mongoose.Schema({
  comment: { type: String, required: true },
  postedUser: { type: String, required: true },
});

const Image = mongoose.model('Image', carImage);

module.exports = Image;
