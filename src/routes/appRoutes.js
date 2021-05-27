const appRoutes = require('express').Router()
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const config = require('../utils/config')
const America = require('../data/America')
const Beny = require('../data/Beny')
const Joann = require('../data/Joann')
const Maribet = require('../data/Maribet')
const Milagros = require('../data/Milagros')



appRoutes.get('/', (request, response) => {
  response.send('Hola Mundo!!!')
})

appRoutes.get('/today-is', (request, response) => {
  const dt1 = new Date()
  const dt2 = new Intl.DateTimeFormat('es-ES',{dateStyle: 'full'}).format(dt1)
  response.json({ hoyes: dt2 })
})


appRoutes.get('/APC', (request, response) => {
  // response.json(America())
  // response.json(Beny())
  // response.json(Joann())
  response.json(Maribet())
  // response.json(Milagros())
})


appRoutes.get('/APC-BK', (request, response) => {
  response.json([
    {
      institucion: "GLOBAL BANK",
      referencia: "2018223030",
      tipoObligacion: "HIPOTECA",
      saldoActual: 74216.20,
      letra: 312.12,
      formaPago: "DESCUENTO DIRECTO",
      diasAtraso: "0",
      contometro: "1".repeat(24),
      score: 0
    },
    {
      institucion: "BANISTMO",
      referencia: "2019569157",
      tipoObligacion: "PREST. AUTO",
      saldoActual: 5000.00,
      letra: 50.00,
      formaPago: "DESCUENTO DIRECTO",
      diasAtraso: "0",
      contometro: "1".repeat(20)+"2233",
      score: 0
    },
    {
      institucion: "BANISI",
      referencia: "2019569156",
      tipoObligacion: "PREST. PERSONAL",
      saldoActual: 14005.70,
      letra: 100.00,
      formaPago: "DESCUENTO DIRECTO",
      diasAtraso: "0",
      contometro: "1".repeat(20)+"3333",
      score: 0
    },
    {
      institucion: "GENERAL",
      referencia: "2019569159",
      tipoObligacion: "PREST. PERSONAL",
      saldoActual: 600.00,
      letra: 50.00,
      formaPago: "PAGOS VOLUNTARIOS",
      diasAtraso: "0",
      contometro: "1".repeat(24),
      score: 0
    },
    {
      institucion: "BANISI",
      referencia: "2019569160",
      tipoObligacion: "TARJ. CREDITO",
      saldoActual: 500.00,
      letra: 27.00,
      formaPago: "DESCUENTO DIRECTO",
      diasAtraso: "0",
      contometro: "1".repeat(24),
      score: 0
    },
])
})


