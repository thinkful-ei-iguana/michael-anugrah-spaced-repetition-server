# Spaced repetition API!
Built by Anugrah Lambogo and Michael Weedman

## Live Link

[Live API](https://sleepy-temple-89186.herokuapp.com/api "api link - won't be able to complete any requests") The live API will not send any responses without authentication.

[Live Client](https://spaced-rep-phi.now.sh/ "Spaced repetition")
[Client repository](https://github.com/thinkful-ei-iguana/michael-anugrah-spaced-repetition-client "Spaced repetition server")

## About this API

This is the API that serves our Spaced Repetition learning application. The application is a simple spaced repetition learning application meant to help a user learn a new language.

This API pulls from a SQL database of two tables: a table of languages, and a table of words. The api creates a singly linked linked-list from the word table to emulate spaced repetition learning. If a user answers a word incorrectly, the word is sent back in the linked-list by one space. If it is answered correctly, it is sent back more spaces depending on the amount of times the user has answered it correctly. The order of this linked-list is persisted within the database, as well as the amount of times the user has answered each word correctly and incorrectly. Therefore the user can come back later and continue their progress.


## Routes

/api/
/api/head
/api/guess

## Local dev setup

If using user `dunder-mifflin`:

```bash
mv example.env .env
createdb -U dunder-mifflin spaced-repetition
createdb -U dunder-mifflin spaced-repetition-test
```

If your `dunder-mifflin` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DB_NAME=spaced-repetition-test npm run migrate
```

And `npm test` should work at this point

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
   3. E.g  on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`
