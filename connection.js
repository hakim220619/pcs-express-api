const mysql = require("mysql");
var connection = mysql.createPool({
    host: 'localhost',
    user: 'sppappco_pcs',
    password: 'Pcs123456789**',
    database: 'sppappco_pcs',
});

module.exports = connection;
