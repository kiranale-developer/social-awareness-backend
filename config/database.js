import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.MYSQL_URL);

export default pool;
// // // FOR LOCAL
// // import mysql from 'mysql2/promise';
// // import dotenv from 'dotenv';
// // dotenv.config();

// // const pool = mysql.createPool({
// //   host: process.env.DB_HOST,
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASSWORD,
// //   database: process.env.DB_NAME,
// // });

// // export default pool;

// //FOR RAILWAY
// import mysql from 'mysql2/promise';
// // import dotenv from 'dotenv';

// // dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
//   port: Number(process.env.MYSQLPORT),
// });



// export default pool;
