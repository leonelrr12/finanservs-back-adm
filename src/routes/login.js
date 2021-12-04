const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const loginRouter = require("express").Router();
const config = require("../utils/config");
const logger = require("../utils/logger");

const show = async (req, res, next) => {
  try {
    res.json({
      user: {
        ...req.user.dataValues,
        jwtToken: req.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateToken = async (req, res, next) => {
  req.token = jwt.sign(
    {
      id: req.user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 2592000,
    }
  );
  next();
};

const find = async (req, res, next) => {
  let sql = "SELECT a.id, hash, a.name, a.is_active, is_new, id_role as Role,";
  sql += "  coalesce(id_ruta, 0) as Ruta";
  sql += " FROM users a left join entities_f b on a.entity_f = b.id";
  sql += " WHERE email=?";
  sql += " AND (a.is_active = true OR id_role = 1)";

  const { email, password } = req.body.user;
  const params = [email];

  try {
    config.cnn.query(sql, params, async (error, rows, fields) => {
      if (error) {
        logger.error("Error SQL:", error.message);
        return null;
      }
      if(rows) {
        const {id, hash, name, is_active, Role, Ruta} = rows[0]
        if(!is_active){
          logger.error('Error Status:', 'Usuario Bloqueado.')
          return res.sendStatus(404);
        }
        const validPass = await bcrypt.compare(password, hash)
        if(!validPass) {
          logger.error('Error Seguridad:', 'Credenciales Inválidas ...!')
          return res.sendStatus(404);
        }
        req.user = rows
        req.user.dataValues = rows[0]
        next();
      } else {
        return res.sendStatus(404);
      }
    });
  } catch (error) {
    next(error);
  }
}

loginRouter.route("/signin").post(find, generateToken, show);

loginRouter.get("/users", (request, response) => {
  let sql = "SELECT a.id,email,a.name,phoneNumber,cellPhone,b.role,";
  sql += " CASE WHEN a.is_new THEN 'Si' ELSE 'No' END as is_new,";
  sql += " CASE WHEN a.is_active THEN 'Si' ELSE 'No' END as is_active";
  sql += " FROM users a";
  sql += " INNER JOIN roles b on b.id = a.id_role";
  sql += " ORDER BY a.id";

  config.cnn.query(sql, (error, results) => {
    if (error) {
      logger.error("Error SQL:", error.message);
      response.status(500);
    }
    if (results.length > 0) {
      response.json(results);
    } else {
      response.send("Not results!");
    }
  });
});

loginRouter.get("/new-user/:email", (request, response) => {
  let sql = "SELECT is_new";
  sql += " FROM users";
  sql += " WHERE email=?";
  sql += " AND (is_active = true OR id_role = 1)";

  const { email } = request.params;
  const params = [email];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error("Error SQL:", error.message);
      response.status(500);
    }
    if (results.length > 0) {
      response.json(results[0]);
    } else {
      response.send("Not results!");
    }
  });
});


loginRouter.post("/token-verify", async (request, response) => {
  const body = request.body;
  const token = body.token;
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (token && decodedToken) {
      response.status(200).send({
        message: "Todo bien!!!",
      });
    }
  } catch (error) {
    logger.error("Error Seguridad:", "token missing or invalid");
    response.status(401).json({
      error: "token missing or invalid",
    });
  }
});

loginRouter.put("/chgpwd", async (request, response) => {
  let sql = "UPDATE users SET hash=?, is_new=false";
  sql += " WHERE email=?";

  const { email, password } = request.body;
  const hash = await bcrypt.hash(password, 10);
  const params = [hash, email];

  config.cnn.query(sql, params, (error, results) => {
    if (error) {
      logger.error("Error SQL:", error.message);
      response.status(500);
    }
    response.send("Ok!");
  });
});

module.exports = loginRouter;
