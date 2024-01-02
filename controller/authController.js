const { StatusCodes } = require("http-status-codes")
const bcrypt = require('bcryptjs')
const User = require('../model/userModel')
const comparePassword = require('../util/password')

const authController = {
    register: async (req,res) => {
        try {
            const { name, email, mobile, password } = req.body

            // email
            const extEmail = await User.findOne({ email })
            const extMobile = await User.findOne({ mobile })

            // point the duplicate, any server response error 409
            if(extEmail) 
                return res.status(StatusCodes.CONFLICT).json({ msg: `${email} already exists` })
            
            if(extMobile) 
                return res.status(StatusCodes.CONFLICT).json({ msg: `${mobile} already exists` })

            // encrypt the password into hash
            const encPass = await bcrypt.hash(password,10);
            
            // adding data into db collections
            let data = await User.create({
                name,
                email,
                mobile,
                password: encPass        
            })

            res.status(StatusCodes.ACCEPTED).json({ msg: "New user registered successfully", user:data })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    login: async (req,res) => {
        try {
            const { email, mobile, password } = req.body

            // if login through email
            if(email) {
                let extEmail = await User.findOne({ email })
                if(!extEmail)
                   return res.status(StatusCodes.CONFLICT).json({ msg: `${email} is not registered` })

                // compare the password(string,hash)
                let isMatch = await comparePassword(password,extEmail.password)
                if(!isMatch) 
                   return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Passwords are not matched` })

                res.status(StatusCodes.OK).json({ msg: `Login success(email)` })
            }

            // if login through mobile
            if(mobile) {

            }

        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    logout: async (req,res) => {
        try {
            res.json({ msg: `logout` })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    authToken: async (req,res) => {
        try {
            res.json({ msg: `auth token` })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    currentUser: async (req,res) => {
        try {
            res.json({ msg: `current user` })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
}

module.exports = authController