const appRoutes = require('express').Router()
const config = require('../utils/config')

appRoutes.get('/', (request, response) => {
  response.send('Hola Mundo!!!')
})

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
  let sql = "select a.id as id, short_name as sector, c.name as name,"
  sql += " '' as professions,"
  sql += " 0 as discount_capacity,"
  sql += " 0 as debt_capacity,"
  sql += " 0 as debt_capacity_mortgage,"
  sql += " true as is_active"
  sql += " from capacidad a"
  sql += " inner join sectors b on b.id=a.id_sector"
  sql += " inner join profesions c on c.id=a.id_profesion"
  
  config.cnn.query(sql, (error, results) => {
    if (error) throw error
    if (results.length > 0) {
      response.json(results)
    } else {
      response.send('Not results!')
    }
  })

  
  // return response.json([
  //   { 
  //     id: 8, 
  //     professions: [
  //       { id: 1, name: 'Planilla 14 (Jubilados por edad)' },
  //       { id: 2, name: 'Planilla 24 (Jubilados por edad con fondo complementario)' },
  //       { id: 3, name: 'Planilla 17 (Jubilación anticipada por Leyes Especiales)' },
  //       { id: 4, name: 'Planilla 27 (Jubilación anticipada con fondo complementario – Leyes especiales)' },
  //       { id: 5, name: 'Planilla 19 (Jubilación por años de servicios – Policías, Educadores, Médicos y Enfermeras)' },
  //       { id: 6, name: 'Planilla 29 (Jubilación por años de servicios con fondo complementario)' },
  //       { id: 7, name: 'Planilla 34 (Pensión de vejez por retiro anticipado)' },
  //       { id: 8, name: 'Planilla 35(Pensión de retiro por vejez proporcional)' },
  //       { id: 9, name: 'Planilla 36 (Pensión de retiro por vejez proporcional anticipada)' },
  //       { id: 10, name: 'Planilla 37 (Pensión especiales – trabajadores agrícolas y construcción)' },
  //       { id: 11, name: 'Planilla 13( Solo por excepción)' },
  //       { id: 12, name: 'Planilla 23( Solo por excepción)' },
  //       { id: 13, name: 'Planilla 20 y 25 (viudas ) ( Solo por excepción)' },
        
  //     ],
  //     sector: 'J', 
  //     name: 'Jubilado',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },

  //   { 
  //     id: 2, 
  //     professions: [
  //       { id: 1, name: 'Priv Profesion 1' },
  //       { id: 2, name: 'Priv Profesion 2' }
  //     ],
  //     sector: 'P', 
  //     name: 'Médicos/ Enfermeras',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },
  //   { 
  //     id: 3, 
  //     professions: [],
  //     sector: 'P', 
  //     name: 'Educadores',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },
  //   { 
  //     id: 4, 
  //     professions: [],
  //     sector: 'P', 
  //     name: 'Otros',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },

  //   { 
  //     id: 5, 
  //     professions: [
  //       { id: 1, name: 'Pub Profesion 1' },
  //       { id: 2, name: 'Pub Profesion 2' }
  //     ],
  //     sector: 'Pb', 
  //     name: 'Médicos/ Enfermeras',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },
  //   { 
  //     id: 6, 
  //     professions: [],
  //     sector: 'Pb', 
  //     name: 'Educadores',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },
  //   { 
  //     id: 7, 
  //     professions: [],
  //     sector: 'Pb', 
  //     name: 'Administrativos de Gobierno',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },
  //   { 
  //     id: 8, 
  //     professions: [
  //       { id: 3, name: 'ACP Profesion 3' },
  //       { id: 4, name: 'ACP Profesion 4' }
  //     ],
  //     sector: 'Pb', 
  //     name: 'ACP',
  //     discount_capacity: 'capdescto',
  //     debt_capacity: 'deuda',
  //     debt_capacity_mortgage: 'hipot',
  //     is_active: true
  //   },
  // ])
})

appRoutes.get('/laboral_status', (request, response) => {
  const sql = "SELECT name, is_active FROM laboral_status"

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
  const sql = "SELECT * FROM housings"

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
  const sql = "SELECT * FROM purposes"

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

module.exports = appRoutes