const express = require('express')
const router = express.Router()
const testsController = require('../controllers/testsController')

router
  .route('/')
  .get(testsController.getAllTests)
  .post(testsController.createNewTest)
  .patch(testsController.updateTest)
  .delete(testsController.deleteTest)

module.exports = router
