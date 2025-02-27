import mysql from 'mysql2/promise'
import ENVIRONMENT from './environment.js'

const pool = mysql.createPool({
    host: ENVIRONMENT.MYSQL.HOST,
    user: ENVIRONMENT.MYSQL.USERNAME,
    password: ENVIRONMENT.MYSQL.PASSWORD,
    database: ENVIRONMENT.MYSQL.DB_NAME
})

export default pool