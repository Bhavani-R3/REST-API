const { StatusCodes } = require("http-status-codes")

const authController = {
    register: async (req,res) => {
        try {
            res.json({ msg: `register` })
        } catch(err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    login: async (req,res) => {
        try {
            res.json({ msg: `login` })
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