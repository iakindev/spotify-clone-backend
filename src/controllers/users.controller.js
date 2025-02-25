import { compare } from 'bcrypt';
import User from '../models/Users.model';

const getAll = async (_req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send();
    res.json({ message: err });
  }
};

// eslint-disable-next-line consistent-return
const signIn = async (req, res) => {
  // Login a registered user
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
    }
    const token = await user.generateAuthToken();
    res.send({
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      country: user.country,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

const signUp = async (req, res) => {
  // Create a new user
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      country: user.country,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

const currentUser = async (req, res) => {
  // View logged in user profile
  res.send({
    email: req.user.email,
    name: req.user.name,
    birthDate: req.user.birthDate,
    country: req.user.country,
    createdAt: req.user.createdAt,
  });
};

const getAvatar = async (req, res) => {
  res.status(200).send(req.user.avatar);
};

const logout = async (req, res) => {
  // Log user out of the application
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
};

const logoutAll = async (req, res) => {
  // Log user out of all devices
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const isPasswordMatching = compare(req.body.password, req.user.password);

    if (!isPasswordMatching) {
      throw new Error({ error: 'Password does not match' });
    }

    await User.findOneAndDelete({ name: req.body.name, email: req.body.email });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
};

const like = async (req, res) => {
  const { likedSongs } = req.user;
  const { id } = req.body;

  try {
    const isSongLiked = likedSongs.includes(id);

    if (isSongLiked) {
      throw new Error({ error: 'already liked' });
    }

    req.user.likedSongs.push(id);
    await req.user.save();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
};

const unlike = async (req, res) => {
  const { likedSongs } = req.user;
  const { id } = req.body;

  try {
    const isSongLiked = likedSongs.includes(id);

    if (!isSongLiked) {
      throw new Error({ error: 'does not exists' });
    }

    const songIndex = likedSongs.indexOf(id);
    req.user.likedSongs.splice(songIndex, 1);

    await req.user.save();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
};

const isLiked = (req, res) => {
  const { likedSongs } = req.user;
  const { id } = req.body;

  try {
    const isSongLiked = likedSongs.includes(id);
    res.status(200).send(isSongLiked);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default {
  getAll,
  signIn,
  signUp,
  currentUser,
  getAvatar,
  logout,
  logoutAll,
  deleteUser,
  like,
  unlike,
  isLiked,
};
