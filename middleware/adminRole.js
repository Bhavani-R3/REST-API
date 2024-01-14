const { StatusCodes } = require("http-status-codes")
const User = require('../model/userModel')

const adminAuth = async (req,res,next) => {
    try {
        let userId = req.userId
        let extUser = await User.findById(userId)

        return res.json({ extUser })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}

module.exports = adminAuth