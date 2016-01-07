module.exports = {
  "credentials": {
    "email": process.env.FB_EMAIL || "test@example.com",
    "password": process.env.FB_PASSWORD || "password"
  },
  "commandCharacter": "/",
  "name": process.env.FB_NAME || "Firstname Lastname"
}
