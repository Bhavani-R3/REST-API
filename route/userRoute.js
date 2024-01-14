const userRoute = require('express').Router()
const { readAll, readSingle, updateUser, deleteUser } = require('../controller/userController')

userRoute.get(`/all`, readAll).get(`/single/:id`, readSingle)

userRoute.patch(`/update/:id`, updateUser)

userRoute.delete(`/delete/:id`, deleteUser)

module.exports = userRoute