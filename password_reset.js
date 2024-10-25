require('dotenv').config();
const database = require('./database.js');
const db = new database(process.env.DB_PATH);
const prompt = require('prompt-sync')();

//db.resetPassword("ver-anna", "1234567");

const username = prompt('Please enter the username of the user: ');
const newPassword= prompt('Please enter the new password: ');
db.resetPassword(username, newPassword);