const { User, Thought } = require('../models');

const userController = {
  async getUsers(req, res) {
    try {
      const dbUserData = await User.find()
        .select('-__v')
        .populate('friends')
        .populate('thoughts');

      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async getSingleUser(req, res) {
    try {
      const dbUserData = await User.findOne({ _id: req.params.userId })
        .select('-__v')
        .populate('friends')
        .populate('thoughts');

      if (!dbUserData) {
        return res.status(404).json({ message: 'Cant find this id.' });
      }

      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async createUser(req, res) {
    try {
      const dbUserData = await User.create(req.body);
      res.json({ message: `User Created!`, user: dbUserData });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async updateUser(req, res) {
    try {
      const dbUserData = await User.findOneAndUpdate(
        { _id: req.params.userId },
        {
          $set: req.body,
        },
        {
          runValidators: true,
          new: true,
        }
      );
  
      if (!dbUserData) {
        return res.status(404).json({ message: 'No user with this id!' });
      }
  
      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async deleteUser(req, res) {
    try {
      const dbUserData = await User.findOneAndDelete({ _id: req.params.userId })

      if (!dbUserData) {
        return res.status(404).json({ message: 'No user with this id!' });
      }

      await Thought.deleteMany({ _id: { $in: dbUserData.thoughts } });
      res.json({ message: 'User and associated thoughts deleted!', user: dbUserData });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

    async addFriend(req, res) {
      try {
        const dbUserData = await User.findOneAndUpdate({ _id: req.params.userId }, { $addToSet: { friends: req.params.friendId } }, { new: true })
        .select('-__v')
        .populate('friends')
        .populate('thoughts');
  
        if (!dbUserData) {
          return res.status(404).json({ message:'Cant find this id!'});
        }
  
        res.json({
          message: `Friend Added!`,
          updatedUser: dbUserData
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    },

    async removeFriend(req, res) {
      try {
        const dbUserData = await User.findOneAndUpdate({ _id: req.params.userId }, { $pull: { friends: req.params.friendId } }, { new: true })
        .select('-__v')
        .populate('friends')
        .populate('thoughts');
  
        if (!dbUserData) {
          return res.status(404).json({ message:'Cant find this ID!'});
        }
  
        res.json({
          message: `Removed friend!`,
          updatedUser: dbUserData
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    },
  }

module.exports = userController;