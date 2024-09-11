import { spawn } from 'child_process';
import * as fs from "node:fs/promises";



//const psql = spawn('D:\\psql\\bin\\psql.exe postgresql://postgres:Qwerty12345@localhost:5432/conferences');
//
// psql.stdin.write('SELECT * FROM users;\n', (error) => {
//   if (error) return console.log(error);
// });
//
// psql.stdout.on('data', data => {
//   console.log(data.toString());
// })
//
// psql.stderr.on('data', data => {
//   console.log(data.toString());
// })
//
// psql.on('close', (code) => {
//   console.log('Closed. Code: ' + code);
// })

parseDotenv();

async function parseDotenv() {
  const content = await fs.readFile('.env', 'utf-8');
  console.log(content);
}

