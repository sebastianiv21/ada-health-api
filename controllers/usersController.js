const User = require('../models/User')
const Test = require('../models/Test')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // devuelve la informacion de los usuarios excepto la contraseña
  // el metodo lean sirve para traer solo el json y no incluir otra informacion y metodos que contiene el llamado a users. Se usa sólo para consultas ya que si se quiere guardar un registro, se debe evitar usarlo
  const users = await User.find().select('-password').lean()
  if (!users?.length) {
    return res.status(400).json({ message: 'No se encontraron usuarios' })
  }
  res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  // la informacion que recibe el backend del frontend cuando se crea un usuario
  const {
    idType,
    idNumber,
    name,
    lastname,
    birthDate,
    gender,
    bloodType,
    rh,
    maritalStatus,
    eps,
    personalPhone,
    personalPhone2,
    address,
    city,
    department,
    roles,
    // No se envia active porque su valor por defecto es correcto y no se debe modificar en esta ruta
    // active,
    email,
    password,
    contactName,
    contactLastname,
    contactRelationship,
    contactPhone,
  } = req.body

  // confirm data
  if (
    !idType ||
    !idNumber ||
    !name ||
    !lastname ||
    !birthDate ||
    !gender ||
    !bloodType ||
    !rh ||
    !eps ||
    !email ||
    !personalPhone ||
    !password ||
    !Array.isArray(roles) ||
    !roles.length
  ) {
    // return bad request status with json
    return res.status(400).json({ message: 'Ingrese los campos requeridos' })
  }

  // check for duplicates
  // se usa exec porque estamos pasando un parametro a la funcion findOne
  const duplicate = await User.findOne({ idNumber }).lean().exec()

  if (duplicate) {
    // conflict
    res.status(409).json({ message: 'El usuario ya existe' })
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

  const userObject = {
    idType,
    idNumber,
    name,
    lastname,
    birthDate,
    gender,
    bloodType,
    rh,
    maritalStatus,
    eps,
    personalPhone,
    personalPhone2,
    address,
    city,
    department,
    roles,
    // No se envia active porque su valor por defecto es correcto y no se debe modificar en esta ruta
    // active,
    email,
    password: hashedPwd,
    contactName,
    contactLastname,
    contactRelationship,
    contactPhone,
  }

  // create and store new user
  const user = await User.create(userObject)

  if (user) {
    // created
    // no colocamos return porque se coloca un else
    res
      .status(201)
      .json({ message: `Nuevo usuario ${name} ${lastname} creado` })
  } else {
    res.status(400).json({ message: 'Datos de usuario inválidos' })
  }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const {
    id,
    idType,
    idNumber,
    name,
    lastname,
    birthDate,
    gender,
    bloodType,
    rh,
    maritalStatus,
    eps,
    personalPhone,
    personalPhone2,
    address,
    city,
    department,
    roles,
    active,
    email,
    password,
    contactName,
    contactLastname,
    contactRelationship,
    contactPhone,
  } = req.body

  // confirm data
  if (
    !id ||
    !idType ||
    !idNumber ||
    !name ||
    !lastname ||
    !birthDate ||
    !gender ||
    !bloodType ||
    !rh ||
    !eps ||
    !personalPhone ||
    !email ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'Ingrese los campos requeridos' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: 'Usuario no encontrado' })
  }

  // check for duplicate
  const duplicate = await User.findOne({ idNumber }).lean().exec()
  // allow updates to the original user
  // se asegura de que el usuario a actualizar sea el que corresponde
  if (duplicate && duplicate?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: 'Número de identificación duplicado' })
  }

  user.idType = idType
  user.idNumber = idNumber
  user.name = name
  user.lastname = lastname
  user.birthDate = birthDate
  user.gender = gender
  user.bloodType = bloodType
  user.rh = rh
  user.maritalStatus = maritalStatus
  user.eps = eps
  user.personalPhone = personalPhone
  user.personalPhone2 = personalPhone2
  user.address = address
  user.city = city
  user.department = department
  user.roles = roles
  user.active = active
  user.email = email
  user.contactName = contactName
  user.contactLastname = contactLastname
  user.contactRelationship = contactRelationship
  user.contactPhone = contactPhone

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10) // salt rounds
  }

  const updatedUser = await user.save()

  res.json({
    message: `Perfil de ${updatedUser.name} ${updatedUser.lastname} actualizado`,
  })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body

  if (!id) {
    // bad request
    return res.status(400).json({ message: 'Se require ID del usuario' })
  }

  const test = await Test.findOne({ user: id }).lean().exec()
  if (test) {
    return res
      .status(400)
      .json({ message: 'El usuario tiene pruebas asignadas' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: 'Usuario no encontrado' })
  }

  const result = await user.deleteOne()

  const reply = `Usuario ${result.name} ${result.lastname} con número de identificación ${result.idNumber} eliminado`

  res.json(reply)
})

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
}
