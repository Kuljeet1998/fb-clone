import { MySQLConnection } from '../config/main';

async function main(): Promise<void> {
  console.log('MYSQL_HOST', process.env.MYSQL_HOST);
  console.log('MYSQL_DB', process.env.MYSQL_DB);

  //await MySQLConnection.schema.dropTableIfExists('user');
  await MySQLConnection.schema.createTable('user', (table) => {
    table.uuid('id').primary();
    table.string('email').notNullable().index();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.timestamp('created_at').defaultTo(MySQLConnection.fn.now());
    table.timestamp('updated_at').defaultTo(MySQLConnection.fn.now());
    table.collate('latin1_swedish_ci');
  });

  await MySQLConnection.schema.createTable('post', (table) => {
    table.uuid('id').primary();
    table.string('title').notNullable();
    table.string('content').notNullable();
    table.timestamp('created_at').defaultTo(MySQLConnection.fn.now());
    table.timestamp('updated_at').defaultTo(MySQLConnection.fn.now());
    table.uuid('user_id').notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.collate('latin1_swedish_ci');
  });

  await MySQLConnection.schema.createTable('comment', (table) => {
    table.uuid('id').primary();
    table.string('text').notNullable();
    table.timestamp('created_at').defaultTo(MySQLConnection.fn.now());
    table.timestamp('updated_at').defaultTo(MySQLConnection.fn.now());
    table.uuid('user_id').notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.uuid('post_id').notNullable();
    table
      .foreign('post_id')
      .references('id')
      .inTable('post')
      .onDelete('CASCADE');
    table.collate('latin1_swedish_ci');
  });

  await MySQLConnection.schema.createTable('post_reaction', (table) => {
    table.uuid('id').primary();
    table.enum('type', ['Like', 'Love', 'Laugh']).defaultTo('Like');
    table.timestamp('created_at').defaultTo(MySQLConnection.fn.now());
    table.timestamp('updated_at').defaultTo(MySQLConnection.fn.now());
    table.uuid('user_id').notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.uuid('post_id').notNullable();
    table
      .foreign('post_id')
      .references('id')
      .inTable('post')
      .onDelete('CASCADE');
    table.collate('latin1_swedish_ci');
  });

  await MySQLConnection.schema.createTable('comment_reaction', (table) => {
    table.uuid('id').primary();
    table.enum('type', ['Like', 'Love', 'Laugh']).defaultTo('Like');
    table.timestamp('created_at').defaultTo(MySQLConnection.fn.now());
    table.timestamp('updated_at').defaultTo(MySQLConnection.fn.now());
    table.uuid('user_id').notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.uuid('comment_id').notNullable();
    table
      .foreign('comment_id')
      .references('id')
      .inTable('comment')
      .onDelete('CASCADE');
    table.collate('latin1_swedish_ci');
  });
}

main()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
