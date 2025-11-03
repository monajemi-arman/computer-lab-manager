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

db.users.insertOne({
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || '$2b$10$Pn6nWEm7AABeCkR29RKkKeKxjaDz29LfcL65hCGrLdVJOIF.GBAA6', // admin
  role: 'admin',
  computers: []
});