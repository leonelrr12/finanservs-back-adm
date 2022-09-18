const bcrypt = require('bcryptjs')
const admRoutes = require('express').Router()
const logger = require('../utils/logger')
const nodemailer = require('nodemailer')

const {
  google
} = require('googleapis')
const config = require('../utils/config')
const OAuth2 = google.auth.OAuth2

// const { sendEmail: key } = config
const {
  sendGEmail: key
} = config
const OAuth2Client = new OAuth2(key.clientId, key.clientSecret, key.redirectUri)
OAuth2Client.setCredentials({
  refresh_token: key.refreshToken
})


admRoutes.get('/', (request, response) => {
  response.send('Hola Mundo!!! Desde Admin Routes')
})

admRoutes.get('/verifyConnection', (req, res) => {

  const sql = "SELECT now() as 'Hoy es';"
  config.cnn.query(sql, (error, rows) => {
    if (error) {
      cnn.connect(error => {
        if (error) {
          logger.error('Error SQL:', error.message)
          res.status(500)
        }
        res.status(200);
      })
    }
    res.json(rows);
  })
})


admRoutes.post('/send-email', async (req, res) => {
  let {
    id,
    email,
    nombre,
    cedula,
    monto,
    celular,
    fcreate,
    dias,
    asunto,
    mensaje,
    email_banco,
    email_sponsor,
    estado,
    comentarios
  } = req.body

  let emails = email + ", guasimo01@gmail.com, rsanchez2565@gmail.com"
  if (email_banco.length > 4) emails += ", " + email_banco
  if (email_sponsor.length > 4) emails += ", " + email_sponsor

  let color = " black;'"
  if (estado === "Aprobado") color = " green;'"
  if (estado === "Rechazado") color = " red;'"

  const htmlEmail = `
    <h2 style='color: ${color}>Nuevo Estatus: ${estado}</h2>
    <ul>
      <li>Solicitud No.: ${id}</li>
      <li>Estimado: ${nombre}</li>
      <li>Cédula No.: ${cedula}</li>
      <li>Email: ${email}</li>
      <li>Teléfono: ${celular}</li>
      <li>Fecha Solicitud: ${fcreate}</li>
      <li>Monto Solicitado: ${monto}</li>
      <li>Dias transcurridos: ${dias}</li>
      <li>Comentarios: ${comentarios}</li>
    </ul>
    <h3>Mensaje</h3>
    <p>${mensaje}</p>
  `

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'alt1.aspmx.l.google.com.',
    port: 587,
    secure: false, // true for 465, false for other ports 
    auth: {
        user: config.EMAIL_USER, // generated ethereal user
        pass: config.EMAIL_PASS  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  }); 

  const mailOptions = {
    from: config.EMAIL_FROM, // sender address
    to: emails, // list of receivers
    subject: asunto, // Subject line
    text: mensaje, // message body
    html: htmlEmail, // plain text body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return console.log(err)
    }
    console.log('Message sent: %s', info.messageId);   
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('contact', { msg:'Email has been sent' });
  })
})
admRoutes.post('/send-gsuit', async (req, res) => {
  let {
    id,
    email,
    nombre,
    cedula,
    monto,
    celular,
    fcreate,
    dias,
    asunto,
    mensaje,
    email_banco,
    email_sponsor,
    estado,
    comentarios
  } = req.body

  let emails = email + ", guasimo01@gmail.com, rsanchez2565@gmail.com"
  if (email_banco.length > 4) emails += ", " + email_banco
  if (email_sponsor.length > 4) emails += ", " + email_sponsor

  nodemailer.createTestAccount((err, account) => {
    let color = " black;'"
    if (estado === "Aprobado") color = " green;'"
    if (estado === "Rechazado") color = " red;'"

    const htmlEmail = `
      <h2 style='color: ${color}>Nuevo Estatus: ${estado}</h2>
      <ul>
        <li>Solicitud No.: ${id}</li>
        <li>Estimado: ${nombre}</li>
        <li>Cédula No.: ${cedula}</li>
        <li>Email: ${email}</li>
        <li>Teléfono: ${celular}</li>
        <li>Fecha Solicitud: ${fcreate}</li>
        <li>Monto Solicitado: ${monto}</li>
        <li>Dias transcurridos: ${dias}</li>
        <li>Comentarios: ${comentarios}</li>
      </ul>
      <h3>Mensaje</h3>
      <p>${mensaje}</p>
    `

    const send_mail = async () => {
      // const accessToken = await OAuth2Client.getAccessToken()
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: key.EMAIL_USER,
            clientId: key.clientId,
            clientSecret: key.clientSecret,
            refreshToken: OAuth2Client.refreshToken,
            accessToken: OAuth2Client.accessToken,
          },
          tls: {
            rejectUnauthorized: false
          }
        })

        const mailOptions = {
          from: key.EMAIL_FROM,
          to: emails,
          subject: asunto,
          text: mensaje,
          html: htmlEmail
        }

        const result = await transporter.sendMail(mailOptions)
        transporter.close()
        // console.log(result)
        return result
      } catch (err) {
        console.log('Estamos aqui: ', err)
      }
    }
    send_mail()
      .then(r => res.status(200).send('Enviado!'))
      .catch(e => console.log(e))
  })
})
admRoutes.get("/email-estado/:id", (request, response) => {
  let sql = "SELECT a.id, id_personal as cedula,"
  sql += " a.name as nombre, a.email as email, a.cellphone as celular,"
  sql += " loanPP as monto, fcreate, d.name as estado,"
  sql += " coalesce(b.email,'') as email_sponsor,"
  sql += " coalesce(c.emails,'') as email_banco,"
  sql += " coalesce(a.comentarios,'') as comentarios,"
  sql += " timestampdiff(DAY, a.fcreate, now()) as dias"
  sql += " FROM prospects a"
  sql += " LEFT JOIN referidos b ON b.id = a.id_referido"
  sql += " LEFT JOIN entities_f c ON c.id_ruta = a.entity_f"
  sql += " LEFT JOIN estados_tramite d ON d.id = a.estado"
  sql += " WHERE a.id = ?"

  const {
    id
  } = request.params;
  const params = [id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error("Error SQL:", error.message);
      return response.status(500);
    }
    if (results && results.length > 0) {
      response.json(results);
    } else {
      response.json([]);
    }
  });
});


