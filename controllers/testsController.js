const User = require('../models/User')
const Test = require('../models/Test')
const asyncHandler = require('express-async-handler')

// @desc Get all tests
// @route GET /tests
// @access Private
const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.find().lean()

  // si no hay tests
  if (!tests?.length) {
    return res.status(400).json({ message: 'No se encontraron pruebas' })
  }

  // se agrega la información del paciente a cada prueba
  // usamos Promise.all para que la respuesta se resuelva cuando todas las peticiones dentro sean completadas
  // o una de ellas sea rechazada
  const testsWithUser = await Promise.all(
    tests.map(async (test) => {
      // se usa exec porque se esta pasando un parametro de busqueda
      const user = await User.findById(test.user)
        .select('-password -_id')
        .lean()
        .exec()
      return { ...test, ...user }
    })
  )

  res.json(testsWithUser)
})

// @desc Create new test
// @route POST /tests
// @access Private
const createNewTest = asyncHandler(async (req, res) => {
  const { user, reference, result } = req.body

  // Confirm data
  if (!user || !reference || !result) {
    return res.status(400).json({ message: 'Ingrese los campos requeridos' })
  }

  // Check for duplicate reference
  const duplicate = await Test.findOne({ reference }).lean().exec()

  if (duplicate) {
    return res
      .status(409)
      .json({ message: 'La prueba ya se encuentra en el sistema' })
  }

  // Create and store the new user
  const test = await Test.create({ user, reference, result })

  if (test) {
    // Created
    return res.status(201).json({ message: 'Nueva prueba creada' })
  } else {
    return res.status(400).json({ message: 'Datos recibidos inválidos' })
  }
})

// @desc Update a test
// @route PATCH /tests
// @access Private
const updateTest = asyncHandler(async (req, res) => {
  const { id, user, reference, result } = req.body

  // Confirm data
  if (!id || !user || !reference || !result) {
    return res.status(400).json({ message: 'Ingrese los campos requeridos' })
  }

  // Confirm test exists to update
  const test = await Test.findById(id).exec()

  if (!test) {
    return res.status(400).json({ message: 'No se encuentra la prueba' })
  }

  // Check for duplicate reference
  const duplicate = await Test.findOne({ reference }).lean().exec()

  // Allow updates in the original test
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Referencia duplicada' })
  }

  test.user = user
  test.reference = reference
  test.result = result

  const updatedTest = await test.save()

  res.json(`Prueba '${updatedTest.reference}' actualizada`)
})

// @desc Delete a test
// @route DELETE /tests
// @access Private
const deleteTest = asyncHandler(async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'Se require ID de la prueba' })
  }

  // Confirm test exists to delete
  const test = await Test.findById(id).exec()

  if (!test) {
    return res.status(400).json({ message: 'Prueba no encontrada' })
  }

  const result = await test.deleteOne()

  const reply = `Prueba '${result.reference}' eliminada`

  res.json(reply)
})

module.exports = {
  getAllTests,
  createNewTest,
  updateTest,
  deleteTest,
}
