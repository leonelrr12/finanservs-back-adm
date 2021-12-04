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



fileRoutes.get('/prospectsPDF/:entity_f', async (req, res) => {

    const { entity_f } = req.params

    let sql = "SELECT a.id, a.name, id_personal as cedula, a.email, a.cellphone as celular, a.phoneNumber as telefono,"
    sql += " date_format(fcreate, '%d/%m/%Y')  as fecha,"
    sql += " loanPP as monto, e.name as sector, c.name estado, o.name as ejecutivo, comentarios"
    sql += " FROM finanservs.prospects a"
    sql += " INNER JOIN finanservs.estados_tramite c ON c.id=a.estado"
    sql += " LEFT JOIN finanservs.sectors e ON e.id=a.jobSector"
    sql += " LEFT JOIN finanservs.users o ON o.id=a.ejecutivo"
    sql += " WHERE a.entity_f = ?"
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

      const hoyes = new Date().toUTCString()

      const datosRef = [
        [
          { style: ['blueWhite', 'center'], text: 'ID' }, 
          { style: 'blueWhite', text: 'Nombre' }, 
          { style: 'blueWhite', text: 'Cédula' }, 
          { style: 'blueWhite', text: 'Email' }, 
          { style: 'blueWhite', text: 'Celular' }, 
          { style: 'blueWhite', text: 'Teléfono' }, 
          { style: ['blueWhite', 'center'], text: 'Fecha'}, 
          { style: ['blueWhite', 'right'], text: 'Monto'}, 
          { style: ['blueWhite', 'center'], text: 'Sector' },
          { style: 'blueWhite', text: 'Ejecutivo' },
          { style: ['blueWhite', 'center'], text: 'Estado' },
          { style: 'blueWhite', text: 'Comentarios' },
        ],
      ]
      
      let cnt = 0, cna = 0, cnr = 0;
      rows.forEach(r => {
        cnt += 1;
        if(r.estado === 'Rechazado') cnr += 1
        if(r.estado === 'Aprobado') cna += 1
        datosRef.push([
          { style: ['small', 'center'], text: r.id }, 
          { style: 'small', text: r.name }, 
          { style: 'small', text: r.cedula }, 
          { style: 'small', text: r.email }, 
          { style: 'small', text: r.celular }, 
          { style: 'small', text: r.telefono }, 
          { style: ['small', 'center'], text: r.fecha }, 
          { style: ['small', 'right'], text: separator(r.monto) }, 
          { style: ['small', 'center'], text: r.sector }, 
          { style: ['small', 'left'], text: r.ejecutivo }, 
          { style: ['small', 'center'], text: r.estado }, 
          { style: 'small', text: r.comentarios }
        ])
      })

      const dd = {
        pageSize: 'LETTER',
        pageMargins: 20,
        pageOrientation: 'landscape',
  
        content: [
          {
            text: 'Inform de Prospectos',
            style: 'header'
          },
          { 
            text: 'Periodo de: xx/xx/xxxx a xx/xx/xxx', 
            style: { fontSize: 8, alignment: 'center', color: 'blue' } 
          },
          {
            layout: 'noBorders', 
            table: {
              widths: [600, 110],
              body: [  
                [
                  { style: 'small1', alignment: 'right', text: 'Fecha: ' }, 
                  { style: 'small1', text: hoyes }],
              ]
            }
          },
          {
            layout: 'noBorders', // lightHorizontalLines noBorders lightVerticalLines
            // style: 'blueWhite',
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              // headerRows: 2,
              // widths: [ '*', 'auto', 100, '*' ],
           
              widths: [ 20, 80, 50, 80, 50, 50, 40, 50, 40, 50, 50, '*' ],
              body: datosRef
            }
          },
          '\n\n',
          {
            layout: 'noBorders', 
            table: {
              widths: [80, 30, 80, 30, 80, 30],
              body: [  
                [
                  { style: 'blueWhite', text: 'Total prospectos:' }, { text: cnt, style: 'small1' },
                  { style: 'blueWhite', text: 'Aprobadoss:' }, { text: cna, style: 'small1' },
                  { style: 'blueWhite', text: 'Rechazados:' }, { text: cnr, style: 'small1' },
                ],
              ]
            }
          },
        ],
        footer: function(currentPage, pageCount) { return currentPage.toString() + ' de ' + pageCount; },
        // defaultStyle: {
        //   lineHeight: 2
        // },
        info: {
          title: 'Listado de Prospectos',
          author: 'Leonel Rodríguez R.',
          subject: 'finanservs.comt',
          keywords: 'finanservs',
        },
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: 'center'
          },
          subheader: {
            fontSize: 10,
            bold: true
          },
          quote: {
            italics: true
          },
          small0: {
            fontSize: 7,
            fillColor: '#dddddd',
          },
          small1: {
            fontSize: 7,
          },
          small: {
            fontSize: 7,
            fillColor: '#ffffff',
          },
          blueWhite: {
            fillColor: '#0d6efd',
            color: 'white',
            fontSize: 8,
            bold: true
          },
          center: {
            alignment: 'center'
          },
          right: {
            alignment: 'right'
          }
        }
      }
  
      var fonts = {
        Roboto: {
            normal: './public/fonts/Roboto-Regular.ttf',
            bold: './public/fonts/Roboto-Medium.ttf',
            italics: './public/fonts/Roboto-Italic.ttf',
            bolditalics: './public/fonts/Roboto-MediumItalic.ttf'
        }
      };
  
      let fileName = path.join(__dirname + `/pdfs/prospect-${entity_f}.pdf`)
  
      const printer = new pdfPrinter(fonts)
      const pdfDoc = printer.createPdfKitDocument(dd);

      pdfDoc.pipe(fs.createWriteStream(fileName)).on('finish',function(){
        //success
      });
      
      pdfDoc.end();

      const file = fileName;

      const filename = path.basename(file);
   
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', 'application/pdf');

      var filestream = fs.createReadStream(file);
      filestream.pipe(res);

    } 
  })
})


module.exports = fileRoutes