admRoutes.get("/sponsor/:id", (request, response) => {
  let sql = "SELECT nombre, apellidos, email, celular";
  sql += " FROM referidos";
  sql += " WHERE id in (";
  sql += " SELECT id_ref FROM referidos";
  sql += " WHERE id=? )";

  const {
    id
  } = request.params;
  const params = [id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error("Error SQL:", error.message);
      return response.status(500);
    }
    if (results && results.length > 0) {
      response.json(results);
    } else {
      response.json([]);
    }
  });
});
admRoutes.get("/red-sponsor", (request, response) => {
  let sql = "SELECT a.id, id_ref, concat(a.nombre,' ',apellidos) as Nombre, a.email, celular, dateCreated,"
  sql += " (SELECT concat(nombre,' ',apellidos) FROM finanservs.referidos WHERE id = a.id_ref) as Sponsor,"
  sql += " coalesce(c.name,'Sin Estado') as Estado, b.fcreate, b.loanPP"
  sql += " FROM referidos a"
  sql += " LEFT JOIN prospects b ON b.id_referido = a.id"
  sql += " LEFT JOIN estados_tramite c ON c.id = b.estado"
  sql += " WHERE id_Ref > 0"
  sql += " ORDER BY id_ref"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error("Error SQL:", error.message);
      return response.status(500);
    }
    if (results && results.length > 0) {
      response.json(results);
    } else {
      response.json([]);
    }
  });
});



admRoutes.get('/prospects_sign/:id', (request, response) => {

  const sql = "SELECT sign FROM prospects WHERE id = ?;"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})


