const fileRoute = require('express').Router()
const { uploadFile, readAll, readSingle, deleteFile, allFiles, filterType  } = require('../controller/fileController')
const auth = require('../middleware/auth')

fileRoute.post(`/upload`, auth, uploadFile)

fileRoute.get(`/all`, auth, readAll).get(`/single/:id`, auth, readSingle)

fileRoute.delete(`/delete/:id`, auth, deleteFile)

// open routes
fileRoute.get(`/open`, allFiles)

fileRoute.get(`/filter`, filterType) 

module.exports = fileRoute