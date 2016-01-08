module.exports = {
  "credentials": {
    "email": process.env.FB_EMAIL || "email@test.com",
    "password": process.env.FB_PASSWORD || "password"
  },
  "commandCharacter": "/",
  "name": process.env.FB_NAME || "Firstname Lastname",
  "db": {
    "url": process.env.DB_URL || "mongo_url"
  },
  "owner": 0,
  "ownerName": "John Smith"
}
