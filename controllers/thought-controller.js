const { Thought, User } = require('../models');

const thoughtController = {
  // get all thoughts
  async getThoughts(req, res) {
    try {
      const dbThoughtData = await Thought.find()
        .sort({ createdAt: -1 });

      res.json(dbThoughtData);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  // get single thought by id
  async getSingleThought(req, res) {
    try {
      const dbThoughtData = await Thought.findOne({ _id: req.params.thoughtId });

      if (!dbThoughtData) {
        return res.status(404).json({ message: 'No thought with this id!' });
      }

      res.json(dbThoughtData);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  // create a thought
  async createThought(req, res) {
    try {
      const dbThoughtData = await Thought.create(req.body);

      const dbUserData = await User.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: dbThoughtData._id } },
        { new: true }
      );

      let successMessage = `Thought created!`;
      let noUserIDFoundMessage = `Can't find this id, but the thought is created`;

      let message = { message: successMessage, thought: dbThoughtData };

      if (!dbUserData) {
        message = { message: noUserIDFoundMessage, help: `Cant find this id!` };
        return res.status(404).json(message); 
      };

      res.json(message);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  async updateThought(req, res) {
    const dbThoughtData = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, { $set: req.body }, { runValidators: true, new: true });

    if (!dbThoughtData) {
      return res.status(404).json({ message: 'Cant find this id!' });
    }

    res.json(dbThoughtData);

    console.log(err);
    res.status(500).json(err);
  },

  // delete thought
  async deleteThought(req, res) {
    try {
      const dbThoughtData = await Thought.findOneAndDelete({ _id: req.params.thoughtId })

      if (!dbThoughtData) { return res.status(404).json({ message: 'Cant find this id!' }); }

      // remove thought id from user's `thoughts` field
      const dbUserData = User.findOneAndUpdate(
        { thoughts: req.params.thoughtId },
        { $pull: { thoughts: req.params.thoughtId } },
        { new: true }
      );

      if (!dbUserData) {
        return res.status(404).json({ message: 'Cant find this thought id!' });
      }

      res.json({ message: 'Thought removed.', thought: dbThoughtData });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
}

module.exports = thoughtController;