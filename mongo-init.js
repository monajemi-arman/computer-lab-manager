db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'appuser',
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE
    }
  ]
});