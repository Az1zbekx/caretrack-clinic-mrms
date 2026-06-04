const path = require('path');
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/users.json');

class UserModel {
  static async findAll() {
    return await fileHandler.readJson(dbPath);
  }

  static async findById(id) {
    const users = await this.findAll();
    return users.find(u => u.id === id) || null;
  }

  static async findByUsername(username) {
    const users = await this.findAll();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  static async create(user) {
    const users = await this.findAll();
    const newUser = {
      id: uuidv4(),
      username: user.username,
      password: user.password,
      role: user.role,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    await fileHandler.writeJson(dbPath, users);
    return newUser;
  }

  static async update(id, data) {
    const users = await this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...data,
      // Do not allow overriding id
      id,
      updated_at: new Date().toISOString()
    };

    await fileHandler.writeJson(dbPath, users);
    return users[index];
  }

  static async delete(id) {
    const users = await this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    await fileHandler.writeJson(dbPath, users);
    return true;
  }
}

module.exports = UserModel;
