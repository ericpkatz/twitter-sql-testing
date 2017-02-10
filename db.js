const pg = require('pg');
console.log(process.env.DATABASE_URL);


let _client;
const connect = (cb)=> {
  if(_client)
    return cb(null, _client);
  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect((err)=> {
    if(err) return cb(err);
    _client = client;
    cb(null, client);
  });

};

const findOrCreateUserByName = (name, cb)=> {
  connect((err, client)=> {
    if(err) return cb(err);
    let qry = 'select id from users where name = $1';
    client.query(qry, [ name], (err, result)=> {
      if(err) return cb(err);
      if(result.rows.length > 0)
        return cb(null, result.rows[0].id);
      qry = 'insert into users (name) values ($1) returning id';
      client.query(qry, [ name], (err, result)=> {
        if(err) return cb(err);
        cb(null, result.rows[0].id);
      });
    });
  });
};

const createTweet = (name, content, cb)=> {
  findOrCreateUserByName(name, (err, userId)=> {
    if(err) return cb(err);
    connect((err, client)=> {
      if(err) return cb(err);
      const qry = 'insert into tweets (user_id, content) values ($1, $2)';
      client.query(qry, [ userId, content], (err, result)=> {
        cb(err);
      });
    });

  });
};

const sync = (cb)=> {
  connect((err, client)=> {
    if(err) return cb(err);
    const qry = `
      DROP TABLE IF EXISTS tweets;
      DROP TABLE IF EXISTS users;
      CREATE TABLE users(
          id SERIAL primary key,
          name TEXT
      );
      CREATE TABLE tweets(
          id SERIAL primary key,
          content text,
          user_id integer references users(id)
      );
      `;
      client.query(qry, (err)=> {
        cb(err);
      });
  });
};

const getTweets = (name, cb)=> {
  connect((err, client)=> {
    if(err) return cb(err);
    let qry = `
      SELECT tweets.id, tweets.content, tweets.user_id, users.name
      FROM tweets
      JOIN users ON users.id = tweets.user_id
      `;
    const params = [];
    if(name){
      qry = `${qry} where users.name = $1`;
      params.push(name);
    }
    client.query(qry, params, (err, result)=> {
      if(err) return cb(err);
      cb(null, result.rows);
    });
  });
};

module.exports = {
  sync,
  createTweet,
  getTweets
};
