#About

Micro implementation of psql module using NodeJS child processes.
You can change anything in main.ts to test this program on your database.

#Launch guide

1. Clone repository
   ```bash
   git clone https://github.com/OveRLorD132/postgres_node
2. Go to directory and install dependencies.
   ```bash
   cd postgres_node
   npm install
3. Add a .env file
   ```
   PSQL_PATH='path to psql.exe on your pc'
   PG_PASS='your postgres password'
5. Run project.
   ```bash
   npm start
