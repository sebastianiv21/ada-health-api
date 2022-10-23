const express = require('express')
const router = express.Router()
const path = require('path')

// Just a slash or /index with html optional
router.get('^/$|/index(.html)?', (req, res) => {
  // Go back one directory, then go views and open index.html
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router
