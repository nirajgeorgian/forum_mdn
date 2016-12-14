module.exports = {
  database:'mongodb://root:pass@ds133418.mlab.com:33418/forum_demo',
  port: process.env.PORT || 3000,
  secretKey: "ninnijs@N9#" // Used for session on server // Cookies on client
}
