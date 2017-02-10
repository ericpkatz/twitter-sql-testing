const expect = require('chai').expect;

const db = require('../db');

describe('tweeting', ()=> {
  describe('two tweets by one user and one tweet by another user', ()=> {
    let tweets;
    let profTweets;
    beforeEach((done)=> {
      db.sync((err)=> {
        if(err) return done(err);
        db.createTweet('prof', 'hi', (err)=> {
          if(err) return done(err);
          db.createTweet('prof', 'bye', (err)=> {
            if(err) return done(err);
            db.createTweet('jordan', 'hey there', (err)=> {
              if(err) return done(err);
              db.getTweets(null, (err, _tweets)=> {
                if(err) return done(err);
                tweets = _tweets;
                db.getTweets('prof', (err, tweets)=> {
                  if(err) return done(err);
                  profTweets = tweets;
                  done();
                });
              });
            });
          });

        });
      });

    });
    it('results in three tweets by two users', ()=> {
      expect(tweets.length).to.equal(3);
      expect(profTweets.length).to.equal(2);
      const users = tweets.reduce((memo, tweet)=> {
        memo[tweet.user_id] = tweet.name;
        return memo;
      }, {});
      expect(Object.keys(users).length).to.equal(2);
    });
  });

});
