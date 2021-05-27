const admRoutes = require('express').Router()
const bcrypt = require('bcryptjs')
const config = require('../utils/config')
const logger = require('../utils/logger')


admRoutes.get('/', (request, response) => {
  response.send('Hola Mundo!!! Desde Admin Routes')
})



admRoutes.get('/prospects', (request, response) => {
  sql  = " SELECT a.id as 'ID', c.name as Estado, datediff(now(), fcreate) as 'Dias Antiguedad' ,id_personal as 'Cédula Id', a.name as Nombre,"
  sql += " e.name as 'Sector',f.name as Profesión, CASE WHEN profession=5 THEN m.titulo  ELSE n.titulo END as 'Ocupación',"
  sql += " salary as Salario, d.name as 'Contrato Trabajo', email as Email,"
  sql += " a.cellphone as Celular, phoneNumber as Telefono, b.name as Entidad, "
  sql += " CASE WHEN gender='female' THEN 'Mujer' ELSE 'Hombre' END as Genero, birthDate as 'Fecha Nacimiento',"
  sql += " l.name as 'Fecuencia Pago', g.name as 'Tipo Residencia',"
  sql += " k.name as 'Estado Civil', h.name as Provincia, i.name as Distrito, '' as Corregimiento,"
  sql += " fcreate as 'Creado el'"
  sql += " FROM prospects a"
  sql += " INNER JOIN entities_f b ON b.id_ruta=a.entity_f"
  sql += " INNER JOIN estados_tramite c ON c.id=a.estado"
  sql += " LEFT JOIN profesions_acp m ON m.id=a.occupation"
  sql += " LEFT JOIN profesions_lw n ON n.id=a.occupation"
  sql += " LEFT JOIN laboral_status d ON d.id=a.contractType"
  sql += " LEFT JOIN sectors e ON e.id=a.jobSector"
  sql += " LEFT JOIN profesions f ON f.id=a.profession"
  sql += " LEFT JOIN housings g ON g.id=a.residenceType"
  sql += " LEFT JOIN provinces h ON h.id=a.province"
  sql += " LEFT JOIN districts i ON i.id=a.district"
  // sql += "LEFT JOIN counties j ON j.id=a.residenceType"
  sql += " LEFT JOIN civil_status k ON k.id=a.civil_status"
  sql += " LEFT JOIN payments l ON l.id=a.paymentFrecuency"

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

admRoutes.post('/prospects', (request, response) => {
  const sql = "INSERT INTO prospects (id_personal,idUser,name,fname,fname_2,lname,lname_2,entity_f,estado,email,cellphone,phoneNumber,idUrl,socialSecurityProofUrl,publicGoodProofUrl,workLetterUrl,payStubUrl,origin_idUser,gender,birthDate,contractType,jobSector,occupation,paymentFrecuency,profession,residenceType,civil_status,province,district,salary,fcreate,fupdate,quotation,application,sign,loanPP,loanAuto,loanTC,loanHip,cashOnHand,plazo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,now(),now(),?,?,?,?,?,?,?,?,?)"

  let {id_personal,idUser,name,fname,fname_2,lname,lname_2,entity_f,estado,email,cellPhone,phoneNumber,idUrl,socialSecurityProofUrl,publicGoodProofUrl,workLetterUrl,payStubUrl,origin_idUser,gender,birthDate,contractType,jobSector,occupation,paymentFrecuency,profession,residenceType,civil_status,province,district,salary,quotation,application,sign,loanPP,loanAuto,loanTC,loanHip,cashOnHand,plazo} = request.body

  estado = 1 // Nuevo registro queda con estatus de nuevo
  birthDate = birthDate.slice(0,10)
  const params = [id_personal,idUser,name,fname,fname_2,lname,lname_2,entity_f,estado,email,cellPhone,phoneNumber,idUrl,socialSecurityProofUrl,publicGoodProofUrl,workLetterUrl,payStubUrl,origin_idUser,gender,birthDate,contractType,jobSector,occupation,paymentFrecuency,profession,residenceType,civil_status,province,district,salary,quotation,application,sign,loanPP,loanAuto,loanTC,loanHip,cashOnHand,plazo]

  // console.log(request.body);
  // console.log(params);
  // response.send('Ok!')

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.get('/prospects/:id', (request, response) => {

  const sql = "SELECT * FROM prospects WHERE id = ?;"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
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

admRoutes.get('/prospects_sign/:id', (request, response) => {

  const sql = "SELECT sign FROM prospects WHERE id = ?;"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
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


admRoutes.get('/prospects/aproach/:id_personal', (request, response) => {
  let sql = "select a.id,	id_personal, idUser, a.name, fname, fname_2, lname,"
  sql += " lname_2, b.name as entity, email ,a.cellphone,	phoneNumber,"
  sql += " idUrl as imag_id, socialSecurityProofUrl as 'Ficha Seguro Social',"
  sql += " publicGoodProofUrl as 'Recibo Entidad Publica', workLetterUrl as 'Carta de Trabajo',"
  sql += " payStubUrl as 'Comprobante de Pago',	origin_idUser, gender, birthDate, contractType,	"
  sql += " jobSector,	occupation,	paymentFrecuency,	profession,	residenceType,"
  sql += " civil_status, province, district, salary, fcreate, fupdate,"
  sql += " c.name as estado, fcreate, datediff(now(), fcreate) as dias,"
  sql += " quotation,	application, sign ,loanPP, loanAuto, loanTC, loanHip, cashOnHand,plazo"
  sql += " FROM prospects a"
  sql += " INNER JOIN entities_f b ON b.id_ruta=a.entity_f"
  sql += " INNER JOIN estados_tramite c ON c.id=a.estado"
  sql += " WHERE id_personal = ?"

  const params = [request.params.id_personal];
  config.cnn.query(sql, params, (error, results) => {
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

admRoutes.get('/prospects/entity_f/:entity_f', (request, response) => {
  // sql += " idUrl as imag_id,	socialSecurityProofUrl as 'Ficha Seguro Social', payStubUrl as 'Comprobante de Pago',"
  // sql += " publicGoodProofUrl as 'Recibo Entidad Publica',	workLetterUrl as 'Carta de Trabajo',"
  // sql += " quotation,	application,	sign"

  sql  = " SELECT a.id as 'ID', c.name as Estado, datediff(now(), fcreate) as 'Dias Antiguedad' ,id_personal as 'Cédula Id', a.name as Nombre,"
  sql += " e.name as 'Sector',f.name as Profesión, CASE WHEN profession=5 THEN m.titulo  ELSE n.titulo END as 'Ocupación',"
  sql += " salary as Salario, loanPP as 'Préstamo Personal', cashOnHand as 'Efectivo en Mano', plazo as Plazo,  loanAuto as 'Préstamo Automóvil', loanTC as 'Préstamo TC', loanHip as 'Préstamo Hipoteca',"
  sql += " d.name as 'Contrato Trabajo', email as Email,"
  sql += " a.cellphone as Celular, phoneNumber as 'Télefono', b.name as Entidad, "
  sql += " CASE WHEN gender='female' THEN 'Mujer' ELSE 'Hombre' END as Genero, birthDate as 'Fecha Nacimiento',"
  sql += " l.name as 'Fecuencia Pago', g.name as 'Tipo Residencia',"
  sql += " k.name as 'Estado Civil', h.name as Provincia, i.name as Distrito, j.name as Corregimiento,"
  sql += " fcreate as 'Creado el'"
  sql += " FROM prospects a"
  sql += " INNER JOIN entities_f b ON b.id_ruta=a.entity_f"
  sql += " INNER JOIN estados_tramite c ON c.id=a.estado"
  sql += " LEFT JOIN profesions_acp m ON m.id=a.occupation"
  sql += " LEFT JOIN profesions_lw n ON n.id=a.occupation"
  sql += " LEFT JOIN laboral_status d ON d.id=a.contractType"
  sql += " LEFT JOIN sectors e ON e.id=a.jobSector"
  sql += " LEFT JOIN profesions f ON f.id=a.profession"
  sql += " LEFT JOIN housings g ON g.id=a.residenceType"
  sql += " LEFT JOIN provinces h ON h.id=a.province"
  sql += " LEFT JOIN districts i ON i.id=a.district"
  sql += " LEFT JOIN counties j ON j.id=a.residenceType"
  sql += " LEFT JOIN civil_status k ON k.id=a.civil_status"
  sql += " LEFT JOIN payments l ON l.id=a.paymentFrecuency"
  sql += " WHERE entity_f = ?;"

  const params = [request.params.entity_f];

  config.cnn.query(sql, params, (error, results) => {
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

admRoutes.get('/prospects/entity_f/:entity_f/:id', (request, response) => {
  let sql = "SELECT id, estado FROM prospects WHERE id = ?;"

  const params = [request.params.id];
 
  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
})

admRoutes.put('/prospects/entity_f', (request, response) => {
  const sql = "UPDATE prospects SET estado=?, fupdate=now() WHERE id = ?"
  
  const body = request.body
  const params = [body.estado, body.id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})
 


admRoutes.get('/sectors', (request, response) => {
  const sql = "SELECT * FROM sectors"

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

admRoutes.get('/sectors/:id', (request, response) => {
  const sql = "SELECT * FROM sectors WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/sectors', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM sectors"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO sectors (id, name, short_name) VALUES (?, ?, ?)"

    const {name, short_name} = request.body
    const params = [id, name, short_name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/sectors', (request, response) => {
  const sql = "UPDATE sectors SET name=?, short_name=? WHERE id = ?"

  const {id, name, short_name} = request.body
  const params = [name, short_name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/sectors/:id', (request, response) => {
  const sql = "DELETE FROM sectors WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/civilstatus', (request, response) => {
  const sql = "SELECT * FROM civil_status"

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

admRoutes.get('/civilstatus/:id', (request, response) => {
  const sql = "SELECT * FROM civil_status WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/civilstatus', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM civil_status"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO civil_status (id, name) VALUES (?, ?)"

    const {name} = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/civilstatus', (request, response) => {
  const sql = "UPDATE civil_status SET name=? WHERE id = ?"

  const {id, name} = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/civilstatus/:id', (request, response) => {
  const sql = "DELETE FROM civil_status WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/profesions', (request, response) => {
  const sql = "SELECT * FROM profesions"

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

admRoutes.get('/profesions/:id', (request, response) => {
  const sql = "SELECT * FROM profesions WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/profesions', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM profesions"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO profesions (id, name) VALUES (?, ?)"

    const {name} = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/profesions', (request, response) => {
  const sql = "UPDATE profesions SET name=? WHERE id = ?"

  const {id, name} = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/profesions/:id', (request, response) => {
  const sql = "DELETE FROM profesions WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/profesions_lw', (request, response) => {
  const sql = "SELECT count(id) totalRecord FROM profesions_lw"

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

admRoutes.get('/profesions_lw/:page/:linePage', (request, response) => {
  // const sql = "SELECT id, titulo as name FROM profesions_lw LIMIT ?, ?"
  const sql = "SELECT id, titulo as name FROM profesions_lw"
  const page = parseInt(request.params.page)
  const linePage = parseInt(request.params.linePage)
  const params = [page, linePage]

  console.log(params);
  // config.cnn.query(sql, params, (error, results) => {
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

admRoutes.get('/profesions_lw/:id', (request, response) => {
  const sql = "SELECT id, titulo as name FROM profesions_lw WHERE id = ?"
  const params = [request.params.id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/profesions_lw', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM profesions_lw"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO profesions_lw (id, titulo) VALUES (?, ?)"

    const {name} = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/profesions_lw', (request, response) => {
  const sql = "UPDATE profesions_lw SET titulo=? WHERE id = ?"
  const {id, name} = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/profesions_lw/:id', (request, response) => {
  const sql = "DELETE FROM profesions_lw WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/institutions', (request, response) => {
  const sql = "SELECT * FROM institutions"

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

admRoutes.get('/institutions/:id', (request, response) => {
  const sql = "SELECT * FROM institutions WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/institutions', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM institutions"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO institutions (id, name) VALUES (?, ?)"

    const {name} = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/institutions', (request, response) => {
  const sql = "UPDATE institutions SET name=? WHERE id = ?"

  const {id, name} = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/institutions/:id', (request, response) => {
  const sql = "DELETE FROM institutions WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/planillas_j', (request, response) => {
  const sql = "SELECT * FROM planillas_j"

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

admRoutes.get('/planillas_j/:id', (request, response) => {
  const sql = "SELECT * FROM planillas_j WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/planillas_j', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM planillas_j"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO planillas_j (id, name) VALUES (?, ?)"

    const {name} = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/planillas_j', (request, response) => {
  const sql = "UPDATE planillas_j SET name=? WHERE id = ?"

  const {id, name} = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/planillas_j/:id', (request, response) => {
  const sql = "DELETE FROM planillas_j WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/housings', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM housings"

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

admRoutes.get('/housings/:id', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM housings WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/housings', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM housings"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO housings (id, name, is_active) VALUES (?, ?, ?)"

    const {name, is_active} = request.body
    const params = [id, name, is_active === 'Si' ? true : false];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/housings', (request, response) => {
  const sql = "UPDATE housings SET name=?, is_active=? WHERE id = ?"

  const {id, name, is_active} = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/housings/:id', (request, response) => {
  const sql = "DELETE FROM housings WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/purposes', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM purposes"

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

admRoutes.get('/purposes/:id', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM purposes WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/purposes', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM purposes"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO purposes (id, name, is_active) VALUES (?, ?, ?)"

    const {name, is_active} = request.body
    const params = [id, name, is_active === 'Si' ? true : false];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/purposes', (request, response) => {
  const sql = "UPDATE purposes SET name=?, is_active=? WHERE id = ?"

  const {id, name, is_active} = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/purposes/:id', (request, response) => {
  const sql = "DELETE FROM purposes WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/payments', (request, response) => {
  const sql = "SELECT id, name FROM payments"

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

admRoutes.get('/payments/:id', (request, response) => {
  const sql = "SELECT id, name FROM payments WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/payments', (request, response) => {
  const sql = "SELECT max(id) + 1 as id FROM payments"
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    const { id } = results[0]

    const sql = "INSERT INTO payments (id, name) VALUES (?, ?)"

    const {name, is_active} = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  })
})

admRoutes.put('/payments', (request, response) => {
  const sql = "UPDATE payments SET name=? WHERE id = ?"

  const {id, name} = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/payments/:id', (request, response) => {
  const sql = "DELETE FROM payments WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/estados_tramite', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM estados_tramite"

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

admRoutes.get('/estados_tramite/:id', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM estados_tramite WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/estados_tramite', (request, response) => {
  const sql = "INSERT INTO estados_tramite (name, is_active) VALUES (?, ?)"

  const {name, is_active} = request.body
  const params = [id, name, is_active === 'Si' ? true : false];

  console.log(sql);
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.put('/estados_tramite', (request, response) => {
  const sql = "UPDATE estados_tramite SET name=?, is_active=? WHERE id = ?"

  const {id, name, is_active} = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/estados_tramite/:id', (request, response) => {
  const sql = "DELETE FROM estados_tramite WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/type_documents', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM type_documents"

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

admRoutes.get('/type_documents/:id', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM type_documents WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/type_documents', (request, response) => {
  const sql = "INSERT INTO type_documents (name, is_active) VALUES (?, ?)"

  const {name, is_active} = request.body
  const params = [id, name, is_active === 'Si' ? true : false];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.put('/type_documents', (request, response) => {
  const sql = "UPDATE type_documents SET name=?, is_active=? WHERE id = ?"

  const {id, name, is_active} = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/type_documents/:id', (request, response) => {
  const sql = "DELETE FROM type_documents WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/terms_loan', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM terms_loan"

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

admRoutes.get('/terms_loan/:id', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM terms_loan WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/terms_loan', (request, response) => {
    const sql = "INSERT INTO terms_loan (name, is_active) VALUES (?, ?)"

  const {name, is_active} = request.body
  const params = [id, name, is_active === 'Si' ? true : false];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.put('/terms_loan', (request, response) => {
  const sql = "UPDATE terms_loan SET name=?, is_active=? WHERE id = ?"

  const {id, name, is_active} = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/terms_loan/:id', (request, response) => {
  const sql = "DELETE FROM terms_loan WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/entities_f', (request, response) => {
  const sql = "SELECT id, name, id_ruta, contact, phone_number, cellphone, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM entities_f"

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

admRoutes.get('/entities_f/:id', (request, response) => {
  let sql = "SELECT id, name, id_ruta, contact, phone_number, cellphone,"
  sql += " CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM entities_f WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/entities_f', (request, response) => {
  const sql = "INSERT INTO entities_f (name, id_ruta, contact, phone_number, cellphone, is_active) VALUES (?, ?, ?, ?, ?, ?)"
  const {name, id_ruta, contact, phone_number, cellphone, is_active} = request.body
  const params = [name, id_ruta, contact, phone_number, cellphone, is_active === 'Si' ? true : false];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    // response.send('Ok!')
    response.json(results)
  })
})

admRoutes.put('/entities_f', (request, response) => {
  const sql = "UPDATE entities_f SET name=?, id_ruta=?, contact=?, phone_number=?, cellphone=?, is_active=? WHERE id = ?"

  const {id, name, id_ruta, contact, phone_number, cellphone, is_active} = request.body
  const params = [name, id_ruta, contact, phone_number, cellphone, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/entities_f/:id', (request, response) => {
  const sql = "DELETE FROM entities_f WHERE id = ?"
  const params = [request.params.id]; 

  console.log(sql, params);
  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/sector_profesion', (request, response) => {
  let sql = "SELECT a.id, b.name as sector, c.name as profesion,"
  sql += " CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM sector_profesion a"
  sql += " INNER JOIN sectors b ON b.id = a.id_sector"
  sql += " INNER JOIN profesions c ON c.id = a.id_profesion"
  sql += " ORDER BY a.id"

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

admRoutes.get('/sector_profesion/:id', (request, response) => {
  const sql = "SELECT id, id_sector, id_profesion, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM sector_profesion WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/sector_profesion', (request, response) => {
  const sql = "INSERT INTO sector_profesion (id_sector, id_profesion, is_active) VALUES (?, ?)"

  const {id, id_sector, id_profesion, is_active} = request.body
  const params = [d_sector, id_profesion, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.put('/sector_profesion', (request, response) => {
  const sql = "UPDATE sector_profesion SET id_sector=?, id_profesion=?, is_active=? WHERE id = ?"

  const {id, id_sector, id_profesion, is_active} = request.body
  const params = [d_sector, id_profesion, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/sector_profesion/:id', (request, response) => {
  const sql = "DELETE FROM sector_profesion WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/entity_params', (request, response) => {
  let sql = "SELECT a.id, d.name as entity, concat(c.name, ' - ', e.name) as sector_profesion,"
  sql += " descto_chip,"
  sql += " descto_ship,"
  sql += " deuda_chip,"
  sql += " deuda_ship, id_entity_f as id_entity,"
  sql += " mount_min,mount_max,plazo_max,tasa,comision,"
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM entity_params a"
  sql += " INNER JOIN entities_f d on d.id = id_entity_f"
  sql += " INNER JOIN sector_profesion b on b.id=a.id_sector_profesion"
  sql += " INNER JOIN sectors c on c.id=b.id_sector"
  sql += " INNER JOIN profesions e on e.id=b.id_profesion"
  sql += " ORDER BY a.id"

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

admRoutes.get('/entity_params/:id', (request, response) => {
  let sql = "SELECT a.id, id_entity_f, id_sector_profesion,"
  sql += " descto_chip,"
  sql += " descto_ship,"
  sql += " deuda_chip,"
  sql += " deuda_ship,"
  sql += " mount_min,mount_max,plazo_max,tasa,comision,"
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM entity_params a"
  sql += " INNER JOIN entities_f d on d.id = id_entity_f"
  sql += " INNER JOIN sector_profesion b on b.id=a.id_sector_profesion"
  sql += " INNER JOIN sectors c on c.id=b.id_sector"
  sql += " INNER JOIN profesions e on e.id=b.id_profesion"
  sql += " WHERE a.id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/entity_params', (request, response) => {
  let sql = "INSERT INTO entity_params ("
  sql += " id_entity_f, id_sector_profesion,"
  sql += " descto_chip, descto_ship, deuda_chip, deuda_ship,"
  sql += " plazo_max, tasa, comision, mount_min, mount_max, is_active"
  sql += " ) VALUE (?,?,?,?,?,?,?,?,?,?,?,?)"

  const {id_entity_f,id_sector_profesion,descto_ship, descto_chip, deuda_chip, deuda_ship,plazo_max,tasa,comision,mount_min,mount_max, is_active} = request.body
  const params = [id_entity_f,id_sector_profesion,descto_ship, descto_chip, deuda_chip, deuda_ship,plazo_max,tasa,comision,mount_min,mount_max,is_active === 'Si' ? true : false]

  console.log(params, sql);
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.put('/entity_params', (request, response) => {
  // const sql = "UPDATE sector_profesion SET id_sector=?, id_profesion=?, is_active=? WHERE id = ?"
  let sql = "UPDATE entity_params SET "
  sql += " id_entity_f=?,id_sector_profesion=?,"
  sql += " descto_chip=?,"
  sql += " descto_ship=?,"
  sql += " deuda_chip=?,"
  sql += " deuda_ship=?,"
  sql += " mount_min=?,mount_max=?,plazo_max=?,tasa=?,comision=?,is_active=?"
  sql += " WHERE id=?"

  const {id,id_entity_f,id_sector_profesion,descto_ship, descto_chip, deuda_chip, deuda_ship,plazo_max,tasa,comision,mount_min,mount_max, is_active} = request.body
  const params = [id_entity_f,id_sector_profesion,descto_chip, descto_ship, deuda_chip, deuda_ship,mount_min,mount_max,plazo_max,tasa,comision,is_active === 'Si' ? true : false,id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/entity_params/:id', (request, response) => {
  const sql = "DELETE FROM entity_params WHERE id = ?"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/users', (request, response) => {
  let sql = "SELECT a.id,email,a.name,phoneNumber,cellPhone,b.role,"
  sql += " CASE WHEN a.is_new THEN 'Si' ELSE 'No' END as is_new,"
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM users a"
  sql += " INNER JOIN roles b on b.id = a.id_role"
  sql += " ORDER BY a.id"

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

admRoutes.get('/users/:id', (request, response) => {
  let sql = "SELECT a.id,email,a.name,phoneNumber,cellPhone,"
  sql += " a.id_role,entity_f,address,"
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active,"
  sql += " CASE WHEN a.is_new THEN 'Si' ELSE 'No' END as is_new"
  sql += " FROM users a"
  sql += " INNER JOIN roles b on b.id = a.id_role"
  sql += " WHERE a.id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/users', async (request, response) => {
  let sql = "INSERT INTO users (id_role,email,hash,entity_f,name,"
  sql += " address,phoneNumber,cellPhone,is_new,is_active)"
  sql += " value (?,?,?,?,?,?,?,?,true,?)"
  
  const {id_role,email,entity_f,name,address,phoneNumber,cellPhone,is_active} = request.body
  try {
    const hash = await bcrypt.hash('123456', 10)
    const params = [id_role,email,hash,entity_f,name,address,phoneNumber,cellPhone,is_active === 'Si' ? true : false]

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.sqlMessage)
        response.status(500)
      } 
      response.send('Ok!')
    })
  } catch (error) {
    logger.error('Error hash:', error.message)
  }
})

admRoutes.put('/users', (request, response) => {
  let sql = "UPDATE users SET id_role=?,email=?,entity_f=?,name=?,"
  sql += " address=?,phoneNumber=?,cellPhone=?,is_new=?,is_active=?"
  sql += " WHERE id=? AND id <> 1"

  const {id,id_role,email,entity_f,name,address,phoneNumber,cellPhone,is_new,is_active} = request.body
  const params = [id_role,email,entity_f,name,address,phoneNumber,cellPhone,is_new === 'Si' ? true : false,is_active === 'Si' ? true : false, id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/users/:id', (request, response) => {
  const sql = "DELETE FROM users WHERE id = ? and id_role <> 1"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



admRoutes.get('/roles', (request, response) => {
  let sql = "SELECT id,role,description"
  sql += " FROM roles"
  sql += " ORDER BY id"

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

admRoutes.get('/roles/:id', (request, response) => {
  let sql = "SELECT id,role,description"
  sql += " FROM roles"
  sql += " WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
}) 

admRoutes.post('/roles', (request, response) => {
  let sql = "INSERT INTO roles (role,description)"
  sql += " value (?,?)"
  
  const {role,description} = request.body
  const params = [role,description]

  console.log(params, sql);
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.put('/roles', (request, response) => {
  let sql = "UPDATE roles SET role=?,description=?"
  sql += " WHERE id=?"

  const {id,role,description} = request.body
  const params = [role,description,id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    response.send('Ok!')
  })
})

admRoutes.delete('/roles/:id', (request, response) => {
  const sql = "DELETE FROM roles WHERE id = ? and role <> 'Admin'"
  const params = [request.params.id]; 

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      response.status(500)
    } 
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      response.status(500)
    }
  })
})



module.exports = admRoutes