const User = require('../model/userModel')

// read all users
const readAll = async (req,res) => {
    try {
        res.json({ msg: 'read all' })
    } catch (err) {
        res.json({ msg: err })
    }
}

// read single user
const readSingle = async (req,res) => {
    try {
        res.json({ msg: 'read all' })
    } catch (err) {
        res.json({ msg: err })
    }
}

// update user
const updateUser = async (req,res) => {
    try {
        res.json({ msg: 'read all' })
    } catch (err) {
        res.json({ msg: err })
    }
}

// delete user
const deleteUser = async (req,res) => {
    try {
        res.json({ msg: 'read all' })
    } catch (err) {
        res.json({ msg: err })
    }
}

module.exports = { readAll, readSingle, updateUser, deleteUser }