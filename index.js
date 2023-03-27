const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const multer = require('multer');
require("dotenv").config();
const fs = require('fs');
const User = require("./models/User");
const Place = require('./models/AddPlace');

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsConfig));
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(process.env.DATABASE_CONNECTION_URL);

const jwt_secret = "dadjkaksfjkalfjdfjnafjdsjkajfnjs";

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newuser = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password),
    });
    res.json(newuser);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const passOk = bcrypt.compareSync(password, user.password);
    if (passOk) {
      jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        jwt_secret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none', path: '/' }).json(user);
        }
      );
    } else {
      res.status(401).json("password not matched");
    }
  } else {
    res.status(404).json("user not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwt_secret, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
});

const photosMiddleware = multer({ dest: 'uploads' })
app.post('/uploads', photosMiddleware.array('photos', 50), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    console.log(newPath);
    uploadedFiles.push(newPath.replace('uploads/', ''));
  }
  res.json(uploadedFiles);
})

app.post('/addnewplace', async (req, res) => {
  const { token } = req.cookies;
  console.log(JSON.stringify(req.cookies))
  const { title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    noOfGuests, price } = req.body;
  if (token) {

    jwt.verify(token, jwt_secret, {}, async (err, user) => {
      if (err) throw err;
      const addedPlaces = await Place.create({
        owner: user.id, title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        noOfGuests,
        price,
      })
      res.json(addedPlaces);
    });
  }
})

app.get('/user-places', (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwt_secret, {}, async (err, user) => {
      if (err) throw err;
      const { id } = user;
      id
      const data = await Place.find({ owner: id });
      res.json(await Place.find({ owner: id }));
    })
  }
})

app.get('/places/:id', async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id))
})

app.put('/addnewplace', (req, res) => {
  const { token } = req.cookies;
  const { id, title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    noOfGuests, price } = req.body;

  console.log(addedPhotos);

  jwt.verify(token, jwt_secret, {}, async (err, user) => {
    if (err) throw err;
    const place = await Place.findById(id);
    if (user.id === place.owner.toString()) {
      place.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        noOfGuests, price
      })
      await place.save();
      res.status(200).json(place)
    }
  })
})

app.get('/places', async (req, res) => [
  res.json(await Place.find())
])

app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true);
})

app.listen(4000);
