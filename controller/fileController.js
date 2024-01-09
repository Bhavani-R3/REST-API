const { StatusCodes } = require("http-status-codes")
const FileSchema = require('../model/fileModel')
const User = require('../model/userModel')

// upload - post + data
const uploadFile = async (req,res) => {
    try {
        const { product } = req.files
        const id = req.userId  

        // fetch user info
        let extUser = await User.findById({ _id: id }).select('-password')
        // if user not found
            if(!extUser)
               return res.status(StatusCodes.CONFLICT).json({ msg: `requested user id not found` })

        res.json({ product, extUser })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}

// read all - get
const readAll = async (req,res) => {
    try {
        res.json({ msg: "read all" })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}

// read single get + ref
const readSingle = async (req,res) => {
    try {
        res.json({ msg: "read single" })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}

// delete -delete + ref
const deleteFile = async (req,res) => {
    try {
        res.json({ msg: "delete file" })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}

module.exports = { uploadFile, readAll, readSingle, deleteFile }