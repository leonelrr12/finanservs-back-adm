const fileRoutes = require('express').Router()
const path = require('path')
var mime = require('mime')
const multer = require('multer')
const aws = require('aws-sdk')
const fs = require('fs')
const config = require('../utils/config')
const logger = require('../utils/logger')

const pdfMake = require('pdfmake/build/pdfmake');
const pdfPrinter = require('pdfmake/src/printer');
const pdfFonts = require('pdfmake/build/vfs_fonts');


const separator = (numb) => {
  var str = numb.toString().split(".");
  if(str.length > 1) {
    str[1] = str[1].padEnd(2, '0')
  } else {
    str[1]='00'
  }
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}

const s3 = new aws.S3({
  // endpoint: "nyc3.digitaloceanspaces.com",
  accessKeyId: config.AWS_Access_key_ID,
  secretAccessKey: config.AWS_Secret_access_key
})

let storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename:(req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage 
}).single('idUrl')

fileRoutes.post('/file', upload ,(request, response) => {
  console.log(`Store location is ${request.hostname}/${request.file.path}`)
  uploadS3(request)
  return response.send(request.file)
})

const uploadS3 = (request) => {

  const fileName = request.file.filename
  const filePath = request.file.path
  const {entity_f, prospect, nameImage} = request.body
  const ext = fileName.split('.')[1]

  fs.readFile(filePath, (err, data) => {
    if(err) throw err
    const paramsPut = {
      Bucket: 'finanservs',
      Key: `prospects/${entity_f}/${prospect}/${nameImage}.${ext}`,
      Body: data
    }
    s3.putObject(paramsPut, (err, data) => {
      if(err) throw err
      console.log(data)
    })
  })

  fs.unlinkSync(filePath)
}

fileRoutes.get('/list', async (request, response) => {
  const { bucket, entity_f } = request.query
  console.log(bucket, entity_f);

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
})


fileRoutes.get('/prospectsPDF/:entity_f/:estado', async (req, res) => {

  const { entity_f, estado } = req.params

  let sql = "SELECT a.id, a.name, id_personal as cedula, a.email, a.cellphone as celular, a.phoneNumber as telefono,"
  sql += " date_format(fcreate, '%d/%m/%Y')  as fecha,"
  sql += " loanPP as monto, e.name as sector, c.name estado, o.name as ejecutivo, comentarios"
  sql += " FROM finanservs.prospects a"
  sql += " INNER JOIN finanservs.estados_tramite c ON c.id=a.estado"
  sql += " LEFT JOIN finanservs.sectors e ON e.id=a.jobSector"
  sql += " LEFT JOIN finanservs.users o ON o.id=a.ejecutivo"
  if(estado === '1') {
    sql += " WHERE a.entity_f = ? AND a.estado <> 4" 
  } else {
    sql += " WHERE a.entity_f = ?"
  }
  sql += " ORDER BY id_personal"

  const params = [entity_f];

  config.cnn.query(sql, params, (error, rows) => {
    if (error) {
      cnn.connect(error => {
        if (error) {
          logger.error('Error SQL:', error.message)
          res.status(500)
        }
        console.log('Database server runnuning!');
      })
    } 
    if (rows.length > 0) {
      return res.json(rows)
    } else {
      return res.json([])
    }
  })
})


fileRoutes.get('/datosProspect/:id', async (req, res) => {

  const { id } = req.params

  let sql = ""
  sql += " SELECT a.id, id_personal as cedula, a.fname, fname_2, a.lname, lname_2, a.email,"
  sql += " convert(datediff(now(), birthDate)/365, UNSIGNED) as edad, salary as salario, f.name as profesion,"
  sql += " a.cellphone as celular, a.phoneNumber as telefono,"
  sql += " CASE WHEN gender='female' THEN 'F' ELSE 'M' END as genero,"
  sql += " date_format(birthDate, '%d/%m/%Y') as fechaNac, a.work_name as trabActual, work_cargo as trabCargo,"
  sql += " work_address as trabDirección, work_phone as trabTelefono,"
  sql += " a.work_phone_ext as trabTelExt, k.name as estadoCivil,"
  sql += " h.name as provincia, i.name as distrito, j.name as corregimiento,"
  sql += " barrio_casa_calle as barrio_Casa_Calle,"
  sql += " barriada_edificio, calle, no_casa_piso_apto, c.name as estado,"
  sql += " date_format(fcreate, '%d/%m/%Y') as fechaSolicitud,"
  sql += " loanPP as monto, plazo, coalesce(monthlyPay, 0) as letra"
  sql += " FROM prospects a"
  sql += " INNER JOIN estados_tramite c ON c.id=a.estado"
  sql += " LEFT JOIN profesions f ON f.id=a.profession"
  sql += " LEFT JOIN provinces h ON h.id=a.province"
  sql += " LEFT JOIN districts i ON i.id=a.district"
  sql += " LEFT JOIN counties j ON j.id=a.county"
  sql += " LEFT JOIN civil_status k ON k.id=a.civil_status"
  sql += " WHERE a.id = ?"

  let sql2 = ""
  sql2 += " select concat(name,' ',apellido) as nombreCompleto,"
  sql2 += " cellphone as celular, parentesco as parentesco, coalesce(work_name,'N/A') as trabajo"
  sql2 += " from ref_person_family"
  sql2 += " where id_prospect = ?"
  sql2 += " union all "
  sql2 += " select concat(name,' ',apellido) as nombreCompleto,"
  sql2 += " cellphone as celular, parentesco as parentesco, coalesce(work_name,'N/A') as trabajo"
  sql2 += " from ref_person_no_family"
  sql2 += " where id_prospect = ?"

  let params = [id];

  config.cnn.query(sql, params, (error, rows) => {
    if (error) {
      cnn.connect(error => {
        if (error) {
          logger.error('Error SQL:', error.message)
          res.status(500)
        }
        console.log('Database server runnuning!');
      })
    } 
    if (rows.length > 0) {

      const prospect = rows[0]
      params = [id, id];

      config.cnn.query(sql2, params, (error, rows) => {
        if (error) {
          return res.json({"Info": prospect, "Refe": {}})
        } 
        if (rows.length > 0) {
          return res.json({"Info": prospect, "Refe": rows})
        } else {
          return res.json({"Info": prospect, "Refe": {}})
        }
      })
    } else {
      return res.json({"Info": {}, "Refe": {}})
    }

    return
  })
})

module.exports = fileRoutes