admRoutes.get('/prospects/entity_fN/:entity_f', (request, response) => {
  sql = " SELECT a.id as 'ID', c.name as Estado, datediff(now(), fcreate) as 'Dias Antiguedad' ,id_personal as 'Cédula Id', a.name as Nombre,"
  sql += " e.name as 'Sector',f.name as Profesión,"
  sql += " CASE WHEN profession=1 THEN 'Empresa Privada' WHEN profession=3 THEN 'Educador' WHEN profession=4 THEN t.name WHEN profession=5 THEN m.titulo WHEN  profession=6 THEN r.name WHEN profession=7 THEN s.name ELSE n.titulo END as 'Ocupación',"
  sql += " salary as Salario, loanPP as 'Préstamo Personal', cashOnHand as 'Efectivo en Mano', plazo as Plazo,"
  sql += " loanAuto as 'Préstamo Automóvil', loanTC as 'Préstamo TC', loanHip as 'Préstamo Hipoteca',"
  sql += " d.name as 'Contrato Trabajo', a.email as Email,"
  sql += " a.cellphone as Celular, a.phoneNumber as 'Télefono', b.name as Entidad, "
  sql += " CASE WHEN gender='female' THEN 'Mujer' ELSE 'Hombre' END as Genero, birthDate as 'Fecha Nacimiento',"
  sql += " l.name as 'Fecuencia Pago', g.name as 'Tipo Residencia', `residenceMonthly` as 'Pago Casa o Alquiler',"

  sql += " '---------------' as 'Trabajo Actual',"
  sql += " a.`work_name` as 'Empresa',"
  sql += " `work_cargo` as 'Cargo',"
  sql += " `work_address` as 'Dirección',"
  sql += " `work_phone` as 'Teléfono',"
  sql += " a.`work_phone_ext` as 'Extensión',"
  sql += " `work_month` as 'Antiguedad (meses)',"
  sql += " `work_prev_name` as 'Trabajo Anterior',"
  sql += " `work_prev_month` as 'Duración',"

  sql += " k.name as 'Estado Civil', h.name as Provincia, i.name as Distrito, j.name as Corregimiento,"
  sql += " `barrio_casa_calle` as 'Barrio casa calle',"
  sql += " o.name as Ejecutivo, comentarios as Comentarios,"

  sql += " '---------------' as 'Referencias Familiares',"
  sql += " p.`name` as 'Nombre',"
  sql += " p.`apellido` as 'Apellido',"
  sql += " p.`parentesco` as 'Parentesco',"
  sql += " p.`cellphone` as 'Celular',"
  sql += " p.`phonenumber` as 'Telefono Casa',"
  sql += " p.`work_name` as 'Donde Trabaja',"
  sql += " p.`work_phonenumber` as 'Telefono',"
  sql += " p.`work_phone_ext` as 'Extensión',"

  sql += " '---------------' as 'Referencias No Familiares',"
  sql += " q.`name` as 'Nombre',"
  sql += " q.`apellido` as 'Apellido',"
  sql += " q.`parentesco` as 'Parentesco',"
  sql += " q.`cellphone` as 'Celular',"
  sql += " q.`phonenumber` as 'Telefono Casa',"
  sql += " q.`work_name` as 'Donde Trabaja',"
  sql += " q.`work_phonenumber` as 'Telefono',"
  sql += " q.`work_phone_ext` as 'Extensión',"

  sql += " fcreate as 'Creado el',"

  sql += " idUrl as '_Cédula',"
  sql += " socialSecurityProofUrl as '_Ficha Seguro Social',"
  sql += " payStubUrl as '_Comprobante de Pago',"
  sql += " publicGoodProofUrl as '_Recibo Entidad Publica',"
  sql += " workLetterUrl as '_Carta de Trabajo',"
  sql += " apcLetterUrl as '_Autorización APC',"
  sql += " apcReferenceUrl as '_Referencias APC'"

  sql += " FROM prospects a"
  sql += " INNER JOIN entities_f b ON b.id_ruta=a.entity_f"
  sql += " INNER JOIN estados_tramite c ON c.id=a.estado"

  sql += " LEFT JOIN profesions_acp m ON m.id=a.occupation"
  sql += " LEFT JOIN profesions_lw n ON n.id=a.occupation"
  sql += " LEFT JOIN ranges_pol r ON r.id=a.occupation"
  sql += " LEFT JOIN planillas_j s ON s.id=a.occupation"
  sql += " LEFT JOIN institutions t ON t.id=a.occupation"

  sql += " LEFT JOIN laboral_status d ON d.id=a.contractType"
  sql += " LEFT JOIN sectors e ON e.id=a.jobSector"
  sql += " LEFT JOIN profesions f ON f.id=a.profession"
  sql += " LEFT JOIN housings g ON g.id=a.residenceType"
  sql += " LEFT JOIN provinces h ON h.id=a.province"
  sql += " LEFT JOIN districts i ON i.id=a.district"
  sql += " LEFT JOIN counties j ON j.id=a.county"
  sql += " LEFT JOIN civil_status k ON k.id=a.civil_status"
  sql += " LEFT JOIN payments l ON l.id=a.paymentFrecuency"
  sql += " LEFT JOIN users o ON o.id=a.ejecutivo"
  sql += " left JOIN ref_person_family p ON p.id_prospect=a.id"
  sql += " left JOIN ref_person_no_family q ON q.id_prospect=a.id"
  sql += " WHERE a.entity_f = ?;"

  const params = [request.params.entity_f];

  // console.log(sql)

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})
admRoutes.get('/prospects/entity_f/:entity_f', (request, response) => {

  const body = JSON.stringify(request.params.entity_f).replace('"', '').replace('"', '')
  let [Role = '0', Tipo_Agente, Agente, Ruta, fdesde = '', fhasta = ''] = body.split(',')

  sql = " SELECT a.id as 'A1ID', c.name as A2Estado,id_personal as 'A4Cédula Id', a.name as A5Nombre,"
  sql += " e.name as 'B1Sector',f.name as B2Profesión,"
  sql += " CASE WHEN profession=1 THEN 'Empresa Privada' WHEN profession=3 THEN 'Educador' WHEN profession=4 THEN t.name WHEN profession=5 THEN m.titulo WHEN  profession=6 THEN r.name WHEN profession=7 THEN s.name ELSE n.titulo END as 'B3Ocupación',"
  sql += " salary as B5Salario, loanPP as 'B6Préstamo Personal', cashOnHand as 'B7Efectivo en Mano', plazo as B8Plazo, monthlyPay as B9Letra,"
  sql += " loanAuto as 'C1Préstamo Automóvil', loanTC as 'C2Préstamo TC', loanHip as 'C3Préstamo Hipoteca',"
  sql += " a.email as C5Email,"
  sql += " k.name as 'C5Estado Civil',"
  sql += " a.cellphone as C6Celular, a.phoneNumber as 'C7Télefono', b.name as C8Entidad, "
  sql += " CASE WHEN gender='female' THEN 'Mujer' ELSE 'Hombre' END as D1Genero, birthDate as 'D2Fecha Nacimiento',"
  sql += " l.name as 'D3Fecuencia Pago', g.name as 'D4Tipo Residencia', `residenceMonthly` as 'D5Pago Casa o Alquiler',"

  sql += " '---------------' as 'E1Trabajo Actual',"
  sql += " a.`work_name` as 'E2Empresa',"
  sql += " d.name as 'E3Contrato Trabajo',"
  sql += " `work_cargo` as 'E3Cargo',"
  sql += " `work_address` as 'E4Dirección',"
  sql += " `work_phone` as 'E5Teléfono',"
  sql += " a.`work_phone_ext` as 'E6Extensión',"
  sql += " `work_month` as 'E7Antiguedad (meses)',"
  sql += " `work_prev_name` as 'E8Trabajo Anterior',"
  sql += " `work_prev_month` as 'E9Duración',"
  sql += " `work_prev_salary` as 'E9Salario',"

  sql += " '---------------' as 'F1Dirección Residencial',"
  sql += " h.name as F2Provincia, i.name as F3Distrito, j.name as F4Corregimiento,"
  sql += " `barrio_casa_calle` as 'F5Barrio casa calle',"
  sql += " o.name as F6Ejecutivo, comentarios as F7Comentarios,"

  sql += " '---------------' as 'G1Referencias Familiares',"
  sql += " p.`name` as 'G2Nombre',"
  sql += " p.`apellido` as 'G3Apellido',"
  sql += " p.`parentesco` as 'G4Parentesco',"
  sql += " p.`cellphone` as 'G5Celular',"
  sql += " p.`phonenumber` as 'G6Telefono Casa',"
  sql += " p.`work_name` as 'G7Donde Trabaja',"
  sql += " p.`work_phonenumber` as 'G8Telefono',"
  sql += " p.`work_phone_ext` as 'G9Extensión',"

  sql += " '---------------' as 'H1Referencias No Familiares',"
  sql += " q.`name` as 'H2Nombre',"
  sql += " q.`apellido` as 'H3Apellido',"
  sql += " q.`parentesco` as 'H4Parentesco',"
  sql += " q.`cellphone` as 'H5Celular',"
  sql += " q.`phonenumber` as 'H6Telefono Casa',"
  sql += " q.`work_name` as 'H7Donde Trabaja',"
  sql += " q.`work_phonenumber` as 'H8Telefono',"
  sql += " q.`work_phone_ext` as 'H9Extensión',"

  sql += " a.estado as 'n1Estado',"
  sql += " date_format(fcreate, '%d/%m/%Y') as 'n2Creado el',"

  sql += " idUrl as '_n3Cédula',"
  sql += " socialSecurityProofUrl as '_n4Ficha Seguro Social',"
  sql += " payStubUrl as '_n5Comprobante de Pago',"
  sql += " publicGoodProofUrl as '_n6Recibo Servicio Público',"
  sql += " workLetterUrl as '_n7Carta de Trabajo',"
  sql += " apcLetterUrl as '_n8Autorización APC',"
  sql += " apcReferenceUrl as '_n9Referencias APC', a.entity_f as 'zzzEntity_No'"

  sql += " FROM prospects a"
  sql += " INNER JOIN entities_f b ON b.id_ruta=a.entity_f"
  sql += " INNER JOIN estados_tramite c ON c.id=a.estado"
  sql += " LEFT JOIN profesions_acp m ON m.id=a.occupation"
  sql += " LEFT JOIN profesions_lw n ON n.id=a.occupation"

  sql += " LEFT JOIN ranges_pol r ON r.id=a.occupation"
  sql += " LEFT JOIN planillas_j s ON s.id=a.occupation"
  sql += " LEFT JOIN institutions t ON t.id=a.occupation"

  sql += " LEFT JOIN laboral_status d ON d.id=a.contractType"
  sql += " LEFT JOIN sectors e ON e.id=a.jobSector"
  sql += " LEFT JOIN profesions f ON f.id=a.profession"
  sql += " LEFT JOIN housings g ON g.id=a.residenceType"
  sql += " LEFT JOIN provinces h ON h.id=a.province"
  sql += " LEFT JOIN districts i ON i.id=a.district"
  sql += " LEFT JOIN counties j ON j.id=a.county"
  sql += " LEFT JOIN civil_status k ON k.id=a.civil_status"
  sql += " LEFT JOIN payments l ON l.id=a.paymentFrecuency"
  sql += " LEFT JOIN users o ON o.id=a.ejecutivo"
  sql += " left JOIN ref_person_family p ON p.id_prospect=a.id"
  sql += " left JOIN ref_person_no_family q ON q.id_prospect=a.id"
  sql += " WHERE a.entity_f = ?"
  if (fdesde !== '' && fhasta != '') {
    fhasta = fhasta + " 23:59:59"
    sql += " and a.fcreate >= ? and a.fcreate <= ?"
  }
  if (Role !== '1') {
    if (Tipo_Agente !== '1') {
      sql += " and a.id_agente = ?"
    }
  }

  const params = [Ruta, fdesde, fhasta, Agente];
  // console.log(Ruta, fdesde, fhasta, sql)

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    // console.log(results)
    if (results.length > 0) {
      response.json(results)
    } else {
      response.json([])
    }
  })
})
admRoutes.get('/prospects/entity_f/:entity_f/:id', (request, response) => {
  let sql = "SELECT id, estado, comentarios FROM prospects WHERE id = ?;"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
})
admRoutes.put('/prospects/estado', (request, response) => {
  let sql = "UPDATE prospects SET estado=?, comentarios=?, ejecutivo=?, loanPP=?, plazo=?, monthlyPay=?,"
  sql += "fupdate=now() WHERE id = ?"

  const body = request.body
  // console.log(body)

  const params = [body.estado, body.comentarios, body.ejecutivo, body.monto, body.plazo, body.letra, body.id]

  // console.log(sql, params)
  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})


