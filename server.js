const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const { User, Thought } = require('./models');

mongoose.connect(process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/socialbook`);
const db = mongoose.connection;

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

const modifyUser = (usr) => {
  return {
    ...usr._doc,
    // toLocaleString converts your timestamp into a more human-readable format
    createdAt: usr._doc.createdAt.toLocaleString(),
    updatedAt: usr._doc.updatedAt.toLocaleString(),
  }
}

// Mofidy our Raw Database Objects into Usable Virtual API Objects
const getUsers = async () => {
  try {
    let users = await User.find().select('-__v');

    let modifiedUsers = users.map(usr => {
      return modifyUser(usr);
    })

    return modifiedUsers;
  } catch (error) {
    console.log(`Error grabbing Users`, error);
    return;
  }
};

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    getUsers();
  });
});