appRoutes.post('/APC', (request, response) => {


  // https://estebanfuentealba.wordpress.com/2010/01/09/crear-dll-en-c-net-y-llamarla-desde-javascript/
  //   <html>
  //     <head>
  //         <script type="text/javascript">
  //             /* Creando una instancia de ActiveXObject para poder acceder a nuestra libreria */
  //             var obj = new ActiveXObject("TestLib.Class"); /* ProgId de la Clase */
  //             alert(obj.Hola()); /* llamando al metodo Hola de la DLL */
  //         </script>
  //     </head>
  //     <body>
  //         <!-- Cuerpo -->
  //     </body>
  // </html>


  const { usuario, clave, cliente, tipo, producto } = request.body
  
  //   <GetScore xmlns="https://www.apc.com.pa/Webservices/classicScorePlusService">

    let sr = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xsd="http://www.w3.org/2001/XMLSchema">
      <soap:Body>
      <GetScore xmlns="https://www.apc.com.pa/Webservices">
      <usuarioconsulta>${usuario}</usuarioconsulta>
      <claveConsulta>${clave}</claveConsulta>
      <IdentCliente>${cliente}</IdentCliente>
      <TipoCliente>${tipo}</TipoCliente>
      <Producto>${producto}</Producto>
      </GetScore>
      </soap:Body>
      </soap:Envelope>`

    let xmlhttp = new XMLHttpRequest()
    xmlhttp.open('post',"https://www.apc.com.pa/Webservices", true )
    // xmlhttp.open('post',"https://www.mozilla.org/es-ES/", true )
    // xmlhttp.onreadystatechange = function () {
    //     if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    //         console.log(xmlhttp.responseText);
    //     }
    // };
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.send(sr); 

    console.log('Paso 4');
    // 4. Esto se llamará después de que la respuesta se reciba
    xmlhttp.onload = function() {
      console.log('xmlhttp.status',xmlhttp.status);
      if (xmlhttp.status != 200) { // analiza el estado HTTP de la respuesta
        console.log(`Error ${xmlhttp.status}: ${xmlhttp.statusText}`); // ej. 404: No encontrado
      } else { // muestra el resultado
        console.log(`Hecho, obtenidos ${xmlhttp.responseText.length} bytes`); // Respuesta del servidor
        // console.log(xmlhttp.responseText);
      }
    }

    response.send('Finish!')
})

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////


appRoutes.get('/sectors', (request, response) => {
  const sql = "SELECT * FROM sectors"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/profesions', (request, response) => {
  const sql = "SELECT * FROM profesions"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/profesions_acp', (request, response) => {
  const sql = "SELECT id, titulo as name FROM profesions_acp"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/profesions_lw', (request, response) => {
  const sql = "SELECT id, titulo as name FROM profesions_lw"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/planillas_j', (request, response) => {
  const sql = "SELECT * FROM planillas_j"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/ranges_pol', (request, response) => {
  const sql = "SELECT id, name FROM ranges_pol WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/laboral_sector_institution', (request, response) => {
  const sql = "SELECT * FROM institutions"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/laboral_sector', (request, response) => {
  let sql = "select a.id_profesion as id, short_name as sector, id_sector, c.name as name"
  sql += " from sector_profesion a"
  sql += " inner join sectors b on b.id=a.id_sector"
  sql += " inner join profesions c on c.id=a.id_profesion"
  sql += " where is_active = true;"
  
  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/laboral_sector_entity_f', (request, response) => {
  // let sql = "select a.id_code, b.id, short_name as sector, c.id, c.name as name,"
  let sql = "select id_ruta as ruta, id_sector, id_profesion,"
  sql += " descto_ship as discount_capacity,"
  sql += " descto_chip as discount_capacity_mortgage,"
  sql += " deuda_ship as debt_capacity,"
  sql += " deuda_chip as debt_capacity_mortgage,"
  sql += " plazo_max,"
  sql += " tasa,"
  sql += " comision,"
  sql += " mount_min,"
  sql += " mount_max"
  sql += " from entity_params a"
  sql += " inner join entities_f d on d.id = a.id_entity_f"
  sql += " inner join sector_profesion b on b.id=a.id_sector_profesion"
  // sql += " where a.id_entity_f = ? and a.id_code = ? and a.id_profesion = ?"

  const params = [request.params.id,  request.params.id2, request.params.id3];

  config.cnn.query(sql, params, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/laboral_status', (request, response) => {
  const sql = "SELECT name, is_active FROM laboral_status  WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/payment_types', (request, response) => {
  const sql = "SELECT * FROM payments"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

// OWNER = '1',
// PARENTS = '2',
// MORTGAGE = '3',
// RENT = '4'

appRoutes.get('/housing_types', (request, response) => {
  const sql = "SELECT * FROM housings  WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

// CAR_PURCHASE = '0',
// WEDDING = '1',
// HOME_IMPROVEMENTS = '2',
// SCHOOL = '3',
// TRAVEL = '4',
// TEENAGE_PARTY = '5'

appRoutes.get('/purpose', (request, response) => {
  const sql = "SELECT * FROM purposes WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/marital_status', (request, response) => {
  const sql = "SELECT id, name FROM civil_status"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})



appRoutes.get('/provinces', (request, response) => {
  const sql = "SELECT * FROM provinces"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/districts', (request, response) => {
  const sql = "SELECT * FROM districts"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/counties', (request, response) => {
  const sql = "SELECT * FROM counties"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/type_documents', (request, response) => {
  const sql = "SELECT id, name, id_name FROM type_documents WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/terms_loan', (request, response) => {
  const sql = "SELECT id, name FROM terms_loan WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/nationality', (request, response) => {
  const sql = "SELECT id, name FROM nationality WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/entities_f', (request, response) => {
  const sql = "SELECT id, name, id_ruta FROM entities_f WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

appRoutes.get('/sector_profesion', (request, response) => {
  let sql = "SELECT a.id, concat(b.name, ' - ', c.name) as name"
  sql += " FROM sector_profesion a"
  sql += " INNER JOIN sectors b ON b.id = a.id_sector"
  sql += " INNER JOIN profesions c ON c.id = a.id_profesion"
  sql += " WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})


module.exports = appRoutes