admRoutes.get('/prospects/update', (request, response) => {
  let sql = "select id,id_personal,name,cellphone FROM prospects"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})
admRoutes.get('/prospects/update/:id', (request, response) => {
  let sql = "select id,id_personal,fname,fname_2,lname,lname_2,"
  sql += " entity_f,estado,email,cellphone,phoneNumber,gender,birthDate,"
  sql += " contractType,jobSector,occupation,paymentFrecuency,profession,"
  sql += " civil_status,province,district,county,"
  sql += " loanPP,cashOnHand,plazo,reason,"
  sql += " residenceType,residenceMonthly,work_name,work_cargo,"
  sql += " work_address,work_phone,work_phone_ext,work_month,"
  sql += " work_prev_name,work_prev_month,work_prev_salary,"
  sql += " disponible,salary,honorarios,viaticos,nationality,"
  sql += " calle,barriada_edificio,no_casa_piso_apto,fcreate"
  sql += " FROM prospects"
  sql += " WHERE id = ?"

  const params = request.params.id;
  // console.log(params, sql)

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})
admRoutes.put('/prospects/update', (request, response) => {
  let sql = "update prospects SET"
  sql += " name=?,fname=?,fname_2=?,lname=?,lname_2=?,"
  sql += " entity_f=?,estado=?,email=?,cellphone=?,phoneNumber=?,gender=?,birthDate=?,"
  sql += " contractType=?,jobSector=?,occupation=?,paymentFrecuency=?,profession=?,"
  sql += " civil_status=?,province=?,district=?,county=?,"
  sql += " loanPP=?,cashOnHand=?,plazo=?,reason=?,"
  sql += " residenceType=?,residenceMonthly=?,work_name=?,work_cargo=?,"
  sql += " work_address=?,work_phone=?,work_phone_ext=?,work_month=?,"
  sql += " work_prev_name=?,work_prev_month=?,work_prev_salary=?,"
  sql += " disponible=?,salary=?,honorarios=?,viaticos=?,nationality=?,"
  sql += " calle=?, barriada_edificio=?,no_casa_piso_apto=?,"
  sql += " fupdate=now() WHERE id = ?"

  const body = request.body

  let {
    id,
    fname,
    fname_2,
    lname,
    lname_2
  } = body
  let {
    entity_f,
    estado,
    email,
    cellphone,
    phoneNumber
  } = body
  let {
    gender,
    birthDate: BDH,
    contractType,
    jobSector,
    occupation,
    paymentFrecuency
  } = body
  let {
    profession,
    civil_status,
    province,
    district,
    county
  } = body
  let {
    loanPP,
    cashOnHand,
    plazo,
    reason
  } = body
  let {
    residenceType,
    residenceMonthly,
    work_name,
    work_cargo
  } = body
  let {
    work_address = '', work_phone = '', work_phone_ext = '', work_month = 0
  } = body
  let {
    work_prev_name = 'N/A', work_prev_month = 0, work_prev_salary = 0
  } = body
  let {
    disponible = 0, salary, honorarios = 0, viaticos = 0, nationality = 0
  } = body
  let {
    calle,
    barriada_edificio,
    no_casa_piso_apto
  } = body

  let name = fname
  if (fname_2) {
    name += " " + fname_2
  }
  name += " " + lname
  if (lname_2) {
    name += " " + lname_2
  }

  const birthDate = BDH.slice(0, 10)
  const params = [
    name, fname, fname_2, lname, lname_2, entity_f, estado, email, cellphone,
    phoneNumber, gender,
    birthDate, contractType, jobSector, occupation, paymentFrecuency, profession, civil_status, province,
    district, county, loanPP, cashOnHand, plazo, reason,
    residenceType, residenceMonthly, work_name, work_cargo, work_address, work_phone, work_phone_ext, work_month,
    work_prev_name, work_prev_month, work_prev_salary,
    disponible, salary, honorarios, viaticos, nationality,
    calle, barriada_edificio, no_casa_piso_apto, id
  ]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})


