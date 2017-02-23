import * as bcrypt from 'bcryptjs';

import { User } from '../database';

export default async (msg, reply) => {
  let { username, password } = msg;
  password = await bcrypt.hash(password, 10);
  /* check if user already exists */
  let result = await User.findOne({ username });
  if (result) { /* user already exist */
    reply(new Error('alreadyExist'), null);
    return;
  }
  /* create new user */
  const user = new User({ username, password });
  try {
    await user.save();
    reply(null, null);
  } catch (e) {
    reply(new Error('databaseError'), null);
  }
};