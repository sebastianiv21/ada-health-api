const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
  origin: (origin, callback) => {
    // permite acceder solo a los origenes listado en allowedOrigins y a Postman con !origin
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

module.exports = corsOptions