admRoutes.get('/sectors', (request, response) => {
  const sql = "SELECT * FROM sectors"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO sectors (id, name, short_name) VALUES (?, ?, ?)"

    const {
      name,
      short_name
    } = request.body
    const params = [id, name, short_name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/sectors', (request, response) => {
  const sql = "UPDATE sectors SET name=?, short_name=? WHERE id = ?"

  const {
    id,
    name,
    short_name
  } = request.body
  const params = [name, short_name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/sectors/:id', (request, response) => {
  const sql = "DELETE FROM sectors WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/civilstatus', (request, response) => {
  const sql = "SELECT * FROM civil_status"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO civil_status (id, name) VALUES (?, ?)"

    const {
      name
    } = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/civilstatus', (request, response) => {
  const sql = "UPDATE civil_status SET name=? WHERE id = ?"

  const {
    id,
    name
  } = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/civilstatus/:id', (request, response) => {
  const sql = "DELETE FROM civil_status WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/profesions', (request, response) => {
  const sql = "SELECT * FROM profesions"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO profesions (id, name) VALUES (?, ?)"

    const {
      name
    } = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/profesions', (request, response) => {
  const sql = "UPDATE profesions SET name=? WHERE id = ?"

  const {
    id,
    name
  } = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/profesions/:id', (request, response) => {
  const sql = "DELETE FROM profesions WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/profesions_lw', (request, response) => {
  const sql = "SELECT count(id) totalRecord FROM profesions_lw"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  // console.log(params);
  // config.cnn.query(sql, params, (error, results) => {
  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO profesions_lw (id, titulo) VALUES (?, ?)"

    const {
      name
    } = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/profesions_lw', (request, response) => {
  const sql = "UPDATE profesions_lw SET titulo=? WHERE id = ?"
  const {
    id,
    name
  } = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/profesions_lw/:id', (request, response) => {
  const sql = "DELETE FROM profesions_lw WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/institutions', (request, response) => {
  const sql = "SELECT * FROM institutions"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO institutions (id, name) VALUES (?, ?)"

    const {
      name
    } = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/institutions', (request, response) => {
  const sql = "UPDATE institutions SET name=? WHERE id = ?"

  const {
    id,
    name
  } = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/institutions/:id', (request, response) => {
  const sql = "DELETE FROM institutions WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/planillas_j', (request, response) => {
  const sql = "SELECT * FROM planillas_j"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO planillas_j (id, name) VALUES (?, ?)"

    const {
      name
    } = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/planillas_j', (request, response) => {
  const sql = "UPDATE planillas_j SET name=? WHERE id = ?"

  const {
    id,
    name
  } = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/planillas_j/:id', (request, response) => {
  const sql = "DELETE FROM planillas_j WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/housings', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM housings"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO housings (id, name, is_active) VALUES (?, ?, ?)"

    const {
      name,
      is_active
    } = request.body
    const params = [id, name, is_active === 'Si' ? true : false];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/housings', (request, response) => {
  const sql = "UPDATE housings SET name=?, is_active=? WHERE id = ?"

  const {
    id,
    name,
    is_active
  } = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/housings/:id', (request, response) => {
  const sql = "DELETE FROM housings WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/purposes', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM purposes"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO purposes (id, name, is_active) VALUES (?, ?, ?)"

    const {
      name,
      is_active
    } = request.body
    const params = [id, name, is_active === 'Si' ? true : false];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/purposes', (request, response) => {
  const sql = "UPDATE purposes SET name=?, is_active=? WHERE id = ?"

  const {
    id,
    name,
    is_active
  } = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/purposes/:id', (request, response) => {
  const sql = "DELETE FROM purposes WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/payments', (request, response) => {
  const sql = "SELECT id, name FROM payments"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    const {
      id
    } = results[0]

    const sql = "INSERT INTO payments (id, name) VALUES (?, ?)"

    const {
      name,
      is_active
    } = request.body
    const params = [id, name];

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
      }
      response.send('Ok!')
    })
  })
})
admRoutes.put('/payments', (request, response) => {
  const sql = "UPDATE payments SET name=? WHERE id = ?"

  const {
    id,
    name
  } = request.body
  const params = [name, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/payments/:id', (request, response) => {
  const sql = "DELETE FROM payments WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/estados_tramite', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM estados_tramite"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    name,
    is_active
  } = request.body
  const params = [name, is_active === 'Si' ? true : false];

  // console.log(sql);
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.put('/estados_tramite', (request, response) => {
  const sql = "UPDATE estados_tramite SET name=?, is_active=? WHERE id = ?"

  const {
    id,
    name,
    is_active
  } = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/estados_tramite/:id', (request, response) => {

  response.send('Ok!')
  // const sql = "DELETE FROM estados_tramite WHERE id = ?"
  // const params = [request.params.id]; 

  // config.cnn.query(sql, params, (error, results) => {
  //   if (error) {
  //     logger.error('Error SQL:', error.message)
  //     return response.status(500)
  //   } 
  //   if (results.affectedRows > 0) {
  //     response.send('Ok!')
  //   } else {
  //     logger.error('Error SQL:', 'No existe registro a eliminar!')
  //     return response.status(500)
  //   }
  // })
})



admRoutes.get('/type_documents', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM type_documents"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    name,
    is_active
  } = request.body
  const params = [id, name, is_active === 'Si' ? true : false];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.put('/type_documents', (request, response) => {
  const sql = "UPDATE type_documents SET name=?, is_active=? WHERE id = ?"

  const {
    id,
    name,
    is_active
  } = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/type_documents/:id', (request, response) => {
  const sql = "DELETE FROM type_documents WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/terms_loan', (request, response) => {
  const sql = "SELECT id, name, CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active FROM terms_loan"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    name,
    is_active
  } = request.body
  const params = [id, name, is_active === 'Si' ? true : false];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.put('/terms_loan', (request, response) => {
  const sql = "UPDATE terms_loan SET name=?, is_active=? WHERE id = ?"

  const {
    id,
    name,
    is_active
  } = request.body
  const params = [name, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/terms_loan/:id', (request, response) => {
  const sql = "DELETE FROM terms_loan WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})


admRoutes.get('/entities_f', (request, response) => {
  let sql = "SELECT id, name, id_ruta, contact, phone_number, cellphone, emails, type,"
  sql += " CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM entities_f"
  sql += " WHERE id > 1"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})
admRoutes.get('/entities_f/:id', (request, response) => {
  let sql = "SELECT id, name, id_ruta, contact, phone_number, cellphone, emails, type, "
  sql += " CASE WHEN is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM entities_f WHERE id = ?"

  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results[0])
    } else {
      response.send('Not results!')
    }
  })
})
admRoutes.post('/entities_f', (request, response) => {
  const sql = "INSERT INTO entities_f (name, id_ruta, contact, phone_number, cellphone, emails, type, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  const {
    name,
    id_ruta,
    contact,
    phone_number,
    cellphone,
    emails,
    type,
    is_active
  } = request.body
  const params = [name, id_ruta, contact, phone_number, cellphone, emails, type, is_active === 'Si' ? true : false];

  // console.log(sql, params)
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    // response.send('Ok!')
    response.json(results)
  })
})
admRoutes.put('/entities_f', (request, response) => {
  const sql = "UPDATE entities_f SET name=?, id_ruta=?, contact=?, phone_number=?, cellphone=?, emails=?, is_active=? WHERE id = ?"

  const {
    id,
    name,
    id_ruta,
    contact,
    phone_number,
    cellphone,
    emails,
    is_active
  } = request.body
  const params = [name, id_ruta, contact, phone_number, cellphone, emails, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/entities_f/:id', (request, response) => {
  const sql = "DELETE FROM entities_f WHERE id = ?"
  const params = [request.params.id];

  // console.log(sql, params);
  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    id,
    id_sector,
    id_profesion,
    is_active
  } = request.body
  const params = [d_sector, id_profesion, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.put('/sector_profesion', (request, response) => {
  const sql = "UPDATE sector_profesion SET id_sector=?, id_profesion=?, is_active=? WHERE id = ?"

  const {
    id,
    id_sector,
    id_profesion,
    is_active
  } = request.body
  const params = [d_sector, id_profesion, is_active === 'Si' ? true : false, id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/sector_profesion/:id', (request, response) => {
  const sql = "DELETE FROM sector_profesion WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    id_entity_f,
    id_sector_profesion,
    descto_ship,
    descto_chip,
    deuda_chip,
    deuda_ship,
    plazo_max,
    tasa,
    comision,
    mount_min,
    mount_max,
    is_active
  } = request.body
  const params = [id_entity_f, id_sector_profesion, descto_ship, descto_chip, deuda_chip, deuda_ship, plazo_max, tasa, comision, mount_min, mount_max, is_active === 'Si' ? true : false]

  // console.log(params, sql);
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    id,
    id_entity_f,
    id_sector_profesion,
    descto_ship,
    descto_chip,
    deuda_chip,
    deuda_ship,
    plazo_max,
    tasa,
    comision,
    mount_min,
    mount_max,
    is_active
  } = request.body
  const params = [id_entity_f, id_sector_profesion, descto_chip, descto_ship, deuda_chip, deuda_ship, mount_min, mount_max, plazo_max, tasa, comision, is_active === 'Si' ? true : false, id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/entity_params/:id', (request, response) => {
  const sql = "DELETE FROM entity_params WHERE id = ?"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})


admRoutes.get('/users', (request, response) => {
  let sql = "SELECT a.id,a.email,a.name,a.phoneNumber,a.cellPhone,b.role, concat(b.id,'-',b.description) as Role,entity_f, concat(c.id,'-',c.name) as Entidad,"
  sql += " CASE WHEN a.is_new THEN 'Si' ELSE 'No' END as is_new,address,"
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active"
  sql += " FROM users a"
  sql += " INNER JOIN roles b on b.id = a.id_role"
  sql += " LEFT JOIN entities_f c on c.id = a.entity_f"
  sql += " ORDER BY a.id"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    Role,
    email,
    Entidad,
    name,
    address,
    phoneNumber,
    cellPhone,
    is_active
  } = request.body
  const id_role = Role.split('-')[0]
  const entity_f = Entidad.split('-')[0]
  try {
    const hash = await bcrypt.hash('123456', 10)
    const params = [id_role, email, hash, entity_f, name, address, phoneNumber, cellPhone, is_active === 'Si' ? true : false]

    config.cnn.query(sql, params, (error, results, next) => {
      if (error) {
        logger.error('Error SQL:', error.message)
        return response.status(500)
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
  sql += " WHERE id=?"

  const {
    id,
    Role,
    email,
    Entidad,
    name,
    address,
    phoneNumber,
    cellPhone,
    is_new,
    is_active
  } = request.body
  const id_role = Role.split('-')[0]
  const entity_f = Entidad.split('-')[0]
  const params = [id_role, email, entity_f, name, address, phoneNumber, cellPhone, is_new === 'Si' ? true : false, is_active === 'Si' ? true : false, id]

  // console.log(params)
  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/users/:id', (request, response) => {
  const sql = "DELETE FROM users WHERE id = ? and id_role <> 1"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})



admRoutes.get('/roles', (request, response) => {
  let sql = "SELECT id,role,description"
  sql += " FROM roles"
  sql += " ORDER BY id"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
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
      logger.error('Error SQL:', error.message)
      return response.status(500)
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

  const {
    role,
    description
  } = request.body
  const params = [role, description]

  // console.log(params, sql);
  config.cnn.query(sql, params, (error, results, next) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.put('/roles', (request, response) => {
  let sql = "UPDATE roles SET role=?,description=?"
  sql += " WHERE id=?"

  const {
    id,
    role,
    description
  } = request.body
  const params = [role, description, id]

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    response.send('Ok!')
  })
})
admRoutes.delete('/roles/:id', (request, response) => {
  const sql = "DELETE FROM roles WHERE id = ? and role <> 'Admin'"
  const params = [request.params.id];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.message)
      return response.status(500)
    }
    if (results.affectedRows > 0) {
      response.send('Ok!')
    } else {
      logger.error('Error SQL:', 'No existe registro a eliminar!')
      return response.status(500)
    }
  })
})

admRoutes.get('/provinces', (request, response) => {
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

admRoutes.get('/districts', (request, response) => {
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

admRoutes.get('/counties', (request, response) => {
  const sql = "SELECT * FROM counties ORDER BY name"

  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})

admRoutes.get('/nationality', (request, response) => {
  const sql = "SELECT id, name FROM nationality WHERE is_active = true"

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error('Error SQL:', error.sqlMessage)
      return response.status(500)
    }
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })
})



module.exports = admRoutes