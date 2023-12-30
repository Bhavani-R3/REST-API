const express = require('express')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { StatusCodes } = require('http-status-codes')
const PORT = process.env.PORT

// instance
const app = express()

// body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json)

// middleware
app.use(cors())
app.use(cookieParser())

// api route
app.use(`/api/auth`, require('./route/authRoute'))

// default route
app.use(`**`, (req,res) => {
   res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ msg: `Requested service path not available` })
})

// server listen
app.listen(PORT,() => {
   console.log(`server is started and running @ http://localhost:${PORT}`)
})



/* 
   npm init -y -> to install package.json 
   npm i --save express dotenv mongoose cors cookie-parser bcryptjs http-status-codes jsonwebtoken
   npm i --save express-async-errors nodemailer express-fileupload 
   / in package.json replace the script content by adding below lines
      "start": "node index.js",
      "dev": "nodemon index.js" 
   / 
*/