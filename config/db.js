const { Client } = require('pg')
require('dotenv').config();
const client = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl:{require:true}
})

module.exports = {
    query: (text, params) => client.query(text, params),
    client
};