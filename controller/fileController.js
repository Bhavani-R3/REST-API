const { StatusCodes } = require("http-status-codes")
const FileSchema = require('../model/fileModel')
const User = require('../model/userModel')
const path = require('path')
const fs = require('fs')
const fileType = require('../util/fileExt')

// remove tempfiles
const removeTemp = (filePath) => {
    fs.unlinkSync(filePath)
}

// upload - post + data
const uploadFile = async (req,res) => {
    try {
        const { product } = req.files
        /* // to get file extension
        let fileExt = path.extname(product.name)
        return res.json({ fileExt, product }) */

        const id = req.userId 

        // check the folder if folder not exists create it
        const outPath = path.join(__dirname, '../public')
        if(!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath, { recursive: true })
        }

        // no files are attached
        if(!req.files)
            return res.status(StatusCodes.NOT_FOUND).json({ mag: `No files to upload..`, success: false })

        // fetch user info
        let extUser = await User.findById({ _id: id }).select('-password')
        // if user not found
            if(!extUser) {
                removeTemp(product.tempFilePath)
                return res.status(StatusCodes.CONFLICT).json({ msg: `requested user id not found`, success: false })
            }            

        // validate the file ext
        /* if(product.mimetype === "image/png" || product.mimetype === "image/jpeg" || product.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ) */
        if(product.mimetype === fileType.docx || product.mimetype === fileType.pptx || product.mimetype === fileType.doc || product.mimetype === fileType.ppt || product.mimetype === fileType.pdf || product.mimetype === fileType.png || product.mimetype === fileType.jpeg) {
            
            // rename the file -> doc-1704967580459.pdf
            let ext = path.extname(product.name)
            let filename = `doc-${Date.now()}${ext}`
        

            // store the file in physical location
            await product.mv(path.resolve(__dirname, `../public/${filename}`), async (err) => {
                if(err) {
                    removeTemp(req.files.product.tempFilePath)
                    return res.status(StatusCodes.CONFLICT).json({ msg: err })
                }
                    // add file info to db collection
                let fileRes = await FileSchema.create(
                    { userId: extUser._id,
                      newName: filename, 
                      extName: ext,
                      user: extUser,
                      info: product })
                
                    // final response
                res.status(StatusCodes.ACCEPTED).json({ msg: "File uploaded successfully", file: fileRes, success: true })
            })
        } else {
            removeTemp(req.files.product.tempFilePath)
            return res.status(StatusCodes.CONFLICT).json({ msg: `upload only .pdf, .doc, .docx, .ppt, .pptx, .png, .jpeg files`, success: false})
        }
    } catch (err) {
        removeTemp(req.files.product.tempFilePath)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
    }
}

// read all (belongs to respective login user) - get
const readAll = async (req,res) => {
    try {
        let files = await FileSchema.find({})
        let filtered = files.filter((item) => item.userId === req.userId)
        res.status(StatusCodes.OK).json({ length: files.length, files: filtered, success: true })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
    }
}

// read single get + ref
const readSingle = async (req,res) => {
    try {
        let fileId = req.params.id
        let userId = req.userId

        let extFile = await FileSchema.findById({ _id: fileId })
            if(!extFile)
               return res.status(StatusCodes.CONFLICT).json({ msg: `Requested file id not exists`, success: false })

            // if file belongs to authorized user or not
            if(userId !== extFile.userId)
              return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Unauthorized file read..`, success: false })

        res.status(StatusCodes.ACCEPTED).json({ file: extFile, success: true })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
    }
}

// delete -delete + ref
const deleteFile = async (req,res) => {
    try {
        let fileId = req.params.id
        let userId = req.userId

        // read existing file data ref to id
        let extFile = await FileSchema.findById({ _id: fileId })
        if(!extFile)
           return res.status(StatusCodes.CONFLICT).json({ msg: `Requested file id not exists`, success: false })

        // if file belongs to authorized user or not
        if(userId !== extFile.userId)
          return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Unauthorized file read..`, success: false })

        // delete physical file from directory
        let filePath =  path.resolve(__dirname, `../public/${extFile.newName}`)

        if(fs.existsSync(filePath)) {
            // to delete the file
            await fs.unlinkSync(filePath)
            // to remove file info in db collection
            await FileSchema.fileByIdAndDelete({ _id: extFile._id })

            return res.status(StatusCodes.ACCEPTED).json({ msg: 'file deleted successfully', success: true })
        } else {
            return res.json({ msg: 'file not exists', extFile, success: false})
        }
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
    }
}

// to read all file contents without authentication
const allFiles = async (req,res) => {
    try {
        let files = await FileSchema.find({})

        res.status(StatusCodes.OK).json({ length: files.length, files, success: true })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
    }
}

const filterType = async (req,res) => {
    try {
        let data = req.query
        let files = await FileSchema.find({})

        if(data.type === "all") {
            res.status(StatusCodes.OK).json({ data, length: files.length, files, success: true })
        } else {
            let filtered = files.filter((item) => item.extName === `.${data.type}`)
            res.status(StatusCodes.OK).json({ data, length: filtered.length, filtered, success: true })
        }
        
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err, success: false })
    }

} 

module.exports = { uploadFile, readAll, readSingle, deleteFile, allFiles, filterType }