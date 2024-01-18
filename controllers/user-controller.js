const { User, Thought } = require('../models');

const modifyUser = (usr) => {
  // If the usr._doc property exists, then use that, else, just use the usr object itself
  let userObj = usr._doc ? usr._doc : usr;
  return {
    ...userObj,
    // toLocaleString converts your timestamp into a more human-readable format
    createdAt: userObj.createdAt.toLocaleString(),
    updatedAt: userObj.updatedAt.toLocaleString(),
  }
}

const userController = {
  async getUsers(req, res) {
    try {
      const dbUsersDataArray = await User.find()
        .select('-__v')
        .populate('friends')
        .populate('thoughts');

      let modifiedUsers = dbUsersDataArray.map(usr => modifyUser(usr));
      res.json(modifiedUsers);
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
      let modifiedUser = modifyUser(dbUserData);
      res.json({ message: `User Created Successfully`, userCreated: modifiedUser });
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