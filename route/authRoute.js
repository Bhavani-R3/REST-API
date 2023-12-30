const authController = require('../controller/authController')
const route = require('express').Router()

// user register
route.post(`/regsiter`, authController.register)

// user login
route.post(`/login`, authController.login)

// user logout
route.get(`/logout`, authController.logout)

// user auth token
route.get(`/auth/token`, authController.authToken)

// current login user
route.get(`/current/user`, authController.currentUser)

module.exports = route