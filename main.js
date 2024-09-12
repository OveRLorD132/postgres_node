"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Postgres_1 = require("./Postgres");
var psql = new Postgres_1.default({
    password: process.env.PG_PASS,
    database: 'conferences'
});
psql.query("SELECT * FROM users").then(function (data) {
    console.log(data);
    psql.query("SELECT * FROM calls").then(function (data) {
        console.log(data);
    }).catch(function (error) {
        console.log(error.message);
    });
});
psql.query("SOME ERROR QUERY").then(function (data) {
    console.log(data);
}).catch(function (error) {
    console.log(error.message);
    psql.query("SELECT * FROM users").then(function (data) {
        console.log(data);
    });
});
