import knex from 'knex';

// Server Configuration
export const SERVER = {
  port: process.env.API_PORT || 3001,
};

export const MySQLConnection = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || 'password',
    database: process.env.MYSQL_DB || 'fb',
  },
  pool: { min: 2, max: 10 },
});
