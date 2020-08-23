const mongoose = require('mongoose');
const cars = require('./cars.js');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: String, required: true },
  availability: { type: String, required: true },
  image: { type: String },
  isFixed: { type: Boolean, default: false },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
});

const Car = mongoose.model('Car', carSchema);

Car.deleteMany({ isFixed: true }).then(() => {
  for (let i = 0; i < cars.length; i++) {
    car = cars[i];
    Car.create({
      name: car.name,
      location: car.location,
      price: car.price,
      availability: car.availability,
      image: car.image,
      isFixed: true,
    });
  }
});

module.exports = Car;
