import Postgres from "./Postgres";

const psql = new Postgres({
  password: process.env.PG_PASS,
  database: 'conferences'
})

psql.query(`SELECT * FROM users`).then((data) => {
  console.log(data);
  psql.query(`SELECT * FROM calls`).then((data) => {
    console.log(data);
  }).catch((error) => {
    console.log(error.message);
  })
})

psql.query(`SOME ERROR QUERY`).then((data) => {
  console.log(data);
}).catch((error) => {
  console.log(error.message);
  psql.query(`SELECT * FROM users`).then((data) => {
    console.log(data);
  })
})

