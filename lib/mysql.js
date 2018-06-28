/**
 * Created by MamoMosheTesema on 6/27/2018.
 */

const mysql = require('mysql');
const config = require('./../config/default');
const connection =  mysql.createConnection({
    host     : process.env.db_url || config.DBAddress,
    user     : process.env.db_user || config.DBUsername,
    password : process.env.db_pass || config.DBPassword,
    database : process.env.db || config.DBName
});

/**
 * connect to mysql server
 * @return {Promise<void>}
 */
connect = async () => {
    return new Promise((resolve, reject) => {
        if(!connection.threadId) {
            connection.connect(function (err) {
                if (err) reject(err);
                resolve(connection);
            });
        } else {
            resolve(connection)
        }
    });
};

getRowById = async (con, id) => {
    return new Promise((resolve, reject) => {
        //where id= ${connection.escape(id)}`
        con.query(`SELECT * FROM ${config.table} where id= ${connection.escape(id)}`, function (error, results, fields) {
            if (error) throw reject(error);
            if(results.length > 0){
                resolve(results);
            } else {
                resolve([])
            }
        });
    })
};

putVast = async (con, query) => {
    return await new Promise((resolve, reject) => {
        const {vastURL, position = 'bottom_right', hideUI = false } = query;
        con.query(`INSERT INTO ${config.table}  (vast_url,position,hide_ui) VALUES (${con.escape(vastURL)},${con.escape(position)},${con.escape(hideUI)})`, function (error, results, fields) {
            if (error) reject(error);
            resolve(results);
        });
    })
};

module.exports = {connect , getRowById, putVast};