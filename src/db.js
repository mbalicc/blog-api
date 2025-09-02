const  sql=require("mssql")


const config = {
    user: "bloguser",
    password: "meho12345",
    server: "localhost",
    database: "BlogDB",
    options: {
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port:1433
};


const pool = new sql.ConnectionPool(config);

const poolConnect=pool.connect()
    .then(() => console.log("Connected to SQL Server"))
    .catch(err => console.error("DB connection failed:", err));

module.exports = {
    sql,
    pool,
    poolConnect
};