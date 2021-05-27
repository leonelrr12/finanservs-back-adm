const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const { S3_ENDPOINT, BUCKET_NAME } = process.env

const spacesEnpoint = new aws.Endpoint(S3_ENDPOINT)

const s3 = new aws.S3({
  endpoint: spacesEnpoint
})

const upload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, {
        fieldname: file.fieldname
      })
    },
    key: (req, file, cb) => {
      // console.log(file)
      cb(null, file.originalname)
    }
  })
}).single('idUrl')


module.exports = { upload, s3 }