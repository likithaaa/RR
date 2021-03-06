const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));

const Car = require('../models/carSchema.js');

router.get('/', function (req, res, next) {
  return res.render('index.ejs');
});

router.post('/', function (req, res, next) {
  console.log(req.body);
  const personInfo = req.body;

  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          let c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log('if');
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            const newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf,
            });

            newPerson.save(function (err, Person) {
              if (err) console.log(err);
              else console.log('Success');
            });
          })
            .sort({ _id: -1 })
            .limit(1);
          res.send({ Success: 'You are regestered,You can login now.' });
        } else {
          res.send({ Success: 'Email is already used.' });
        }
      });
    } else {
      res.send({ Success: 'password is not matched' });
    }
  }
});

router.get('/login', function (req, res, next) {
  return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    if (data) {
      if (data.password == req.body.password) {
        //console.log("Done Login");
        req.session.userId = data.unique_id;
        //console.log(req.session.userId);
        res.send({ Success: 'Success!' });
      } else {
        res.send({ Success: 'Wrong password!' });
      }
    } else {
      res.send({ Success: 'This Email Is not regestered!' });
    }
  });
});

router.get('/profile', function (req, res, next) {
  console.log('profile');
  User.findOne({ unique_id: req.session.userId }, function (err, data) {
    console.log('data');
    console.log(data);
    if (!data) {
      res.redirect('/');
    } else {
      //console.log("found");
      return res.render('data.ejs', { name: data.username, email: data.email });
    }
  });
});

router.get('/logout', function (req, res, next) {
  console.log('logout');
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/forgetpass', function (req, res, next) {
  res.render('forget.ejs');
});

router.post('/forgetpass', function (req, res, next) {
  //console.log('req.body');
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    console.log(data);
    if (!data) {
      res.send({ Success: 'This Email Is not regestered!' });
    } else {
      // res.send({"Success":"Success!"});
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function (err, Person) {
          if (err) console.log(err);
          else console.log('Success');
          res.send({ Success: 'Password changed!' });
        });
      } else {
        res.send({
          Success: 'Password does not matched! Both Password should be same.',
        });
      }
    }
  });
});

/////// UPLOAD FORM /////////
const helpers = require('../helpers.js');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

router.post('/createcar', (req, res) => {
  let upload = multer({
    storage: storage,
    fileFilter: helpers.imageFilter,
  }).single('upload_pic');

  upload(req, res, function (err) {
    // req.file contains information of uploaded file
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send('Please select an image to upload');
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }

    let uploadedImage = {
      name: req.body.name,
      location: req.body.location,
      price: req.body.price,
      availability: req.body.availability,
      image: req.file.filename,
    };
    console.log(uploadedImage);

    Car.create(uploadedImage, (err, cars) => {
      console.log(err, cars);
      res.redirect('/cars');
    });
  });
});

router.get('/cars', (req, res) => {
  Car.find({}, (err, cars) => {
    console.log(cars);
    res.render('../views/carslist.ejs', { cars: cars });
  });
});

router.get('/car', (req, res) => {
  res.render('../views/new.ejs');
});

router.get('/car/new/', (req, res) => {
  res.render('new.ejs');
});

module.exports = router;
