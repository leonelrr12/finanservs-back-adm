const fileRoutes = require('express').Router()
const path = require('path')
const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
const fs = require('fs')
const config = require('../utils/config')
const { upload, s3 } = require("../utils/multer")


// let storage = multer.diskStorage({
//   destination: path.join(__dirname, '../../uploads'),
//   filename:(req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// })

// const upload = multer({ 
//   storage 
// }).single('idUrl')


fileRoutes.post('/file', upload ,(request, response) => {
  // console.log(`Store location is ${request.hostname}/${request.file.path}`)
  // console.log(request.file.location)
  // uploadS3(request)
  return response.send(request.file)
})

// const uploadS3 = (request) => {

//   const fileName = request.file.filename
//   const filePath = request.file.path
//   const {entity_f, prospect, nameImage} = request.body
//   const ext = fileName.split('.')[1]
  
//   // Quitar cuando se coloquen Claves validas de AWS
//   return
  
//   fs.readFile(filePath, (err, data) => {
//     if(err) throw err
//     const paramsPut = {
//       Bucket: 'finanservs',
//       Key: `prospects/${entity_f}/${prospect}/${nameImage}.${ext}`,
//       Body: data
//     }
//     s3.putObject(paramsPut, (err, data) => {
//       if(err) throw err
//       console.log(data)
//     })
//   })

//   fs.unlinkSync(filePath)
// }

fileRoutes.get('/list', async (request, response) => {
  const { bucket, entity_f } = request.query
  console.log(bucket, entity_f);

  // Quitar cuando se coloquen Claves validas de AWS
  return response.status(200).json([])

  const params = {
    Bucket: bucket
  }

  s3.listObjectsV2(params, (err, data) => {
    if(err) throw err
    const newD = []
    data.Contents.map(item=>{
      const x = item.Key.split('/')
      if(x.length > 1) {
        if(x[1] === entity_f) {
          newD.push(item)
        }
      }
    })
    // console.log(newD)
    response.status(200).json(newD)
  })
})


fileRoutes.get('/file', async (request, response) => {
  let { bucket, key, name } = request.query

  // Quitar cuando se coloquen Claves validas de AWS
  return response.send('Ok')

  // name = 'prospects.cs'
  console.log('name', name, 'key', key);
  const params = {
    Bucket: bucket,
    Key: key
  }

  // response.attachment(name)
  // const file = s3.getObject(params).createReadStream()
  // file.pipe(response)

  s3.getObject(params, (err, data) => {
    if (err) throw err;

    fs.writeFile(__dirname + '../../../public/' + name, data.Body, 'binary', (err) => {
      if(err) throw err
      console.log(`Imagen deacargada al disco\n${__dirname}'/public/'`)

      response.send('Ok')
      // response.download(__dirname + '../../../public/' + name, name, function(err){
      //   if (err) {
      //     response.status(500).end()
      //     console.log(err);
      //   } else {
      //     response.status(201).end()
      //     console.log("ok");
      //   }
      // })

      // const file = fs.readFileSync(name); 
      // let base64data = file.toString('base64');
      // response.write(base64data); 
      // response.end();

      // const file = fs.readFileSync(__dirname + '../../../public/' + name, 'binary'); 
      // response.setHeader('Content-Length', file.length); 
      // response.write(file, 'binary'); 
      // response.end();
    })
  })

  return 
})

module.exports = fileRoutes