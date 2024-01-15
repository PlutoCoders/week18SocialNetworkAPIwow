const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/socialbook`);
const db = mongoose.connection;

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const getUsers = async () => {
    try {
        let users = await User.find().select('-__v');
        return users;
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