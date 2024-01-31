const { StatusCodes } = require("http-status-codes")
const bcrypt = require('bcryptjs')
const User = require('../model/userModel')
const comparePassword = require('../util/password')
const createAccessToken = require('../util/token')
const jwt = require('jsonwebtoken')
const reset_password = require('../template/gen_password')
const mailConfig = require('../util/mail.config')
const confirm_temp = require('../template/confirm')

const authController = {
    register: async (req,res) => {
        try {
            const { name, email, mobile, password, role } = req.body

            // email and mobile validate to avoid duplicates
            const extEmail = await User.findOne({ email })
            const extMobile = await User.findOne({ mobile })

            // point the duplicate, any server response error 409
            if(extEmail) 
                return res.status(StatusCodes.CONFLICT).json({ msg: `${email} already exists`, success: false })
            
            if(extMobile) 
                return res.status(StatusCodes.CONFLICT).json({ msg: `${mobile} already exists`, success: false })

            // encrypt the password into hash
            const encPass = await bcrypt.hash(password,10);
            
            // adding data into db collections
            let data = await User.create({
                name,
                email,
                mobile,
                role,
                password: encPass        
            })

            // email subject
            let subject = `Registration Confirmation`
            let msg = "You have Successfully Registered.."

            // register confirm template
            let confirm_template = confirm_temp(name, email, subject, msg)

            // send email
            let emailRes = await mailConfig(email,subject,confirm_template)

            res.status(StatusCodes.ACCEPTED).json({ msg: "New user registered successfully", user:data, success: true, emailRes })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message, success: false })
        }
    },
    login: async (req,res) => {
        try {
            const { email, mobile, password } = req.body

            // if login through email
            if(email) {
                let extEmail = await User.findOne({ email })
                if(!extEmail)
                   return res.status(StatusCodes.CONFLICT).json({ msg: `${email} is not registered`, success: false })

                // compare the password(string,hash)
                let isMatch = await comparePassword(password,extEmail.password)
                if(!isMatch) 
                   return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Passwords are not matched`, success: false })

                // generate access token
                let authToken = createAccessToken({ id: extEmail._id })

                // set the token in cookies
                res.cookie('loginToken', authToken, {
                    httpOnly: true,
                    signed: true,
                    path: `/api/auth/token`,
                    maxAge: 1 * 24 * 60 * 60 * 1000
                })

                res.status(StatusCodes.OK).json({ msg: `Login success(email)`, authToken, success: true })
            }

            // if login through mobile
            if(mobile) {
                let extMobile = await User.findOne({ mobile })
                if(!extMobile)
                   return res.status(StatusCodes.CONFLICT).json({ msg: `${mobile} number doesn't exists.`, success: false })

                // compare the password
                let isMatch = await comparePassword(password,extMobile.password)
                if(!isMatch) 
                   return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Passwords are not matched`, success: false })

                // generate access token
                let authToken = createAccessToken({ id: extMobile._id })

                // set the token in cookies
                res.cookie('loginToken', authToken, {
                    httpOnly: true,
                    signed: true,
                    path: `/api/auth/token`,
                    maxAge: 1 * 24 * 60 * 60 * 1000
                })

                res.status(StatusCodes.OK).json({ msg: `Login success(mobile)`, authToken, success: true })
            }
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message, success: false })
        }
    },
    logout: async (req,res) => {
        try {
            // clear cookies
            res.clearCookie('loginToken', { path: `/api/auth/token` })

            res.status(StatusCodes.OK).json({ msg: `logout successfully`, success: true })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message, success: false })
        }
    },
    authToken: async (req,res) => {
        try {
            // read the login token from signed cookies
            const rToken = req.signedCookies.loginToken

            if(!rToken)
               return res.status(StatusCodes.NOT_FOUND).json({ msg: `token not available`, success: false })

            // valid user id or not
            await jwt.verify(rToken, process.env.ACCESS_SECRET, (err,user) => {
                if(err)
                   return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `UnAuthorized... login again`, success: false })

                // if valid token
                res.status(StatusCodes.OK).json({ authToken: rToken, success: true })
            })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message, success: false })
        }
    },
    currentUser: async (req,res) => {
        try {
            let single = await User.findById({ _id: req.userId }).select('-password')
                if(!single) 
                   return res.status(StatusCodes.NOT_FOUND).json({ msg: `user info not found`, success: false })

            res.status(StatusCodes.ACCEPTED).json({ user: single, success: true })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message, success: false })
        }
    },
    verifyUser: async (req, res) => {
        try {
            let {email} = req.body
                // read  the user info through email
            let extEmail = await User.findOne({ email })
                if(!extEmail)
                   return res.status(StatusCodes.CONFLICT).json({ msg: `${email} doesn't exists`, success: false })

            res.status(StatusCodes.ACCEPTED).json({ msg: 'Email id verified successfully', success: true})
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
        }
    },
    passwordLink: async (req, res) => {
        try {
            let {email} = req.body
            let extEmail = await User.findOne({ email })
            if(!extEmail)
               return res.status(StatusCodes.CONFLICT).json({ msg: `${email} doesn't exists`, status: false })

            // password token
            let passToken = createAccessToken({id: extEmail._id})

            // password reset template
            let passTemplate = reset_password(extEmail.name, email, passToken )

            // email subject
            let subject = `Reset Your Password`

            // send email
            let emailRes = await mailConfig(email,subject,passTemplate)

            res.status(StatusCodes.ACCEPTED).json({ msg: `password link successfully sent.`, status: emailRes, success: true, token: passToken })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
        }
    },
    updatePassword: async (req, res) => {
        try {
            let id = req.userId
            let { password } = req.body

            let extUser = await User.findById({ _id: id })
                if(!extUser) 
                   return res.status(StatusCodes.CONFLICT).json({ msg: `Requested user info not exists.`, success: false })
                
            // encrypt the password into hash
            const encPass = await bcrypt.hash(password,10);

            // update the password
            await User.findByIdAndUpdate({ _id: id }, { password: encPass })

            // email subject
            let subject = `Password Update`
            let msg = `You have Successfully Updated the Password. Your new password is = ${password}`;
 
            // register confirm template
            let confirm_template = confirm_temp(extUser.name, extUser.email, subject, msg)
 
            // send email
            let emailRes = await mailConfig(extUser.email,subject,confirm_template)

            return res.status(StatusCodes.ACCEPTED).json({  msg: `Password successfully updated`, success: true, emailRes })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
        }
    }
}

module.exports = authController 