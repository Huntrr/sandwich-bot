module.exports = {
  "credentials": {
    "email": process.env.FB_EMAIL || "example@test.com",
    "password": process.env.FB_PASSWORD || "password"
  },
  "commandCharacter": "/",
  "name": process.env.FB_NAME || "firstname lastname",
  "db": {
    "url": process.env.DB_URL || "mongo_url"
  },
  "owner": process.env.OWNER || 0,
  "ownerName": process.env.OWNER_NAME || "John Smith"
}
