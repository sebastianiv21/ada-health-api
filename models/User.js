const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    // Informacion personal
    idType: {
      type: String,
      required: true,
    },
    idNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    secLastname: String,
    // Informacion general
    birthDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
    },
    rh: {
      type: String,
      required: true,
    },
    maritalStatus: String,
    eps: {
      type: String,
      required: true,
    },
    // Datos de localizacion
    homePhone: Number,
    mobilePhone: Number,
    workPhone: Number,
    address: String,
    city: String,
    department: String,
    // Información de la sesión
    roles: [
      {
        type: String,
        default: 'Paciente',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Información de contacto
    contactName: String,
    contactLastname: String,
    contactSecLastname: String,
    contactRelationship: String,
    contactPhone: Number,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)
